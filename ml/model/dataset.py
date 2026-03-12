"""
PyTorch Dataset that wraps the pre-processed numpy arrays.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split

from . import config as C
from .features import build_features


class ItineraryDataset(Dataset):
    def __init__(
        self,
        X_wide: np.ndarray,
        X_dense: np.ndarray,
        act_ids: np.ndarray,
        act_durs: np.ndarray,
        cost_ids: np.ndarray,
        seq_lens: np.ndarray,
        y_accept: np.ndarray,
        y_budget: np.ndarray,
        y_next: np.ndarray,
    ):
        self.X_wide  = torch.tensor(X_wide,  dtype=torch.float32)
        self.X_dense = torch.tensor(X_dense, dtype=torch.float32)
        self.act_ids = torch.tensor(act_ids,  dtype=torch.long)
        self.act_durs = torch.tensor(act_durs, dtype=torch.float32)
        self.cost_ids = torch.tensor(cost_ids, dtype=torch.long)
        self.seq_lens = torch.tensor(seq_lens, dtype=torch.long)
        self.y_accept = torch.tensor(y_accept, dtype=torch.float32)
        self.y_budget = torch.tensor(y_budget, dtype=torch.float32)
        self.y_next   = torch.tensor(y_next,   dtype=torch.long)

    def __len__(self):
        return len(self.y_accept)

    def __getitem__(self, idx):
        return {
            "wide":     self.X_wide[idx],
            "dense":    self.X_dense[idx],
            "act_ids":  self.act_ids[idx],
            "act_durs": self.act_durs[idx],
            "cost_ids": self.cost_ids[idx],
            "seq_len":  self.seq_lens[idx],
            "y_accept": self.y_accept[idx],
            "y_budget": self.y_budget[idx],
            "y_next":   self.y_next[idx],
        }


def get_dataloaders(csv_path: str | None = None, batch_size: int = C.BATCH_SIZE):
    """
    Load CSV → feature-engineer → split → return train/val/test DataLoaders
    and metadata dict (encoders, dims, etc.).
    """
    csv_path = csv_path or str(C.CSV_PATH)
    df = pd.read_csv(csv_path, low_memory=False)

    (X_wide, X_dense,
     act_ids, act_durs, cost_ids, seq_lens,
     y_accept, y_budget, y_next,
     encoders) = build_features(df)

    # Stratified split on acceptance label
    indices = np.arange(len(df))
    idx_train, idx_tmp = train_test_split(
        indices, test_size=(C.VAL_RATIO + C.TEST_RATIO),
        stratify=y_accept, random_state=C.SEED,
    )
    relative_test = C.TEST_RATIO / (C.VAL_RATIO + C.TEST_RATIO)
    idx_val, idx_test = train_test_split(
        idx_tmp, test_size=relative_test,
        stratify=y_accept[idx_tmp], random_state=C.SEED,
    )

    def _make(idxs):
        return ItineraryDataset(
            X_wide[idxs], X_dense[idxs],
            act_ids[idxs], act_durs[idxs], cost_ids[idxs], seq_lens[idxs],
            y_accept[idxs], y_budget[idxs], y_next[idxs],
        )

    ds_train = _make(idx_train)
    ds_val   = _make(idx_val)
    ds_test  = _make(idx_test)

    meta = {
        "wide_dim":  X_wide.shape[1],
        "dense_dim": X_dense.shape[1],
        "encoders":  encoders,
        "n_train":   len(ds_train),
        "n_val":     len(ds_val),
        "n_test":    len(ds_test),
    }

    loader_kw = dict(num_workers=0, pin_memory=True)
    train_dl = DataLoader(ds_train, batch_size=batch_size, shuffle=True,  **loader_kw)
    val_dl   = DataLoader(ds_val,   batch_size=batch_size, shuffle=False, **loader_kw)
    test_dl  = DataLoader(ds_test,  batch_size=batch_size, shuffle=False, **loader_kw)

    return train_dl, val_dl, test_dl, meta
