import pandas as pd


def generate_insights(df: pd.DataFrame) -> dict:
    """Return top/worst affiliates and actionable recommendations.

    Assumptions:
      - df has 'affiliate_id', 'profit', 'roi' columns.
    """
    top = df.nlargest(5, "profit")["affiliate_id"].tolist()
    worst = df.nsmallest(5, "roi")["affiliate_id"].tolist()
    negative_roi = df[df["roi"] < 0]

    recommendations = []
    if not negative_roi.empty:
        recommendations.append(
            f"Pause or renegotiate with {len(negative_roi)} affiliate(s) with negative ROI."
        )
    if df["roi"].max() > 2:
        best = df.loc[df["roi"].idxmax(), "affiliate_id"]
        recommendations.append(f"Scale budget for top performer: {best}.")
    top_5_share = df.nlargest(5, "profit")["profit"].sum() / df["profit"].sum() if df["profit"].sum() != 0 else 0
    if top_5_share > 0.8:
        recommendations.append(
            "Top 5 affiliates drive >80% of profit — diversify to reduce concentration risk."
        )
    recommendations.append("Review CPA monthly and set maximum CPA thresholds per campaign.")
    if "conversion_rate" in df.columns and (df["conversion_rate"] < 0.01).any():
        recommendations.append(
            "Several affiliates have <1% conversion rate — review landing pages and traffic quality."
        )

    return {
        "top_affiliates": top,
        "worst_affiliates": worst,
        "recommendations": recommendations,
    }
