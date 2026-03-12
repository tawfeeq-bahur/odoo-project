"""
Centralised configuration for the multi-task itinerary model.
All magic numbers, column lists, and hyper-parameters live here.
"""
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent          # ml/
DATA_DIR = ROOT_DIR / "data"
CSV_PATH = DATA_DIR / "itinerary_dataset.csv"
CKPT_DIR = ROOT_DIR / "checkpoints"
CKPT_DIR.mkdir(exist_ok=True, parents=True)

# ── Column lists ───────────────────────────────────────────────────────────
ORDINAL_COLS = {
    "travel_experience_level": ["novice", "intermediate", "expert"],
    "travel_frequency":        ["rarely", "few times a year", "several times a year"],
    "engagement_level":        ["low", "medium", "high"],
}

ONEHOT_COLS = [
    "country_code", "city", "season", "group_size",
    "transport_mode", "destination_type", "traffic_condition",
    "budget_tier", "group_size_category", "distance_category",
    "poi_category", "poi_cost_level",
]

PREFERENCE_COLS = [
    "culture", "food", "nature", "adventure",
    "relaxation", "shopping", "nightlife",
]

CONTINUOUS_COLS = [
    "trip_duration_days", "distance_km", "estimated_time_minutes",
    "total_budget", "budget_per_day",
    "budget_utilization_ratio", "destination_popularity_score",
    "ai_suggestion_acceptance_rate",
    "poi_rating", "poi_popularity_score", "poi_visit_duration_minutes",
    "attraction_viewed_count", "trip_planner_invoked_count",
    "user_engagement_score", "itinerary_completion_rate",
]

# Activity-sequence vocabulary (parsed from daily_activities)
ACTIVITY_TYPES = ["Culture", "Food", "Nature", "Adventure",
                  "Relaxation", "Shopping", "Nightlife"]
ACTIVITY_VOCAB = {a: i for i, a in enumerate(ACTIVITY_TYPES)}
NUM_ACTIVITY_TYPES = len(ACTIVITY_TYPES)

COST_LEVELS = ["low", "medium", "high"]
COST_VOCAB  = {c: i for i, c in enumerate(COST_LEVELS)}

MAX_SEQ_LEN = 60  # pad/truncate activity sequences to this length

# ── Targets ────────────────────────────────────────────────────────────────
TARGET_ACCEPT  = "ai_itinerary_accepted"      # bool → binary
TARGET_BUDGET  = "budget_spend"               # derived: utilization * total
TARGET_NEXT_ACT = "next_activity"             # last activity type in seq

# ── Training hyper-parameters ──────────────────────────────────────────────
SEED        = 42
BATCH_SIZE  = 256
EPOCHS      = 50
LR          = 1e-3
WEIGHT_DECAY = 1e-4
PATIENCE    = 7
DROPOUT     = 0.3

# Multi-task loss weights
LAMBDA_ACCEPT = 1.0
LAMBDA_NEXT   = 1.0
LAMBDA_BUDGET = 0.01
LAMBDA_RANK   = 1.0

# Data split
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.15
TEST_RATIO  = 0.15

# Model dims
USER_DENSE_HIDDEN = 128
USER_DENSE_OUT    = 64
ACT_EMBED_DIM     = 32
COST_EMBED_DIM    = 8
TRANSFORMER_HEADS = 4
TRANSFORMER_LAYERS = 2
SHARED_HIDDEN     = 128
