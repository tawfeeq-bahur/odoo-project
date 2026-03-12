"""
Feature engineering: encoding, scaling, and sequence tokenisation.
Produces numpy arrays ready for the PyTorch Dataset.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder

from . import config as C


# ── Public API ─────────────────────────────────────────────────────────────

def build_features(df: pd.DataFrame):
    """
    Return
    ------
    X_wide   : np.ndarray   – one-hot features  (N, D_wide)
    X_dense  : np.ndarray   – continuous feats   (N, D_dense)
    act_ids  : np.ndarray   – activity-type ids  (N, MAX_SEQ_LEN)
    act_durs : np.ndarray   – durations (scaled) (N, MAX_SEQ_LEN)
    cost_ids : np.ndarray   – cost-level ids     (N, MAX_SEQ_LEN)
    seq_lens : np.ndarray   – true lengths       (N,)
    y_accept : np.ndarray   – binary target      (N,)
    y_budget : np.ndarray   – regression target  (N,)
    y_next   : np.ndarray   – class target 0-6   (N,)
    encoders : dict          – fitted encoders (for inference)
    """
    df = df.copy()

    # ── Targets ────────────────────────────────────────────────────────
    y_accept = df[C.TARGET_ACCEPT].astype(int).values

    df[C.TARGET_BUDGET] = df["budget_utilization_ratio"] * df["total_budget"]
    y_budget = df[C.TARGET_BUDGET].values.astype(np.float32)

    # Parse sequences & extract last-activity as next-act label
    act_ids, act_durs, cost_ids, seq_lens, y_next = _parse_sequences(
        df["daily_activities"]
    )

    # ── Ordinal encoding ──────────────────────────────────────────────
    ord_enc = OrdinalEncoder(
        categories=[cats for cats in C.ORDINAL_COLS.values()],
        handle_unknown="use_encoded_value",
        unknown_value=-1,
    )
    X_ord = ord_enc.fit_transform(df[list(C.ORDINAL_COLS.keys())])

    # ── One-hot encoding ─────────────────────────────────────────────
    ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    X_oh = ohe.fit_transform(df[C.ONEHOT_COLS])

    X_wide = np.hstack([X_ord, X_oh]).astype(np.float32)

    # ── Continuous features ──────────────────────────────────────────
    X_pref = df[C.PREFERENCE_COLS].values.astype(np.float32)   # already 0-1

    scaler = StandardScaler()
    X_cont = scaler.fit_transform(
        df[C.CONTINUOUS_COLS].fillna(0).values.astype(np.float32)
    )

    X_dense = np.hstack([X_pref, X_cont]).astype(np.float32)

    encoders = {
        "ordinal": ord_enc,
        "onehot": ohe,
        "scaler": scaler,
    }

    return (
        X_wide, X_dense,
        act_ids, act_durs, cost_ids, seq_lens,
        y_accept, y_budget, y_next,
        encoders,
    )


# ── Internals ──────────────────────────────────────────────────────────────

def _parse_sequences(series: pd.Series):
    """Parse ``daily_activities`` strings into padded numpy arrays."""
    n = len(series)
    act_ids  = np.zeros((n, C.MAX_SEQ_LEN), dtype=np.int64)
    act_durs = np.zeros((n, C.MAX_SEQ_LEN), dtype=np.float32)
    cost_ids = np.zeros((n, C.MAX_SEQ_LEN), dtype=np.int64)
    seq_lens = np.zeros(n, dtype=np.int64)
    y_next   = np.zeros(n, dtype=np.int64)

    for i, raw in enumerate(series.values):
        tokens = str(raw).split(";")
        activities = []
        for tok in tokens:
            parts = tok.split(":")
            if len(parts) < 5:
                continue
            atype = parts[2]
            dur   = int(parts[3])
            cost  = parts[4]
            activities.append((
                C.ACTIVITY_VOCAB.get(atype, 0),
                float(dur),
                C.COST_VOCAB.get(cost, 0),
            ))
        if not activities:
            continue

        # last activity = next-act label; remove from input
        y_next[i] = activities[-1][0]
        activities = activities[:-1]

        length = min(len(activities), C.MAX_SEQ_LEN)
        seq_lens[i] = length
        for j in range(length):
            act_ids[i, j]  = activities[j][0]
            act_durs[i, j] = activities[j][1]
            cost_ids[i, j] = activities[j][2]

    # normalise durations (simple min-max across all non-zero)
    mask = act_durs > 0
    if mask.any():
        dmin, dmax = act_durs[mask].min(), act_durs[mask].max()
        if dmax > dmin:
            act_durs[mask] = (act_durs[mask] - dmin) / (dmax - dmin)

    return act_ids, act_durs, cost_ids, seq_lens, y_next
