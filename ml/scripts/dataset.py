from __future__ import annotations
import random
import math
import csv
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import numpy as np
import pandas as pd
from tqdm import tqdm
# ------------------------------------------------------------------------------
# ---- CONFIGURATION -----------------------------------------------------------------
# ------------------------------------------------------------------------------
ROW_COUNT = 1_000_000          # change to 1_000_000 for full size
BATCH_SIZE = 10_000          # write in chunks to keep memory usage low
OUTPUT_CSV = Path(__file__).resolve().parent.parent / "data" / "itinerary_dataset.csv"
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
# ------------------------------------------------------------------------------
# ---- LOOKUP TABLES ---------------------------------------------------------------
# ------------------------------------------------------------------------------
COUNTRIES = [
    ("US", "United States"),
    ("CA", "Canada"),
    ("FR", "France"),
    ("ES", "Spain"),
    ("IT", "Italy"),
    ("DE", "Germany"),
    ("AU", "Australia"),
    ("BR", "Brazil"),
    ("JP", "Japan"),
    ("CN", "China"),
]  # (code, full_name)
CITIES = {
    # country_code : [cities]
    "US": ["New York", "San Francisco", "Chicago"],
    "CA": ["Toronto", "Vancouver", "Montreal"],
    "FR": ["Paris", "Lyon", "Nice"],
    "ES": ["Barcelona", "Madrid", "Seville"],
    "IT": ["Rome", "Milan", "Florence"],
    "DE": ["Berlin", "Munich", "Hamburg"],
    "AU": ["Sydney", "Melbourne", "Brisbane"],
    "BR": ["Rio de Janeiro", "São Paulo", "Brasília"],
    "JP": ["Tokyo", "Kyoto", "Osaka"],
    "CN": ["Beijing", "Shanghai", "Guangzhou"],
}
DESTINATION_TYPE = ["Historical", "Nature", "City", "Beach", "Adventure", "Cultural"]
TRANSPORT_MODE = ["Car", "Train", "Plane", "Bus", "Bike", "Walk"]
ACTIVITY_TYPES = ["Culture", "Food", "Nature", "Adventure", "Relaxation", "Shopping", "Nightlife"]
WEATHER_CONDITIONS = {
    "Winter": ["Snow", "Rain", "Clear", "Cloudy"],
    "Spring": ["Sunny", "Rain", "Cloudy"],
    "Summer": ["Sunny", "Hot", "Rain"],
    "Autumn": ["Warm", "Rain", "Cloudy"],
}
TRAFFIC_CONDITIONS = ["Low", "Medium", "High", "Very High"]
BUDGET_TIERS = ["low", "medium", "high", "luxury"]
GROUP_SIZES = ["solo", "couple", "family", "friends", "group"]
PREFS = [
    "culture",
    "food",
    "nature",
    "adventure",
    "relaxation",
    "shopping",
    "nightlife",
]
# ------------------------------------------------------------------------------
# ---- HELPERS --------------------------------------------------------------------
# ------------------------------------------------------------------------------
def weighted_choice(choices: list[str], weights: list[float]) -> str:
    """Return a weighted random selection."""
    return np.random.choice(choices, p=np.array(weights)/sum(weights))
def random_normal(mean: float, std: float, low: float, high: float) -> float:
    """Sample from Gaussian and clamp."""
    val = random.gauss(mean, std)
    return max(min(val, high), low)
def simulate_user_profile() -> dict:
    """Generate user profile fields."""
    return {
        "travel_experience_level": weighted_choice(["novice", "intermediate", "expert"], [0.4, 0.4, 0.2]),
        "travel_frequency": weighted_choice(["rarely", "few times a year", "several times a year"], [0.3, 0.4, 0.3]),
        "engagement_level": weighted_choice(["low", "medium", "high"], [0.2, 0.5, 0.3]),
    }
def simulate_preferences() -> dict:
    """Generate preference scores 0–1 for each interest."""
    prefs = {p: round(random.uniform(0, 1), 2) for p in PREFS}
    return prefs
def simulate_trip_context() -> dict:
    """Generate trip context fields."""
    country_code, country_name = random.choice(COUNTRIES)
    city = random.choice(CITIES[country_code])
    season = random.choice(["Winter", "Spring", "Summer", "Autumn"])
    duration = random.randint(2, 15)  # days (mostly 2–10)
    group_size = weighted_choice(GROUP_SIZES, [0.4, 0.3, 0.15, 0.1, 0.05])
    return {
        "country_code": country_code,
        "country_name": country_name,
        "city": city,
        "season": season,
        "trip_duration_days": duration,
        "group_size": group_size,
    }
