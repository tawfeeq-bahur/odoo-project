# Multi-Task Travel Itinerary Model — Implementation Plan

## 1. Objective

Build a **multi-task deep learning model** on the `itinerary_dataset.csv` (10,000 rows × 41 columns) that jointly learns four tasks from a shared representation:

| # | Task | Type | Target column(s) | Output |
|---|------|------|-------------------|--------|
| T1 | **Itinerary Recommendation** | Ranking / Top-N | Learned score from user–itinerary interaction | Sorted list of candidate itineraries |
| T2 | **Next-Activity Prediction** | Multi-class classification | Next activity type parsed from `daily_activities` | One of 7 activity categories |
| T3 | **Acceptance Probability** | Binary classification | `ai_itinerary_accepted` | Probability 0–1 |
| T4 | **Budget Utilization** | Regression | `budget_utilization_ratio × total_budget` | Predicted spend (USD) |

---

## 2. Dataset Summary

| Property | Value |
|----------|-------|
| Rows | 10,000 |
| Columns | 41 |
| Categorical (low-card) | 15 columns (max 30 unique for `city`) |
| Continuous / numeric | 18 columns |
| Sequence | 1 column (`daily_activities` — semicolon-delimited activity tokens) |
| Boolean | 2 columns (`ai_itinerary_accepted`, `ai_itinerary_modified`) |

---

## 3. Feature Engineering & Encoding

### 3.1 Categorical Features → Label / One-Hot

| Column(s) | Strategy |
|-----------|----------|
| `travel_experience_level` (3), `engagement_level` (3) | Ordinal encode (novice=0, intermediate=1, expert=2 / low=0, medium=1, high=2) |
| `travel_frequency` (3) | Ordinal encode (rarely=0, few times a year=1, several times a year=2) |
| `country_code` (10), `city` (30), `season` (4), `group_size` (5), `transport_mode` (6), `destination_type` (6), `traffic_condition` (4), `budget_tier` (4), `group_size_category` (2), `distance_category` (3), `poi_category` (6), `poi_cost_level` (3) | One-hot encode (total ~93 one-hot dims) |

### 3.2 Continuous Features → StandardScaler

| Column | Notes |
|--------|-------|
| `culture`, `food`, `nature`, `adventure`, `relaxation`, `shopping`, `nightlife` | Already 0–1 — keep as-is or min-max |
| `trip_duration_days`, `distance_km`, `estimated_time_minutes`, `total_budget`, `budget_per_day` | StandardScaler |
| `budget_utilization_ratio`, `destination_popularity_score`, `ai_suggestion_acceptance_rate` | StandardScaler |
| `poi_rating`, `poi_popularity_score`, `poi_visit_duration_minutes` | StandardScaler |
| `attraction_viewed_count`, `trip_planner_invoked_count`, `user_engagement_score`, `itinerary_completion_rate` | StandardScaler |

### 3.3 Sequence Feature → Tokenized Activity Sequence

Parse `daily_activities` (format: `day:seq:type:duration:cost;...`):

```
"1:1:Culture:87:low;1:2:Nature:95:high;..."
  →  token_ids: [0, 4, ...]          # activity type vocabulary (7 types)
  →  durations: [87, 95, ...]         # continuous side-info
  →  cost_ids:  [0, 2, ...]           # cost level vocabulary (3 levels)
```

- Pad/truncate to `MAX_SEQ_LEN = 60` (covers 15 days × 4 activities).
- Each time-step: `(activity_type_id, duration_minutes, cost_level_id)`.

### 3.4 Target Variables

| Target | Source | Preprocessing |
|--------|--------|---------------|
| `accept_label` | `ai_itinerary_accepted` | Cast bool → int (0/1) |
| `budget_spend` | `budget_utilization_ratio * total_budget` | Float (USD) |
| `next_activity` | Last token in `daily_activities` sequence | Int class 0–6 (held out from input) |

---

## 4. Architecture — Multi-Task Wide & Deep + Transformer

```
┌──────────────────────────────────────────────────────────┐
│                      INPUT LAYER                         │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────────┐ │
│  │ Wide     │  │ User/Trip │  │ Activity Sequence      │ │
│  │ (one-hot │  │ Dense     │  │ Embedding + Transformer│ │
│  │ crosses) │  │ Features  │  │ Encoder (2 layers)     │ │
│  └────┬─────┘  └─────┬─────┘  └──────────┬─────────────┘ │
│       │              │                    │               │
│       │        ┌─────▼─────┐        ┌────▼────┐          │
│       │        │ Dense 128 │        │ Mean    │          │
│       │        │ → ReLU    │        │ Pool    │          │
│       │        │ Dense 64  │        │ → 64    │          │
│       │        └─────┬─────┘        └────┬────┘          │
│       │              │                    │               │
│       └──────────────┼────────────────────┘               │
│                      │ CONCATENATE                        │
│                ┌─────▼──────┐                             │
│                │ Shared     │                             │
│                │ Dense 128  │                             │
│                │ → ReLU     │                             │
│                │ Dropout 0.3│                             │
│                └─────┬──────┘                             │
│         ┌────────────┼────────────┬──────────┐            │
│    ┌────▼────┐  ┌────▼────┐ ┌────▼────┐ ┌───▼────┐      │
│    │ Score   │  │ Accept  │ │ Next    │ │ Budget │      │
│    │ Head    │  │ Head    │ │ Activity│ │ Head   │      │
│    │ (rank)  │  │ (BCE)   │ │ (CE)   │ │ (MSE)  │      │
│    │ sigmoid │  │ sigmoid │ │ softmax│ │ linear │      │
│    └─────────┘  └─────────┘ └────────┘ └────────┘      │
└──────────────────────────────────────────────────────────┘
```

