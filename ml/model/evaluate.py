"""
Evaluate the trained model on the test set.

Usage
-----
    cd ml/
    conda activate gpu-env
    python -m model.evaluate
"""
from __future__ import annotations

import numpy as np
import torch
from sklearn.metrics import (
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


def evaluate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── Data ──────────────────────────────────────────────────────────
    _, _, test_dl, meta = get_dataloaders()

    # ── Load checkpoint ───────────────────────────────────────────────
    ckpt_path = C.CKPT_DIR / "best_model.pt"
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    print(f"Loaded checkpoint from epoch {ckpt['epoch']} (val_loss={ckpt['val_loss']:.4f})")

    model = ItineraryMultiTaskModel(
        wide_dim=meta["wide_dim"],
        dense_dim=meta["dense_dim"],
    ).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()

    # ── Collect predictions ───────────────────────────────────────────
    all_accept_prob, all_accept_gt = [], []
    all_next_pred, all_next_gt = [], []
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
            all_accept_prob.append(torch.sigmoid(accept_logit).cpu().numpy())
            all_accept_gt.append(batch["y_accept"].cpu().numpy())

            all_next_pred.append(next_logits.argmax(dim=1).cpu().numpy())
            all_next_gt.append(batch["y_next"].cpu().numpy())

            all_budget_pred.append(budget_pred.cpu().numpy())
            all_budget_gt.append(batch["y_budget"].cpu().numpy())

            all_score.append(torch.sigmoid(score_logit).cpu().numpy())

    accept_prob = np.concatenate(all_accept_prob)
    accept_gt   = np.concatenate(all_accept_gt)
    next_pred   = np.concatenate(all_next_pred)
    next_gt     = np.concatenate(all_next_gt)
    budget_pred = np.concatenate(all_budget_pred)
    budget_gt   = np.concatenate(all_budget_gt)

    # ── Task 1: Acceptance ────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("TASK: Acceptance Probability")
    print("=" * 60)
    accept_pred_bin = (accept_prob >= 0.5).astype(int)
    print(f"AUC-ROC  : {roc_auc_score(accept_gt, accept_prob):.4f}")
    print(f"Accuracy : {accuracy_score(accept_gt, accept_pred_bin):.4f}")
    print(f"F1       : {f1_score(accept_gt, accept_pred_bin):.4f}")
    print("\nClassification Report:")
    print(classification_report(accept_gt, accept_pred_bin, target_names=["Rejected", "Accepted"]))

    # ── Task 2: Next-Activity ─────────────────────────────────────────
    print("=" * 60)
    print("TASK: Next-Activity Prediction")
    print("=" * 60)
    print(f"Accuracy  : {accuracy_score(next_gt, next_pred):.4f}")
    print(f"Macro-F1  : {f1_score(next_gt, next_pred, average='macro'):.4f}")
    print("\nClassification Report:")
    print(classification_report(
        next_gt, next_pred,
        target_names=C.ACTIVITY_TYPES,
        zero_division=0,
    ))
    print("Confusion Matrix:")
    print(confusion_matrix(next_gt, next_pred))

    # ── Task 3: Budget Utilization ────────────────────────────────────
    print("\n" + "=" * 60)
    print("TASK: Budget Utilization (Spend Prediction)")
    print("=" * 60)
    mae  = mean_absolute_error(budget_gt, budget_pred)
    rmse = np.sqrt(mean_squared_error(budget_gt, budget_pred))
    r2   = r2_score(budget_gt, budget_pred)
    mean_budget = budget_gt.mean()
    print(f"MAE      : {mae:,.2f}  ({mae / mean_budget * 100:.1f}% of mean)")
    print(f"RMSE     : {rmse:,.2f}")
    print(f"R²       : {r2:.4f}")
    print(f"Mean GT  : {mean_budget:,.2f}")

    print("\n" + "=" * 60)
    print("Evaluation complete.")
    print("=" * 60)


if __name__ == "__main__":
    evaluate()
