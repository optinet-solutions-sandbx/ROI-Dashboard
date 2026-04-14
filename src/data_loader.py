import pandas as pd


def load_excel_sheets(filepath) -> dict[str, pd.DataFrame]:
    """Load all sheets from an Excel file into a dict of DataFrames.

    Accepts a file path (str/Path) or a file-like object (e.g. BytesIO from st.file_uploader).
    """
    xl = pd.ExcelFile(filepath)
    return {sheet: xl.parse(sheet) for sheet in xl.sheet_names}
