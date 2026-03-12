"""
Multi-task Wide-&-Deep + Transformer model for itinerary recommendation.

Heads
-----
1. score_head   – itinerary ranking score   (sigmoid)
2. accept_head  – acceptance probability    (sigmoid / BCE)
3. next_head    – next-activity prediction  (softmax / CE)
4. budget_head  – budget-spend regression   (linear / MSE)
"""
from __future__ import annotations

import math
import torch
import torch.nn as nn

from . import config as C


class PositionalEncoding(nn.Module):
    """Standard sinusoidal positional encoding."""

    def __init__(self, d_model: int, max_len: int = C.MAX_SEQ_LEN):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        pos = torch.arange(0, max_len, dtype=torch.float32).unsqueeze(1)
        div = torch.exp(
            torch.arange(0, d_model, 2, dtype=torch.float32) * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(pos * div)
        if d_model % 2 == 1:
            pe[:, 1::2] = torch.cos(pos * div[:-1])
        else:
            pe[:, 1::2] = torch.cos(pos * div)
        self.register_buffer("pe", pe.unsqueeze(0))  # (1, max_len, d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.pe[:, :x.size(1)]


class ItineraryMultiTaskModel(nn.Module):
    def __init__(self, wide_dim: int, dense_dim: int):
        super().__init__()

        # ── Activity sequence branch ──────────────────────────────────
        self.act_emb  = nn.Embedding(C.NUM_ACTIVITY_TYPES, C.ACT_EMBED_DIM)
        self.cost_emb = nn.Embedding(len(C.COST_LEVELS), C.COST_EMBED_DIM)
        # Each step: act_embed(32) + cost_embed(8) + duration(1) = 41
        seq_feat_dim = C.ACT_EMBED_DIM + C.COST_EMBED_DIM + 1
        self.seq_proj = nn.Linear(seq_feat_dim, C.USER_DENSE_OUT)  # → 64

        self.pos_enc = PositionalEncoding(C.USER_DENSE_OUT)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=C.USER_DENSE_OUT,
            nhead=C.TRANSFORMER_HEADS,
            dim_feedforward=C.USER_DENSE_OUT * 2,
            dropout=C.DROPOUT,
            batch_first=True,
        )
        self.seq_encoder = nn.TransformerEncoder(
            encoder_layer, num_layers=C.TRANSFORMER_LAYERS,
        )

        # ── User / trip dense branch ──────────────────────────────────
        self.user_net = nn.Sequential(
            nn.Linear(dense_dim, C.USER_DENSE_HIDDEN),
            nn.ReLU(),
            nn.Dropout(C.DROPOUT),
            nn.Linear(C.USER_DENSE_HIDDEN, C.USER_DENSE_OUT),
            nn.ReLU(),
        )

        # ── Shared trunk ─────────────────────────────────────────────
        trunk_in = wide_dim + C.USER_DENSE_OUT + C.USER_DENSE_OUT  # wide + user + seq
        self.trunk = nn.Sequential(
            nn.Linear(trunk_in, C.SHARED_HIDDEN),
            nn.ReLU(),
            nn.Dropout(C.DROPOUT),
        )

        # ── Task heads ───────────────────────────────────────────────
        self.score_head  = nn.Linear(C.SHARED_HIDDEN, 1)
        self.accept_head = nn.Linear(C.SHARED_HIDDEN, 1)
        self.next_head   = nn.Linear(C.SHARED_HIDDEN, C.NUM_ACTIVITY_TYPES)
        self.budget_head = nn.Linear(C.SHARED_HIDDEN, 1)

    # ─────────────────────────────────────────────────────────────────
    def forward(self, wide, dense, act_ids, act_durs, cost_ids, seq_len):
        """
        Parameters
        ----------
        wide     : (B, D_wide)
        dense    : (B, D_dense)
        act_ids  : (B, L)       long
        act_durs : (B, L)       float
        cost_ids : (B, L)       long
        seq_len  : (B,)         long
        """
        # ── Sequence encoding ────────────────────────────────────────
        ae = self.act_emb(act_ids)                         # (B, L, 32)
        ce = self.cost_emb(cost_ids)                       # (B, L, 8)
        dur = act_durs.unsqueeze(-1)                       # (B, L, 1)
        seq_feat = torch.cat([ae, ce, dur], dim=-1)        # (B, L, 41)
        seq_feat = self.seq_proj(seq_feat)                 # (B, L, 64)
        seq_feat = self.pos_enc(seq_feat)

        # Create padding mask: True where padded
        B, L = act_ids.shape
        positions = torch.arange(L, device=act_ids.device).unsqueeze(0)  # (1, L)
        pad_mask = positions >= seq_len.unsqueeze(1)                     # (B, L)

        seq_out = self.seq_encoder(seq_feat, src_key_padding_mask=pad_mask)  # (B, L, 64)

        # Mean-pool over non-padded positions
        mask_f = (~pad_mask).unsqueeze(-1).float()       # (B, L, 1)
        lengths = mask_f.sum(dim=1).clamp(min=1)         # (B, 1)
        seq_vec = (seq_out * mask_f).sum(dim=1) / lengths  # (B, 64)

        # ── User dense ───────────────────────────────────────────────
        user_vec = self.user_net(dense)                    # (B, 64)

        # ── Concat & trunk ───────────────────────────────────────────
        x = torch.cat([wide, user_vec, seq_vec], dim=1)    # (B, trunk_in)
        shared = self.trunk(x)                             # (B, 128)

        # ── Heads ────────────────────────────────────────────────────
        score_logit  = self.score_head(shared).squeeze(-1)
        accept_logit = self.accept_head(shared).squeeze(-1)
        next_logits  = self.next_head(shared)              # (B, 7)
        budget_pred  = self.budget_head(shared).squeeze(-1)

        return score_logit, accept_logit, next_logits, budget_pred