def simulate_location_and_route(destination_type: str) -> dict:
    """Generate distance, time, transport mode, traffic, weather."""
    if destination_type in ("Historical", "Cultural", "City"):
        dist = random.randint(10, 200)
    elif destination_type in ("Nature", "Adventure"):
        dist = random.randint(200, 1500)
    else:  # Beach, etc.
        dist = random.randint(1500, 8000)
    # Estimate travel time in minutes; simplistic assumption: 1 km ~ 1.5 min avg for car
    time = int(dist * 1.5 + np.random.normal(0, dist * 0.1))
    return {
        "distance_km": dist,
        "estimated_time_minutes": time,
        "transport_mode": weighted_choice(TRANSPORT_MODE, [0.3, 0.25, 0.15, 0.10, 0.10, 0.10]),
        "destination_type": destination_type,
        "traffic_condition": weighted_choice(TRAFFIC_CONDITIONS, [0.4, 0.3, 0.2, 0.1]),
        # Weather derived from season
    }
def simulate_budget_and_expense(duration: int, group_size: str, destination_popularity: float) -> dict:
    """Generate budget tier and total budget."""
    tier_weights = {"low":0.25, "medium":0.4, "high":0.25, "luxury":0.1}
    # shift weights if destination popularity high
    if destination_popularity > 0.8:
        tier_weights["high"] *= 1.5
        tier_weights["luxury"] *= 1.2
    # normalise
    tiers = list(tier_weights.keys())
    probs = [tier_weights[t] for t in tiers]
    tier = weighted_choice(tiers, probs)
    # base budgets by tier & duration
    base = {
        "low": 150,
        "medium": 400,
        "high": 900,
        "luxury": 2000,
    }
    # Add per day factor and group multiplier
    if group_size in ("solo", "couple"):
        mult = 1.0
    else:
        mult = 1.2
    total = base[tier] * duration * mult
    return {"budget_tier": tier, "total_budget": int(total)}
def simulate_itinerary(days: int, destination_type: str, budget: float) -> list[dict]:
    """Mock itinerary: list of daily activities with type, duration, order."""
    activities = []
    for day in range(1, days+1):
        # number of activities per day depends on destination type
        if destination_type in ("Historical","Cultural"):
            n = random.randint(4,6)
        else:
            n = random.randint(2,4)
        for i in range(n):
            act_type = weighted_choice(ACTIVITY_TYPES, [0.15,0.15,0.15,0.15,0.1,0.1,0.1])
            dur_min = random.randint(60, 180)  # between 1–3 hrs
            cost_level = random.choice(["low", "medium", "high"])
            activities.append({
                "day": day,
                "sequence": i+1,
                "activity_type": act_type,
                "duration_minutes": dur_min,
                "cost_level": cost_level,
                "rating": round(random.uniform(3.0, 5.0), 1),
            })
    return activities
def simulate_poi_attributes() -> dict:
    """Create POI metadata."""
    return {
        "category": weighted_choice(["Museum", "Park", "Restaurant", "Beach", "Mountain", "City Tour"], [0.2,0.2,0.2,0.15,0.15,0.1]),
        "rating": round(random.uniform(3.5, 5.0),1),
        "popularity_score": round(random.uniform(0,1),3),
        "visit_duration_minutes": random.randint(30, 180),
        "cost_level": weighted_choice(["low", "medium", "high"], [0.5,0.3,0.2]),
    }
def simulate_behavioral_signals(preferences: dict, itenerary_acceptance: float) -> dict:
    """Behavior signals influenced by preference alignment."""
    # Simple: if activity types match preferences > threshold -> higher engagement
    activity_match = sum(preferences[act] for act in ["culture", "food", "nature", "adventure", "relaxation", "shopping", "nightlife"])
    engagement_base = activity_match / 7
    user_engage = random.gauss(engagement_base, 0.1)
    user_engage = max(0, min(user_engage, 1))
    return {
        "ai_itinerary_accepted": random.random() < itenerary_acceptance,
        "ai_itinerary_modified": random.random() < (0.5*(1 - itenerary_acceptance)),
        "attraction_viewed_count": random.randint(5, 50),
        "trip_planner_invoked_count": random.randint(1,5),
        "user_engagement_score": round(user_engage, 2),
    }
