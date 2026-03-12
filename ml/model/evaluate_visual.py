"""
Visual evaluation report — generates plots for every task head.

Usage
-----
    cd ml/
    conda activate gpu-env
    python -m model.evaluate_visual
"""
from __future__ import annotations

import numpy as np
import torch
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    RocCurveDisplay,
    PrecisionRecallDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)

from . import config as C
from .dataset import get_dataloaders
from .model import ItineraryMultiTaskModel

REPORT_DIR = C.ROOT_DIR / "reports"
REPORT_DIR.mkdir(exist_ok=True, parents=True)

sns.set(style="whitegrid", palette="deep")


def _save(name: str):
    plt.tight_layout()
    plt.savefig(REPORT_DIR / f"{name}.png", dpi=200, bbox_inches="tight")
    print(f"  -> {name}.png")
    plt.close()


def collect_predictions():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _, _, test_dl, meta = get_dataloaders()

    ckpt = torch.load(C.CKPT_DIR / "best_model.pt", map_location=device, weights_only=False)
    print(f"Loaded checkpoint from epoch {ckpt['epoch']} (val_loss={ckpt['val_loss']:.4f})")

    model = ItineraryMultiTaskModel(
        wide_dim=meta["wide_dim"], dense_dim=meta["dense_dim"],
    ).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()

    all_accept_prob, all_accept_gt = [], []
    all_accept_logit = []
    all_next_prob, all_next_pred, all_next_gt = [], [], []
    all_budget_pred, all_budget_gt = [], []
    all_score = []

    with torch.no_grad():
        for batch in test_dl:
            batch = {k: v.to(device) for k, v in batch.items()}
            score_logit, accept_logit, next_logits, budget_pred = model(
                batch["wide"], batch["dense"],
                batch["act_ids"], batch["act_durs"],
                batch["cost_ids"], batch["seq_len"],
            )
            all_accept_logit.append(accept_logit.cpu())
            all_accept_prob.append(torch.sigmoid(accept_logit).cpu().numpy())
            all_accept_gt.append(batch["y_accept"].cpu().numpy())

            probs = torch.softmax(next_logits, dim=1).cpu().numpy()
            all_next_prob.append(probs)
            all_next_pred.append(next_logits.argmax(dim=1).cpu().numpy())
            all_next_gt.append(batch["y_next"].cpu().numpy())

            all_budget_pred.append(budget_pred.cpu().numpy())
            all_budget_gt.append(batch["y_budget"].cpu().numpy())

            all_score.append(torch.sigmoid(score_logit).cpu().numpy())

    return {
        "accept_prob": np.concatenate(all_accept_prob),
        "accept_gt": np.concatenate(all_accept_gt),
        "accept_logit": torch.cat(all_accept_logit),
        "next_prob": np.concatenate(all_next_prob),
        "next_pred": np.concatenate(all_next_pred),
        "next_gt": np.concatenate(all_next_gt),
        "budget_pred": np.concatenate(all_budget_pred),
        "budget_gt": np.concatenate(all_budget_gt),
        "score": np.concatenate(all_score),
    }


# ═══════════════════════════════════════════════════════════════════════════
# PLOT FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def plot_acceptance(preds: dict):
    prob = preds["accept_prob"]
    gt   = preds["accept_gt"]
    pred_bin = (prob >= 0.5).astype(int)
    auc = roc_auc_score(gt, prob)
    acc = accuracy_score(gt, pred_bin)
    f1  = f1_score(gt, pred_bin)

    # 1 — ROC curve
    fig, ax = plt.subplots(figsize=(7, 5))
    RocCurveDisplay.from_predictions(gt, prob, ax=ax, name="Accept")
    ax.set_title(f"Acceptance — ROC Curve  (AUC = {auc:.4f})")
    ax.plot([0, 1], [0, 1], "k--", alpha=0.4)
    _save("accept_roc_curve")

    # 2 — Precision-Recall curve
    fig, ax = plt.subplots(figsize=(7, 5))
    PrecisionRecallDisplay.from_predictions(gt, prob, ax=ax, name="Accept")
    ax.set_title("Acceptance — Precision-Recall Curve")
    _save("accept_pr_curve")

    # 3 — Confusion matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    ConfusionMatrixDisplay.from_predictions(
        gt, pred_bin, display_labels=["Rejected", "Accepted"],
        cmap="Blues", ax=ax,
    )
    ax.set_title(f"Acceptance — Confusion Matrix  (Acc={acc:.2%}, F1={f1:.2%})")
    _save("accept_confusion_matrix")

    # 4 — Probability distribution
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.hist(prob[gt == 0], bins=40, alpha=0.6, label="Rejected (GT)", color="salmon")
    ax.hist(prob[gt == 1], bins=40, alpha=0.6, label="Accepted (GT)", color="steelblue")
    ax.axvline(0.5, color="black", ls="--", label="Threshold 0.5")
    ax.set_xlabel("Predicted Probability")
    ax.set_ylabel("Count")
    ax.set_title("Acceptance — Score Distribution")
    ax.legend()
    _save("accept_score_distribution")


