import pandas as pd

# 1) Load your Excel file
xlsx_path = "Noble Lane Zip to Zone Guide.xlsx"
df = pd.read_excel(xlsx_path, sheet_name=0, header=None)

# 2) The sheet is laid out as [ZIP, ..., zone] on the same row.
#    Find the “zone” column by scanning each row for the first valid zone (1–5).
records = []
for _, row in df.iterrows():
    zip_code = str(row[0]).strip()
    if not zip_code.isdigit():
        continue  # skip headers or blank rows

    # scan the rest of the columns for a numeric zone
    for c in row[1:]:
        if pd.notna(c) and isinstance(c, (int, float)):
            zone = int(c)
            if zone in {1, 2, 3, 4, 5}:
                records.append({"zip_code": zip_code, "zone": zone})
                break
    else:
        raise ValueError(f"No zone found for ZIP {zip_code}")


# 3) Build DataFrame and sort
out_df = pd.DataFrame(records).drop_duplicates().sort_values(by=["zone","zip_code"])

# 4) Write to CSV
out_df.to_csv("zones.csv", index=False)
print("✅ Written zones.csv with", len(out_df), "rows.")
