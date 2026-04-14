import pytest
import pandas as pd
from src.data_loader import load_excel_sheets


def test_load_returns_dict_of_dataframes(tmp_path):
    # Create a minimal Excel file with two sheets
    sample = tmp_path / "sample.xlsx"
    with pd.ExcelWriter(sample, engine="openpyxl") as writer:
        pd.DataFrame({"a": [1, 2]}).to_excel(writer, sheet_name="Sheet1", index=False)
        pd.DataFrame({"b": [3, 4]}).to_excel(writer, sheet_name="Sheet2", index=False)

    sheets = load_excel_sheets(str(sample))
    assert isinstance(sheets, dict)
    assert len(sheets) == 2
    assert "Sheet1" in sheets
    assert isinstance(sheets["Sheet1"], pd.DataFrame)
