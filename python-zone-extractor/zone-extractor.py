import pandas as pd

xlsx_path = "zones-cleaned.xlsx"

# Load file (header in first row assumed)
df = pd.read_excel(xlsx_path)

# Normalize column names just in case
df.columns = [c.strip().lower() for c in df.columns]

# Helper: convert hourly to 0, NaN stays NaN
def parse_zone(val):
    if pd.isna(val):
        return None
    if isinstance(val, str) and val.strip().lower() == "hourly":
        return 0
    try:
        return int(val)
    except (ValueError, TypeError):
        return None

# Helper: format ZIP codes properly (remove .0 and handle NaN)
def format_zip_code(val):
    if pd.isna(val):
        return None
    try:
        # Convert to int first to remove decimal, then to string
        return str(int(val))
    except (ValueError, TypeError):
        return str(val).strip() if val else None

# Apply transformations
df["dfw"] = df["dfw"].apply(parse_zone)
df["dal"] = df["dal"].apply(parse_zone)

# Rename columns to match expected output format
df = df.rename(columns={
    "zip": "zip_code",
    "dfw": "dfw_zone", 
    "dal": "dal_zone"
})

# Format ZIP codes to remove .0 decimal places
df["zip_code"] = df["zip_code"].apply(format_zip_code)

# Keep only the columns we want, remove duplicates
out_df = df[["zip_code", "city", "dfw_zone", "dal_zone"]].drop_duplicates()

# Save to CSV
out_df.to_csv("zones.csv", index=False)

print(f"✅ Written zones.csv with {len(out_df)} rows.")
