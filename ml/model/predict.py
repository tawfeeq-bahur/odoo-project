"""
Single-sample inference helper.

Usage
-----
    from model.predict import Predictor
    predictor = Predictor()
    result = predictor.predict(sample_dict)
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import torch

from . import config as C
from .features import build_features
from .model import ItineraryMultiTaskModel


class Predictor:
    """Load a trained checkpoint and predict on a single sample dict."""

    def __init__(self, ckpt_path: str | None = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        ckpt_path = ckpt_path or str(C.CKPT_DIR / "best_model.pt")
        ckpt = torch.load(ckpt_path, map_location=self.device, weights_only=False)

        self._wide_dim  = ckpt["meta"]["wide_dim"]
        self._dense_dim = ckpt["meta"]["dense_dim"]

        self.model = ItineraryMultiTaskModel(
            wide_dim=self._wide_dim,
            dense_dim=self._dense_dim,
        ).to(self.device)
        self.model.load_state_dict(ckpt["model_state"])
        self.model.eval()

        # We need fresh encoders fitted on the full dataset for transforms
        self._df_full = pd.read_csv(C.CSV_PATH, low_memory=False)
        (self._X_wide, self._X_dense,
         self._act_ids, self._act_durs, self._cost_ids, self._seq_lens,
         _, _, _,
         self._encoders) = build_features(self._df_full)

    def predict(self, sample: dict) -> dict:
        """
        Parameters
        ----------
        sample : dict with the same keys as a CSV row

        Returns
        -------
        dict with keys: score, accept_prob, next_activity, budget_spend
        """
        df_one = pd.DataFrame([sample])
        (X_wide, X_dense,
         act_ids, act_durs, cost_ids, seq_lens,
         _, _, _, _) = build_features(
            pd.concat([self._df_full, df_one], ignore_index=True),
        )
        # Take last row (the new sample) — encoders were fit on full+1
        idx = -1
        with torch.no_grad():
            wide  = torch.tensor(X_wide[idx:idx+1],  dtype=torch.float32).to(self.device)
            dense = torch.tensor(X_dense[idx:idx+1], dtype=torch.float32).to(self.device)
            aids  = torch.tensor(act_ids[idx:idx+1],  dtype=torch.long).to(self.device)
            adur  = torch.tensor(act_durs[idx:idx+1], dtype=torch.float32).to(self.device)
            cids  = torch.tensor(cost_ids[idx:idx+1], dtype=torch.long).to(self.device)
            slen  = torch.tensor(seq_lens[idx:idx+1], dtype=torch.long).to(self.device)

            score_l, accept_l, next_l, budget_p = self.model(
                wide, dense, aids, adur, cids, slen,
            )

        score       = torch.sigmoid(score_l).item()
        accept_prob = torch.sigmoid(accept_l).item()
        next_act_id = next_l.argmax(dim=1).item()
        budget      = budget_p.item()

        return {
            "score": round(score, 4),
            "accept_prob": round(accept_prob, 4),
            "next_activity": C.ACTIVITY_TYPES[next_act_id],
            "budget_spend": round(budget, 2),
        }
