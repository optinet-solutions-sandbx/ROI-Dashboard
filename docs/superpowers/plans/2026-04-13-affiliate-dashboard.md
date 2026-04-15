# Affiliate Performance Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Analyze affiliate performance Excel data and produce a clean, professional BI dashboard with KPIs, visuals, filters, and actionable insights for an affiliate manager.

**Architecture:** Load and normalize multi-sheet Excel data into a unified model, compute derived KPIs, render an interactive dashboard with global filters and chart sections, then surface automated insights and recommendations.

**Tech Stack:** Python (pandas, openpyxl), Streamlit or Power BI / Dash, Plotly for charts, Excel (.xlsx) as data source.

---

## AI Analyst System Prompt

> Use the prompt below when invoking an AI data analyst (e.g. Claude, GPT-4) against the uploaded Excel file.

---

You are a senior data analyst and BI dashboard expert.

I have uploaded an Excel file containing multiple sheets with affiliate performance data (ROI, traffic, revenue, deposits, etc.).

Your task is to:

### 1. UNDERSTAND THE DATA
- Analyze all sheets and identify relationships between them
- Detect key dimensions (e.g., Affiliate ID, Campaign, Country, Date)
- Detect key metrics (e.g., Revenue, Cost, Profit, ROI, FTDs, Deposits, Clicks)
- Clean and normalize inconsistent column names if needed
- Merge sheets into one structured data model

### 2. DEFINE KEY KPIs
Create and calculate the following metrics:
- Total Revenue
- Total Cost
- Profit (Revenue - Cost)
- ROI = Profit / Cost
- CPA (Cost per Acquisition)
- Conversion Rate (FTDs / Clicks)
- Average Deposit Value
- LTV if possible

### 3. BUILD A DASHBOARD *(IMPORTANT)*
Design a clean, professional affiliate manager dashboard with:

**A. FILTERS (GLOBAL)**
- Date range
- Affiliate
- Country
- Campaign / Brand
- Traffic Source (if exists)

**B. TOP KPI CARDS**
- Revenue
- Cost
- Profit
- ROI %
- FTDs
- CPA

**C. VISUALS**
- Time series: Revenue, Cost, Profit over time
- ROI trend over time
- Top affiliates by Profit
- Top campaigns by ROI
- Country performance breakdown
- Funnel: Clicks → Registrations → FTDs

**D. TABLE**
Detailed performance table per Affiliate:
Columns: `Affiliate | Clicks | FTDs | Revenue | Cost | Profit | ROI | CPA`

### 4. INSIGHTS *(VERY IMPORTANT)*
- Highlight top 5 performing affiliates
- Highlight worst performing affiliates (negative ROI)
- Detect anomalies or unusual spikes
- Provide 3–5 actionable recommendations

### 5. OUTPUT FORMAT
1. Explain the structure of the data briefly
2. Show calculated KPI formulas
3. Present the dashboard layout clearly (sections)
4. Provide insights

**IMPORTANT:**
- Be structured and precise
- Do not assume missing data — state assumptions clearly
- If data is messy, fix it logically and explain
- Focus on usability for an affiliate manager making decisions daily

---

## Implementation Tasks

### Task 1: Data Ingestion & Sheet Discovery

**Files:**
- Create: `src/data_loader.py`
- Test: `tests/test_data_loader.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_data_loader.py
import pytest
from src.data_loader import load_excel_sheets

def test_load_returns_dict_of_dataframes():
    sheets = load_excel_sheets("data/sample.xlsx")
    assert isinstance(sheets, dict)
    assert len(sheets) > 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_data_loader.py::test_load_returns_dict_of_dataframes -v`
Expected: FAIL with `ModuleNotFoundError` or `FileNotFoundError`

- [ ] **Step 3: Write minimal implementation**

```python
# src/data_loader.py
import pandas as pd

def load_excel_sheets(filepath: str) -> dict[str, pd.DataFrame]:
    """Load all sheets from an Excel file into a dict of DataFrames."""
    xl = pd.ExcelFile(filepath)
    return {sheet: xl.parse(sheet) for sheet in xl.sheet_names}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_data_loader.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data_loader.py tests/test_data_loader.py
git commit -m "feat: load all Excel sheets into DataFrames"
```

---

### Task 2: Column Normalization & Data Cleaning

**Files:**
- Create: `src/normalizer.py`
- Test: `tests/test_normalizer.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_normalizer.py
import pandas as pd
from src.normalizer import normalize_columns

def test_normalize_strips_and_lowercases():
    df = pd.DataFrame(columns=["  Affiliate ID ", "Revenue ($)", "FTDs "])
    result = normalize_columns(df)
    assert list(result.columns) == ["affiliate_id", "revenue", "ftds"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_normalizer.py::test_normalize_strips_and_lowercases -v`
