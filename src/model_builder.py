import pandas as pd
from functools import reduce


def build_model(sheets: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Merge all sheets on affiliate_id (outer join).

    Assumptions:
      - All sheets share an 'affiliate_id' column as the join key.
      - If only one sheet is provided, it is returned as-is.
    """
    dfs = list(sheets.values())
    if len(dfs) == 1:
        return dfs[0]
    return reduce(lambda l, r: pd.merge(l, r, on="affiliate_id", how="outer"), dfs)