def plot_next_activity(preds: dict):
    pred = preds["next_pred"]
    gt   = preds["next_gt"]
    labels = C.ACTIVITY_TYPES
    acc = accuracy_score(gt, pred)
    mf1 = f1_score(gt, pred, average="macro")

    # 1 — Confusion matrix
    fig, ax = plt.subplots(figsize=(8, 7))
    ConfusionMatrixDisplay.from_predictions(
        gt, pred, display_labels=labels, cmap="YlOrRd",
        ax=ax, xticks_rotation=45,
    )
    ax.set_title(f"Next-Activity — Confusion Matrix  (Acc={acc:.2%}, Macro-F1={mf1:.2%})")
    _save("next_activity_confusion_matrix")

    # 2 — Per-class F1
    report = classification_report(gt, pred, target_names=labels, output_dict=True, zero_division=0)
    classes = labels
    f1s = [report[c]["f1-score"] for c in classes]
    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.barh(classes, f1s, color=sns.color_palette("Set2", len(classes)))
    ax.set_xlabel("F1 Score")
    ax.set_title("Next-Activity — Per-Class F1")
    for bar, v in zip(bars, f1s):
        ax.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height() / 2,
                f"{v:.2f}", va="center")
    ax.set_xlim(0, max(f1s) * 1.3 + 0.05)
    _save("next_activity_f1_per_class")

    # 3 — Class distribution (ground truth vs predicted)
    fig, axes = plt.subplots(1, 2, figsize=(12, 4), sharey=True)
    gt_counts = np.bincount(gt, minlength=len(labels))
    pred_counts = np.bincount(pred, minlength=len(labels))
    axes[0].barh(labels, gt_counts, color="steelblue")
    axes[0].set_title("Ground Truth Distribution")
    axes[1].barh(labels, pred_counts, color="coral")
    axes[1].set_title("Predicted Distribution")
    for ax in axes:
        ax.set_xlabel("Count")
    _save("next_activity_class_distribution")