### Layer dimensions

| Component | In → Out |
|-----------|----------|
| Wide (crossed one-hots) | ~93 → 93 (pass-through) |
| Dense user/trip | ~30 continuous → 128 → 64 |
| Activity embedding | vocab=7, dim=32; cost vocab=3, dim=8; + duration → 41 per step |
| Transformer encoder | d_model=41 (projected to 64), nhead=4, num_layers=2 |
| Sequence pooling | 64 |
| Shared trunk | (93 + 64 + 64) = 221 → 128 |
| Task heads | 128 → 1 (score, accept, budget) or 128 → 7 (next-activity) |

---

## 5. Training Plan

### 5.1 Data Split

| Split | Ratio | Rows |
|-------|-------|------|
| Train | 70% | 7,000 |
| Validation | 15% | 1,500 |
| Test | 15% | 1,500 |

Stratify on `ai_itinerary_accepted` to keep class balance.

### 5.2 Multi-Task Loss

```
L = λ1 · BCE(accept_pred, accept_gt)
  + λ2 · CE(next_act_pred, next_act_gt)
  + λ3 · MSE(budget_pred, budget_gt)
  + λ4 · MarginRanking(score_pos, score_neg)
```

Initial weights: `λ1=1.0, λ2=1.0, λ3=0.01, λ4=1.0` (tune on validation).

### 5.3 Hyperparameters

| Param | Value |
|-------|-------|
| Optimizer | AdamW |
| Learning rate | 1e-3 (cosine decay) |
| Batch size | 256 |
| Epochs | 50 (early stopping patience=7) |
| Dropout | 0.3 |
| Weight decay | 1e-4 |

### 5.4 Framework

**PyTorch** (needs to be installed: `pip install torch torchvision`).

---

## 6. Evaluation Metrics

| Task | Metrics |
|------|---------|
| Itinerary Ranking | NDCG@10, MRR, Hit-Rate@10 |
| Acceptance | AUC-ROC, Accuracy, F1, Precision, Recall |
| Next-Activity | Accuracy, Macro-F1, Confusion Matrix |
| Budget Utilization | MAE, RMSE, R² |

---

## 7. File Structure

```
model/
├── config.py              # Hyperparams, column lists, paths
├── dataset.py             # PyTorch Dataset + preprocessing pipeline
├── features.py            # Feature engineering (encode, scale, tokenize)
├── model.py               # Multi-task model definition
├── train.py               # Training loop, validation, checkpointing
├── evaluate.py            # Test-set evaluation + metric reporting
├── predict.py             # Inference API (single sample → predictions)
└── requirements.txt       # torch, scikit-learn, pandas, numpy, tqdm
```

---

## 8. Implementation Phases

### Phase 1 — Setup & Feature Engineering
- [ ] Install dependencies (`torch`, `scikit-learn`)
- [ ] Create `model/config.py` with all constants
- [ ] Create `model/features.py` — encoding + scaling pipeline
- [ ] Create `model/dataset.py` — PyTorch `Dataset` class

### Phase 2 — Model & Training
- [ ] Create `model/model.py` — `ItineraryMultiTaskModel(nn.Module)`
- [ ] Create `model/train.py` — training loop with multi-task loss
- [ ] Train on GPU env, save best checkpoint

### Phase 3 — Evaluation & Inference
- [ ] Create `model/evaluate.py` — load checkpoint, compute all metrics
- [ ] Create `model/predict.py` — single-sample prediction function
- [ ] Print classification reports, confusion matrices, regression plots

### Phase 4 — Integration (optional)
- [ ] Wrap `predict.py` in a FastAPI endpoint
- [ ] Export model to ONNX for edge deployment
- [ ] Add to the existing Next.js app as `/api/ai/recommend`

---

## 9. Dependencies to Install

```bash
pip install torch torchvision scikit-learn tqdm matplotlib seaborn
```

---

## 10. Success Criteria

| Task | Minimum Target |
|------|----------------|
| Acceptance AUC-ROC | ≥ 0.75 |
| Next-Activity Accuracy | ≥ 0.30 (7-class, random baseline ~0.14) |
| Budget MAE | ≤ 15% of mean budget |
| Ranking NDCG@10 | ≥ 0.60 |