Expected: FAIL with `ImportError`

- [ ] **Step 3: Write minimal implementation**

```python
# src/normalizer.py
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_normalizer.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/normalizer.py tests/test_normalizer.py
git commit -m "feat: normalize and clean Excel column names"
```

---

### Task 3: Merge Sheets into Unified Data Model

**Files:**
- Create: `src/model_builder.py`
- Test: `tests/test_model_builder.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_model_builder.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_model_builder.py::test_build_model_merges_sheets -v`
Expected: FAIL with `ImportError`

- [ ] **Step 3: Write minimal implementation**

```python
# src/model_builder.py
import pandas as pd
from functools import reduce

def build_model(sheets: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Merge all sheets on affiliate_id (inner join). Assumes all sheets share this key."""
    dfs = list(sheets.values())
    if len(dfs) == 1:
        return dfs[0]
    return reduce(lambda l, r: pd.merge(l, r, on="affiliate_id", how="outer"), dfs)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_model_builder.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/model_builder.py tests/test_model_builder.py
git commit -m "feat: merge Excel sheets into unified affiliate data model"
```

---

### Task 4: KPI Calculation

**Files:**
- Create: `src/kpis.py`
- Test: `tests/test_kpis.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_kpis.py
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
    assert result["profit"].iloc[0] == 600.0          # 1000 - 400
    assert result["roi"].iloc[0] == pytest.approx(1.5) # 600 / 400
    assert result["cpa"].iloc[0] == 40.0              # 400 / 10
    assert result["conversion_rate"].iloc[0] == 0.05  # 10 / 200
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_kpis.py::test_kpi_calculations -v`
Expected: FAIL with `ImportError`

- [ ] **Step 3: Write minimal implementation**

```python
# src/kpis.py
import pandas as pd

def calculate_kpis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds derived KPI columns to the data model.
    Assumptions:
      - 'revenue', 'cost', 'clicks', 'ftds', 'deposits' columns exist.
      - Division by zero is replaced with NaN.
    """
    df = df.copy()
    df["profit"] = df["revenue"] - df["cost"]
    df["roi"] = df["profit"] / df["cost"].replace(0, float("nan"))
    df["cpa"] = df["cost"] / df["ftds"].replace(0, float("nan"))
    df["conversion_rate"] = df["ftds"] / df["clicks"].replace(0, float("nan"))
    df["avg_deposit"] = df["deposits"] / df["ftds"].replace(0, float("nan"))
    return df
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_kpis.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/kpis.py tests/test_kpis.py
git commit -m "feat: calculate ROI, CPA, conversion rate, and profit KPIs"
```

---

### Task 5: Insights Engine

**Files:**
- Create: `src/insights.py`
- Test: `tests/test_insights.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_insights.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_insights.py::test_insights_returns_top_and_worst -v`
Expected: FAIL with `ImportError`

- [ ] **Step 3: Write minimal implementation**

```python
# src/insights.py
import pandas as pd

def generate_insights(df: pd.DataFrame) -> dict:
    """
    Returns top/worst affiliates and basic recommendations.
    Assumptions:
      - df has 'affiliate_id', 'profit', 'roi' columns.
    """
    top = df.nlargest(5, "profit")["affiliate_id"].tolist()
    worst = df.nsmallest(5, "roi")["affiliate_id"].tolist()
    negative_roi = df[df["roi"] < 0]

    recommendations = []
    if not negative_roi.empty:
        recommendations.append(
            f"Pause or renegotiate with {len(negative_roi)} affiliates with negative ROI."
        )
    if df["roi"].max() > 2:
        best = df.loc[df["roi"].idxmax(), "affiliate_id"]
        recommendations.append(f"Scale budget for top performer: {best}.")
    recommendations.append("Review CPA monthly and set maximum CPA thresholds per campaign.")

    return {
        "top_affiliates": top,
        "worst_affiliates": worst,
        "recommendations": recommendations,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_insights.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/insights.py tests/test_insights.py
git commit -m "feat: generate affiliate performance insights and recommendations"
```

---

### Task 6: Streamlit Dashboard

**Files:**
- Create: `app.py`
- (No unit tests — visual component; verify manually in browser)

- [ ] **Step 1: Install dependencies**

```bash
pip install streamlit plotly pandas openpyxl
```

- [ ] **Step 2: Build the dashboard shell with filters and KPI cards**

