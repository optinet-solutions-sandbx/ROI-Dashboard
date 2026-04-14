import pandas as pd
from src.normalizer import normalize_columns


def test_normalize_strips_and_lowercases():
    df = pd.DataFrame(columns=["  Affiliate ID ", "Revenue ($)", "FTDs "])
    result = normalize_columns(df)
    assert list(result.columns) == ["affiliate_id", "revenue", "ftds"]


def test_normalize_does_not_mutate_original():
    df = pd.DataFrame(columns=["My Column"])
    normalize_columns(df)
    assert list(df.columns) == ["My Column"]


def test_normalize_handles_multiple_special_chars():
    df = pd.DataFrame(columns=["Cost / FTD ($)", "Avg. Deposit"])
    result = normalize_columns(df)
    assert list(result.columns) == ["cost_ftd", "avg_deposit"]