# ------------------------------------------------------------------------------
# ---- MAIN GENERATION LOOP -------------------------------------------------------
# ------------------------------------------------------------------------------
def generate_row(idx: int) -> dict:
    up = simulate_user_profile()
    prefs = simulate_preferences()
    ctx = simulate_trip_context()
    # destination type and popularity
    dest_type = weighted_choice(DESTINATION_TYPE, [0.25]*6)
    # Mock popularity score based on how often a country appears (simplified)
    popularity = random.uniform(0.4, 1.0)  # 0–1
    route = simulate_location_and_route(dest_type)
    budget = simulate_budget_and_expense(ctx["trip_duration_days"], ctx["group_size"], popularity)
    # Derived fields
    budget_per_day = budget["total_budget"] / ctx["trip_duration_days"]
    group_size_cat = "single" if ctx["group_size"] in ("solo", "couple") else "group"
    distance_category = "local" if route["distance_km"] <= 200 else ("domestic" if route["distance_km"] <= 1500 else "international")
    budget_utilization = random.uniform(0.7,1.2)  # placeholder
    ai_acceptance = random.uniform(0.5,0.9)  # bias high
    itinerary = simulate_itinerary(ctx["trip_duration_days"], dest_type, budget["total_budget"])
    # Flatten itinerary into strings (JSON-like)
    activities = ";".join([f"{a['day']}:{a['sequence']}:{a['activity_type']}:{a['duration_minutes']}:{a['cost_level']}" for a in itinerary])
    behavior = simulate_behavioral_signals(prefs, ai_acceptance)
    row = {
        # User profile
        **up,
        # Preferences
        **prefs,
        # Trip context
        **ctx,
        # Geographic route
        **route,
        # Budget
        **budget,
        # Derived features
        "budget_per_day": round(budget_per_day, 2),
        "group_size_category": group_size_cat,
        "distance_category": distance_category,
        "budget_utilization_ratio": round(budget_utilization,2),
        "destination_popularity_score": round(popularity,3),
        "ai_suggestion_acceptance_rate": round(ai_acceptance,3),
        # Itinerary (compact)
        "daily_activities": activities,
        # POI (simplified)
        "poi_category": simulate_poi_attributes()["category"],
        "poi_rating": simulate_poi_attributes()["rating"],
        "poi_popularity_score": simulate_poi_attributes()["popularity_score"],
        "poi_visit_duration_minutes": simulate_poi_attributes()["visit_duration_minutes"],
        "poi_cost_level": simulate_poi_attributes()["cost_level"],
        # Behavioral signals
        **behavior,
        # Derived
        "itinerary_completion_rate": round(random.uniform(0.7,1.0),2),
    }
    return row
# ------------------------------------------------------------------------------
# ---- CSV WRITER ---------------------------------------------------------------
# ------------------------------------------------------------------------------
def write_csv(rows: list[dict], header: list[str], out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)
# ------------------------------------------------------------------------------
# ---- SUMMARY STATISTICS ----------------------------------------------------------
# ------------------------------------------------------------------------------
def compute_stats(df: pd.DataFrame):
    print("\n==== SUMMARY STATISTICS ====")
    print(df.describe(include="all").round(2))
    # custom distributions
    print("\nTrip duration distribution")
    print(df["trip_duration_days"].value_counts().sort_index())
    print("\nBudget tier distribution")
    print(df["budget_tier"].value_counts(normalize=True).round(2))
    print("\nGroup size distribution")
    print(df["group_size"].value_counts(normalize=True).round(2))
    print("\nDestination type distribution")
    print(df["destination_type"].value_counts(normalize=True).round(2))
    print("\nSeason distribution")
    print(df["season"].value_counts(normalize=True).round(2))
# ------------------------------------------------------------------------------
def main():
    header = [
        # user profile
        "travel_experience_level",
        "travel_frequency",
        "engagement_level",
        # preferences
        *PREFS,
        # trip context
        "country_code",
        "country_name",
        "city",
        "season",
        "trip_duration_days",
        "group_size",
        # location & route
        "distance_km",
        "estimated_time_minutes",
        "transport_mode",
        "destination_type",
        "traffic_condition",
        # budget
        "budget_tier",
        "total_budget",
        # derived
        "budget_per_day",
        "group_size_category",
        "distance_category",
        "budget_utilization_ratio",
        "destination_popularity_score",
        "ai_suggestion_acceptance_rate",
        # itinerary
        "daily_activities",
        # poi
        "poi_category",
        "poi_rating",
        "poi_popularity_score",
        "poi_visit_duration_minutes",
        "poi_cost_level",
        # behavioral
        "ai_itinerary_accepted",
        "ai_itinerary_modified",
        "attraction_viewed_count",
        "trip_planner_invoked_count",
        "user_engagement_score",
        # itinerary completion
        "itinerary_completion_rate",
    ]
    print(f"Generating {ROW_COUNT:,} rows in batches of {BATCH_SIZE} …")
    rows_buffer = []
    all_rows = []
    for i in tqdm(range(ROW_COUNT), position=0, leave=True):
        row = generate_row(i)
        rows_buffer.append(row)
        if len(rows_buffer) >= BATCH_SIZE:
            write_csv(rows_buffer, header, OUTPUT_CSV)
            all_rows.extend(rows_buffer)
            rows_buffer.clear()
    # write remaining
    if rows_buffer:
        write_csv(rows_buffer, header, OUTPUT_CSV)
        all_rows.extend(rows_buffer)
    print(f"CSV written to {OUTPUT_CSV.resolve()}")
    # load into DataFrame for stats
    df = pd.read_csv(OUTPUT_CSV)
    compute_stats(df)
    print("\nFirst 10 rows preview:")
    print(df.head(10).to_string(index=False))
if __name__ == "__main__":
    main()