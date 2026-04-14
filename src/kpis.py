import pandas as pd


def calculate_kpis(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived KPI columns to the data model.

    Assumptions:
      - 'revenue', 'cost', 'clicks', 'ftds', 'deposits' columns exist where applicable.
      - Division by zero is replaced with NaN.
    """
    df = df.copy()
    if "revenue" in df.columns and "cost" in df.columns:
        df["profit"] = df["revenue"] - df["cost"]
        df["roi"] = df["profit"] / df["cost"].replace(0, float("nan"))
    if "cost" in df.columns and "ftds" in df.columns:
        df["cpa"] = df["cost"] / df["ftds"].replace(0, float("nan"))
    if "ftds" in df.columns and "clicks" in df.columns:
        df["conversion_rate"] = df["ftds"] / df["clicks"].replace(0, float("nan"))
    if "deposits" in df.columns and "ftds" in df.columns:
        df["avg_deposit"] = df["deposits"] / df["ftds"].replace(0, float("nan"))
    return df