```python
# app.py
import streamlit as st
import pandas as pd
import plotly.express as px
from src.data_loader import load_excel_sheets
from src.normalizer import normalize_columns
from src.model_builder import build_model
from src.kpis import calculate_kpis
from src.insights import generate_insights

st.set_page_config(page_title="Affiliate Dashboard", layout="wide")
st.title("Affiliate Performance Dashboard")

uploaded = st.file_uploader("Upload Excel file", type=["xlsx"])
if not uploaded:
    st.info("Upload an Excel file to begin.")
    st.stop()

# --- Load & build model ---
raw_sheets = load_excel_sheets(uploaded)
sheets = {k: normalize_columns(v) for k, v in raw_sheets.items()}
df = build_model(sheets)
df = calculate_kpis(df)

# --- Global Filters ---
with st.sidebar:
    st.header("Filters")
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        date_range = st.date_input("Date Range", [df["date"].min(), df["date"].max()])
        df = df[(df["date"] >= pd.Timestamp(date_range[0])) & (df["date"] <= pd.Timestamp(date_range[1]))]
    if "affiliate_id" in df.columns:
        affiliates = st.multiselect("Affiliate", df["affiliate_id"].unique(), default=list(df["affiliate_id"].unique()))
        df = df[df["affiliate_id"].isin(affiliates)]
    if "country" in df.columns:
        countries = st.multiselect("Country", df["country"].unique(), default=list(df["country"].unique()))
        df = df[df["country"].isin(countries)]

# --- KPI Cards ---
st.subheader("Key Performance Indicators")
cols = st.columns(6)
kpi_map = {
    "Revenue": ("revenue", "${:,.0f}"),
    "Cost": ("cost", "${:,.0f}"),
    "Profit": ("profit", "${:,.0f}"),
    "ROI %": ("roi", "{:.1%}"),
    "FTDs": ("ftds", "{:,.0f}"),
    "CPA": ("cpa", "${:,.2f}"),
}
for col, (key, fmt) in zip(cols, kpi_map.items()):
    if key in df.columns:
        val = df[key].sum() if key not in ("roi", "cpa") else df[key].mean()
        col.metric(col, fmt.format(val))

# --- Charts ---
st.subheader("Performance Over Time")
if "date" in df.columns:
    time_df = df.groupby("date")[["revenue", "cost", "profit"]].sum().reset_index()
    st.plotly_chart(px.line(time_df, x="date", y=["revenue", "cost", "profit"], title="Revenue / Cost / Profit"), use_container_width=True)

col1, col2 = st.columns(2)
with col1:
    if "affiliate_id" in df.columns and "profit" in df.columns:
        top_aff = df.groupby("affiliate_id")["profit"].sum().nlargest(10).reset_index()
        st.plotly_chart(px.bar(top_aff, x="affiliate_id", y="profit", title="Top Affiliates by Profit"), use_container_width=True)
with col2:
    if "country" in df.columns and "revenue" in df.columns:
        country_df = df.groupby("country")["revenue"].sum().reset_index()
        st.plotly_chart(px.pie(country_df, names="country", values="revenue", title="Revenue by Country"), use_container_width=True)

# --- Detail Table ---
st.subheader("Affiliate Performance Table")
table_cols = [c for c in ["affiliate_id", "clicks", "ftds", "revenue", "cost", "profit", "roi", "cpa"] if c in df.columns]
st.dataframe(df[table_cols].sort_values("profit", ascending=False), use_container_width=True)

# --- Insights ---
st.subheader("Insights & Recommendations")
insights = generate_insights(df)
st.markdown(f"**Top affiliates:** {', '.join(str(a) for a in insights['top_affiliates'])}")
st.markdown(f"**Underperformers (low ROI):** {', '.join(str(a) for a in insights['worst_affiliates'])}")
for rec in insights["recommendations"]:
    st.info(rec)
```

- [ ] **Step 3: Run the dashboard**

```bash
streamlit run app.py
```

Expected: Browser opens at `http://localhost:8501` with upload widget.

- [ ] **Step 4: Upload Excel file and verify all sections render**

Check:
- KPI cards show non-zero values
- Charts render without errors
- Table displays and is sortable
- Insights section shows recommendations

- [ ] **Step 5: Commit**

```bash
git add app.py
git commit -m "feat: add Streamlit affiliate dashboard with filters, KPIs, charts, and insights"
```

---

## KPI Formula Reference

| KPI | Formula |
|-----|---------|
| Profit | `Revenue - Cost` |
| ROI | `Profit / Cost` |
| CPA | `Cost / FTDs` |
| Conversion Rate | `FTDs / Clicks` |
| Avg Deposit Value | `Total Deposits / FTDs` |

---

## Assumptions Log

> Document any assumptions made during analysis here.

- If `deposits` column is missing, `avg_deposit` and LTV will be skipped.
- If `date` column is absent, time-series charts will be hidden.
- Sheet merge key defaults to `affiliate_id`; update `model_builder.py` if the key differs.
- Negative ROI affiliates are defined as `roi < 0`.
