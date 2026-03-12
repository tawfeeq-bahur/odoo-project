"""
Training loop with multi-task loss, validation, early stopping, and checkpointing.

Usage
-----
    cd ml/
    conda activate gpu-env
    python -m model.train
"""
from __future__ import annotations

import time
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from . import config as C
from .dataset import get_dataloaders
from .model import ItineraryMultiTaskModel


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # ── Data ──────────────────────────────────────────────────────────
    train_dl, val_dl, _, meta = get_dataloaders()
    print(f"Train: {meta['n_train']}  Val: {meta['n_val']}  Test: {meta['n_test']}")
    print(f"Wide dim: {meta['wide_dim']}  Dense dim: {meta['dense_dim']}")

    # ── Model ─────────────────────────────────────────────────────────
    model = ItineraryMultiTaskModel(
        wide_dim=meta["wide_dim"],
        dense_dim=meta["dense_dim"],
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total parameters: {total_params:,}")

    # ── Optimiser & scheduler ─────────────────────────────────────────
    optimiser = AdamW(model.parameters(), lr=C.LR, weight_decay=C.WEIGHT_DECAY)
    scheduler = CosineAnnealingLR(optimiser, T_max=C.EPOCHS)

    # ── Loss functions ────────────────────────────────────────────────
    bce  = nn.BCEWithLogitsLoss()
    ce   = nn.CrossEntropyLoss()
    mse  = nn.MSELoss()

    # ── Training ──────────────────────────────────────────────────────
    best_val_loss = float("inf")
    patience_counter = 0

    for epoch in range(1, C.EPOCHS + 1):
        t0 = time.time()

        # ---- train ----
        model.train()
        train_loss = 0.0
        for batch in train_dl:
            batch = {k: v.to(device) for k, v in batch.items()}

            score_logit, accept_logit, next_logits, budget_pred = model(
                batch["wide"], batch["dense"],
                batch["act_ids"], batch["act_durs"],
                batch["cost_ids"], batch["seq_len"],
            )

            loss_accept = bce(accept_logit, batch["y_accept"])
            loss_next   = ce(next_logits, batch["y_next"])
            loss_budget = mse(budget_pred, batch["y_budget"])
            # Ranking: use score_logit vs accept as a proxy
            loss_rank   = bce(score_logit, batch["y_accept"])

            loss = (
                C.LAMBDA_ACCEPT * loss_accept
                + C.LAMBDA_NEXT * loss_next
                + C.LAMBDA_BUDGET * loss_budget
                + C.LAMBDA_RANK * loss_rank
            )

            optimiser.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimiser.step()
            train_loss += loss.item() * len(batch["y_accept"])

        train_loss /= meta["n_train"]

        # ---- validate ----
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_dl:
                batch = {k: v.to(device) for k, v in batch.items()}
                score_logit, accept_logit, next_logits, budget_pred = model(
                    batch["wide"], batch["dense"],
                    batch["act_ids"], batch["act_durs"],
                    batch["cost_ids"], batch["seq_len"],
                )
                loss_accept = bce(accept_logit, batch["y_accept"])
                loss_next   = ce(next_logits, batch["y_next"])
                loss_budget = mse(budget_pred, batch["y_budget"])
                loss_rank   = bce(score_logit, batch["y_accept"])
                loss = (
                    C.LAMBDA_ACCEPT * loss_accept
                    + C.LAMBDA_NEXT * loss_next
                    + C.LAMBDA_BUDGET * loss_budget
                    + C.LAMBDA_RANK * loss_rank
                )
                val_loss += loss.item() * len(batch["y_accept"])
        val_loss /= meta["n_val"]

        scheduler.step()
        elapsed = time.time() - t0

        print(
            f"Epoch {epoch:3d}/{C.EPOCHS}  "
            f"train_loss={train_loss:.4f}  val_loss={val_loss:.4f}  "
            f"lr={scheduler.get_last_lr()[0]:.2e}  "
            f"time={elapsed:.1f}s"
        )

        # ---- checkpoint ----
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            ckpt = {
                "epoch": epoch,
                "model_state": model.state_dict(),
                "optimiser_state": optimiser.state_dict(),
                "val_loss": val_loss,
                "meta": {k: v for k, v in meta.items() if k != "encoders"},
            }
            torch.save(ckpt, C.CKPT_DIR / "best_model.pt")
            print(f"  ✓ saved best checkpoint (val_loss={val_loss:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= C.PATIENCE:
                print(f"Early stopping at epoch {epoch} (patience={C.PATIENCE})")
                break

    print(f"\nTraining complete. Best val_loss={best_val_loss:.4f}")
    print(f"Checkpoint saved to {C.CKPT_DIR / 'best_model.pt'}")


if __name__ == "__main__":
    train()
