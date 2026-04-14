import pandas as pd
from src.model_builder import build_model


def test_build_model_merges_sheets():
    sheets = {
        "traffic": pd.DataFrame({"affiliate_id": [1], "clicks": [100], "ftds": [5]}),
        "revenue": pd.DataFrame({"affiliate_id": [1], "revenue": [500.0], "cost": [100.0]}),
    }
    model = build_model(sheets)
    assert "clicks" in model.columns
    assert "revenue" in model.columns
    assert len(model) == 1


def test_build_model_single_sheet_passthrough():
    df = pd.DataFrame({"affiliate_id": [1, 2], "clicks": [10, 20]})
    result = build_model({"only": df})
    assert result.equals(df)


def test_build_model_outer_join_preserves_all_rows():
    sheets = {
        "a": pd.DataFrame({"affiliate_id": [1, 2], "clicks": [10, 20]}),
        "b": pd.DataFrame({"affiliate_id": [2, 3], "revenue": [100.0, 200.0]}),
    }
    model = build_model(sheets)
    assert len(model) == 3
