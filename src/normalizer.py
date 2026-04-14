import re
import pandas as pd


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Strip, lowercase, and remove special characters from column names."""
    df = df.copy()
    df.columns = [
        re.sub(r"[^a-z0-9]+", "_", col.strip().lower()).strip("_")
        for col in df.columns
    ]
    return df
