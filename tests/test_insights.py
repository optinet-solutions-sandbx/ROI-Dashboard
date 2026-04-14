import pandas as pd
from src.insights import generate_insights


def test_insights_returns_top_and_worst():
    df = pd.DataFrame({
        "affiliate_id": ["A", "B", "C"],
        "profit": [500.0, -100.0, 300.0],
        "roi": [1.25, -0.5, 0.75],
    })
    result = generate_insights(df)
    assert result["top_affiliates"][0] == "A"
    assert result["worst_affiliates"][0] == "B"
    assert len(result["recommendations"]) >= 1


def test_insights_recommends_pausing_negative_roi():
    df = pd.DataFrame({
        "affiliate_id": ["A", "B"],
        "profit": [100.0, -200.0],
        "roi": [0.5, -0.8],
    })
    result = generate_insights(df)
    assert any("negative ROI" in r for r in result["recommendations"])


def test_insights_recommends_scaling_top_performer():
    df = pd.DataFrame({
        "affiliate_id": ["A", "B"],
        "profit": [1000.0, 50.0],
        "roi": [3.0, 0.2],
    })
    result = generate_insights(df)
    assert any("Scale budget" in r for r in result["recommendations"])
