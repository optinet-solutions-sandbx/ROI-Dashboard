import pytest
import pandas as pd
from src.kpis import calculate_kpis


def test_kpi_calculations():
    df = pd.DataFrame({
        "revenue": [1000.0],
        "cost": [400.0],
        "clicks": [200],
        "ftds": [10],
        "deposits": [800.0],
    })
    result = calculate_kpis(df)
    assert result["profit"].iloc[0] == 600.0
    assert result["roi"].iloc[0] == pytest.approx(1.5)
    assert result["cpa"].iloc[0] == 40.0
    assert result["conversion_rate"].iloc[0] == 0.05
    assert result["avg_deposit"].iloc[0] == 80.0


def test_kpi_zero_cost_produces_nan_roi():
    df = pd.DataFrame({"revenue": [100.0], "cost": [0.0], "ftds": [5], "clicks": [50]})
    result = calculate_kpis(df)
    assert pd.isna(result["roi"].iloc[0])


def test_kpi_does_not_mutate_original():
    df = pd.DataFrame({"revenue": [100.0], "cost": [50.0]})
    calculate_kpis(df)
    assert "profit" not in df.columns