def plot_budget(preds: dict):
    pred = preds["budget_pred"]
    gt   = preds["budget_gt"]
    mae  = mean_absolute_error(gt, pred)
    rmse = np.sqrt(mean_squared_error(gt, pred))
    r2   = r2_score(gt, pred)
    mean_gt = gt.mean()

    # 1 — Scatter: predicted vs actual
    fig, ax = plt.subplots(figsize=(7, 6))
    ax.scatter(gt, pred, alpha=0.3, s=10, color="steelblue")
    lims = [min(gt.min(), pred.min()), max(gt.max(), pred.max())]
    ax.plot(lims, lims, "r--", label="Perfect prediction")
    ax.set_xlabel("Actual Spend (USD)")
    ax.set_ylabel("Predicted Spend (USD)")
    ax.set_title(f"Budget — Predicted vs Actual  (R²={r2:.4f})")
    ax.legend()
    _save("budget_scatter")

    # 2 — Residual distribution
    residuals = pred - gt
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.hist(residuals, bins=50, color="mediumpurple", edgecolor="white")
    ax.axvline(0, color="red", ls="--")
    ax.set_xlabel("Residual (Predicted − Actual)")
    ax.set_ylabel("Count")
    ax.set_title(f"Budget — Residual Distribution  (MAE={mae:,.0f}, RMSE={rmse:,.0f})")
    _save("budget_residual_distribution")

    # 3 — Residual vs predicted (heteroscedasticity check)
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.scatter(pred, residuals, alpha=0.3, s=10, color="teal")
    ax.axhline(0, color="red", ls="--")
    ax.set_xlabel("Predicted Spend (USD)")
    ax.set_ylabel("Residual")
    ax.set_title("Budget — Residuals vs Predicted")
    _save("budget_residual_vs_predicted")

    # 4 — Error % histogram
    pct_err = np.abs(residuals) / np.maximum(gt, 1) * 100
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.hist(pct_err, bins=50, color="goldenrod", edgecolor="white")
    ax.axvline(pct_err.mean(), color="red", ls="--", label=f"Mean = {pct_err.mean():.1f}%")
    ax.set_xlabel("Absolute Percentage Error (%)")
    ax.set_ylabel("Count")
    ax.set_title(f"Budget — Percentage Error Distribution  (Mean APE = {pct_err.mean():.1f}%)")
    ax.legend()
    _save("budget_percentage_error")


def plot_ranking(preds: dict):
    score = preds["score"]
    gt    = preds["accept_gt"]

    # Score distribution by class
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.hist(score[gt == 0], bins=40, alpha=0.6, label="Rejected", color="salmon")
    ax.hist(score[gt == 1], bins=40, alpha=0.6, label="Accepted", color="steelblue")
    ax.set_xlabel("Ranking Score")
    ax.set_ylabel("Count")
    ax.set_title("Ranking Score Distribution by Acceptance")
    ax.legend()
    _save("ranking_score_distribution")


def plot_summary_dashboard(preds: dict):
    """Single summary figure with key metrics across all tasks."""
    prob = preds["accept_prob"]
    gt_a = preds["accept_gt"]
    pred_bin = (prob >= 0.5).astype(int)

    metrics = {
        "Accept\nAUC-ROC": roc_auc_score(gt_a, prob),
        "Accept\nAccuracy": accuracy_score(gt_a, pred_bin),
        "Accept\nF1": f1_score(gt_a, pred_bin),
        "Next-Act\nAccuracy": accuracy_score(preds["next_gt"], preds["next_pred"]),
        "Next-Act\nMacro-F1": f1_score(preds["next_gt"], preds["next_pred"], average="macro"),
        "Budget\nR²": r2_score(preds["budget_gt"], preds["budget_pred"]),
    }

    fig, ax = plt.subplots(figsize=(12, 5))
    names = list(metrics.keys())
    vals  = list(metrics.values())
    colors = ["#4c78a8", "#54a24b", "#e45756", "#72b7b2", "#f58518", "#b279a2"]
    bars = ax.bar(names, vals, color=colors, edgecolor="white", width=0.6)

    for bar, v in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                f"{v:.4f}", ha="center", va="bottom", fontweight="bold", fontsize=11)

    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Score")
    ax.set_title("Multi-Task Model — Summary Dashboard", fontsize=14, fontweight="bold")
    ax.axhline(0.5, color="gray", ls=":", alpha=0.5, label="Random baseline")
    ax.legend(loc="upper right")
    _save("summary_dashboard")


def plot_training_loss():
    """If training logged per-epoch losses we'd load them; for now we skip."""
    pass


def main():
    print("Collecting predictions...")
    preds = collect_predictions()

    print("\n--- Acceptance Probability ---")
    plot_acceptance(preds)

    print("--- Next-Activity Prediction ---")
    plot_next_activity(preds)

    print("--- Budget Utilization ---")
    plot_budget(preds)

    print("--- Ranking Scores ---")
    plot_ranking(preds)

    print("--- Summary Dashboard ---")
    plot_summary_dashboard(preds)

    print(f"\nAll visualizations saved to {REPORT_DIR}")
    print("Files:")
    for f in sorted(REPORT_DIR.glob("*.png")):
        print(f"  {f.name}")


if __name__ == "__main__":
    main()
