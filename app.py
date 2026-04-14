import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from src.data_loader import load_excel_sheets
from src.normalizer import normalize_columns
from src.model_builder import build_model
from src.kpis import calculate_kpis
from src.insights import generate_insights

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Affiliate Performance Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Dark-theme CSS (matching the reference design) ───────────────────────────
st.markdown(
    """
    <style>
    /* ---- Global background ---- */
    .stApp {
        background-color: #0a0f1e;
        color: #e2e8f0;
    }
    /* ---- Sidebar ---- */
    [data-testid="stSidebar"] {
        background-color: #0d1427 !important;
        border-right: 1px solid #1e293b;
    }
    [data-testid="stSidebar"] * {
        color: #94a3b8 !important;
    }
    [data-testid="stSidebar"] h1,
    [data-testid="stSidebar"] h2,
    [data-testid="stSidebar"] h3 {
        color: #e2e8f0 !important;
    }
    /* ---- Main headings ---- */
    h1, h2, h3 { color: #e2e8f0 !important; }
    /* ---- KPI card tiles ---- */
    .kpi-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #1e3a5f;
        border-radius: 12px;
        padding: 18px 22px;
        text-align: center;
        box-shadow: 0 4px 24px rgba(0, 212, 255, 0.07);
    }
    .kpi-label {
        font-size: 0.78rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 6px;
    }
    .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        color: #00d4ff;
        line-height: 1.1;
    }
    .kpi-sub {
        font-size: 0.72rem;
        color: #475569;
        margin-top: 4px;
    }
    /* ---- Chart containers ---- */
    .chart-card {
        background: #0d1427;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 4px;
        margin-bottom: 16px;
    }
    /* ---- Insight banners ---- */
    .insight-banner {
        background: linear-gradient(90deg, #1e3a5f 0%, #0f172a 100%);
        border-left: 3px solid #00d4ff;
        border-radius: 6px;
        padding: 10px 16px;
        margin-bottom: 8px;
        color: #cbd5e1;
        font-size: 0.9rem;
    }
    /* ---- Dataframe ---- */
    [data-testid="stDataFrame"] {
        background: #0d1427;
    }
    /* ---- Metric widgets ---- */
    [data-testid="stMetricValue"] { color: #00d4ff !important; }
    [data-testid="stMetricLabel"] { color: #64748b !important; }
    /* ---- Plotly chart borders ---- */
    .js-plotly-plot .plotly { border-radius: 10px; overflow: hidden; }
    /* ---- File uploader ---- */
    [data-testid="stFileUploader"] {
        border: 2px dashed #1e3a5f !important;
        border-radius: 10px;
        background: #0d1427;
    }
    /* ---- Buttons ---- */
    .stButton > button {
        background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%);
        color: white;
        border: none;
        border-radius: 8px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Plotly dark template ──────────────────────────────────────────────────────
PLOTLY_LAYOUT = dict(
    template="plotly_dark",
    paper_bgcolor="#0d1427",
    plot_bgcolor="#0d1427",
    font=dict(color="#94a3b8", family="Inter, sans-serif"),
    margin=dict(l=16, r=16, t=40, b=16),
    legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#94a3b8")),
    xaxis=dict(gridcolor="#1e293b", zerolinecolor="#1e293b"),
    yaxis=dict(gridcolor="#1e293b", zerolinecolor="#1e293b"),
)
PALETTE = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]


def fmt_currency(v):
    return f"${v:,.0f}" if not pd.isna(v) else "N/A"


def fmt_pct(v):
    return f"{v:.1%}" if not pd.isna(v) else "N/A"


# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 📊 RIO Dashboard")
    st.markdown("---")
    uploaded = st.file_uploader("Upload Excel file", type=["xlsx"])
    st.markdown("---")
    st.markdown("### Navigation")
    page = st.radio(
        "",
        ["Overview", "Affiliates", "Campaigns", "Insights"],
        label_visibility="collapsed",
    )

if not uploaded:
    st.markdown(
        """
        <div style='text-align:center; padding: 80px 0;'>
            <div style='font-size: 3rem; margin-bottom: 16px;'>📂</div>
            <h2 style='color: #e2e8f0;'>Affiliate Performance Dashboard</h2>
            <p style='color: #64748b; font-size: 1rem;'>
                Upload an Excel file via the sidebar to get started.<br>
                The file should contain sheets with affiliate traffic and revenue data.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.stop()

# ── Load & build model ────────────────────────────────────────────────────────
@st.cache_data
def load_data(file_bytes: bytes) -> pd.DataFrame:
    import io
    raw = load_excel_sheets(io.BytesIO(file_bytes))
    sheets = {k: normalize_columns(v) for k, v in raw.items()}
    df = build_model(sheets)
    return calculate_kpis(df)


df_full = load_data(uploaded.read())

# ── Sidebar filters ───────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("---")
    st.markdown("### Filters")
    df = df_full.copy()

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        valid_dates = df["date"].dropna()
        if not valid_dates.empty:
            min_d, max_d = valid_dates.min().date(), valid_dates.max().date()
            date_range = st.date_input("Date Range", [min_d, max_d])
            if len(date_range) == 2:
                df = df[
                    (df["date"] >= pd.Timestamp(date_range[0]))
                    & (df["date"] <= pd.Timestamp(date_range[1]))
                ]

    if "affiliate_id" in df.columns:
        all_aff = sorted(df["affiliate_id"].dropna().unique().tolist())
        sel_aff = st.multiselect("Affiliate", all_aff, default=all_aff)
        df = df[df["affiliate_id"].isin(sel_aff)]

    if "country" in df.columns:
        all_countries = sorted(df["country"].dropna().unique().tolist())
        sel_countries = st.multiselect("Country", all_countries, default=all_countries)
        df = df[df["country"].isin(sel_countries)]

    if "campaign" in df.columns:
        all_camps = sorted(df["campaign"].dropna().unique().tolist())
        sel_camps = st.multiselect("Campaign", all_camps, default=all_camps)
        df = df[df["campaign"].isin(sel_camps)]

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown(
    "<h1 style='margin-bottom:4px;'>Affiliate Performance Dashboard</h1>"
    "<p style='color:#64748b; margin-bottom:24px;'>Real-time analytics & insights for affiliate managers</p>",
    unsafe_allow_html=True,
)

# ══════════════════════════════════════════════════════════════════════════════
# OVERVIEW PAGE
# ══════════════════════════════════════════════════════════════════════════════
if page == "Overview":

    # ── KPI Cards ────────────────────────────────────────────────────────────
    st.markdown("### Key Performance Indicators")
    kpi_defs = [
        ("Revenue",         "revenue",         fmt_currency,  "#00d4ff"),
        ("Cost",            "cost",            fmt_currency,  "#f59e0b"),
        ("Profit",          "profit",          fmt_currency,  "#10b981"),
        ("ROI",             "roi",             fmt_pct,       "#7c3aed"),
        ("FTDs",            "ftds",            lambda v: f"{v:,.0f}", "#ec4899"),
        ("CPA",             "cpa",             fmt_currency,  "#ef4444"),
    ]
    cols = st.columns(len(kpi_defs))
    for col, (label, key, formatter, color) in zip(cols, kpi_defs):
        if key in df.columns:
            val = df[key].sum() if key not in ("roi", "cpa") else df[key].mean()
            col.markdown(
                f"""<div class='kpi-card'>
                    <div class='kpi-label'>{label}</div>
                    <div class='kpi-value' style='color:{color};'>{formatter(val)}</div>
                </div>""",
                unsafe_allow_html=True,
            )

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Revenue / Cost / Profit over time ─────────────────────────────────────
    if "date" in df.columns and df["date"].notna().any():
        st.markdown("### Performance Over Time")
        time_df = df.groupby("date")[
            [c for c in ["revenue", "cost", "profit"] if c in df.columns]
        ].sum().reset_index()
        fig = go.Figure()
        colors_map = {"revenue": "#00d4ff", "cost": "#f59e0b", "profit": "#10b981"}
        for metric in ["revenue", "cost", "profit"]:
            if metric in time_df.columns:
                fig.add_trace(go.Scatter(
                    x=time_df["date"], y=time_df[metric],
                    name=metric.title(),
                    line=dict(color=colors_map[metric], width=2),
                    fill="tozeroy",
                    fillcolor=colors_map[metric].replace(")", ", 0.08)").replace("rgb", "rgba")
                    if "rgb" in colors_map[metric]
                    else colors_map[metric] + "14",
                    mode="lines",
                ))
        fig.update_layout(title="Revenue / Cost / Profit", **PLOTLY_LAYOUT)
        st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
        st.plotly_chart(fig, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # ── ROI Trend ─────────────────────────────────────────────────────────────
    if "date" in df.columns and "roi" in df.columns and df["date"].notna().any():
        roi_df = df.groupby("date")["roi"].mean().reset_index()
        fig_roi = go.Figure()
        fig_roi.add_trace(go.Scatter(
            x=roi_df["date"], y=roi_df["roi"],
            name="ROI",
            line=dict(color="#7c3aed", width=2),
            fill="tozeroy",
            fillcolor="#7c3aed14",
            mode="lines+markers",
            marker=dict(size=5),
        ))
        fig_roi.update_layout(title="ROI Trend Over Time", yaxis_tickformat=".0%", **PLOTLY_LAYOUT)
        st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
        st.plotly_chart(fig_roi, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # ── Two-column charts ──────────────────────────────────────────────────────
    col_l, col_r = st.columns(2)

    with col_l:
        if "affiliate_id" in df.columns and "profit" in df.columns:
            top_aff = (
                df.groupby("affiliate_id")["profit"].sum()
                .nlargest(10)
                .reset_index()
                .sort_values("profit")
            )
            fig_aff = go.Figure(go.Bar(
                x=top_aff["profit"],
                y=top_aff["affiliate_id"].astype(str),
                orientation="h",
                marker=dict(
                    color=top_aff["profit"],
                    colorscale=[[0, "#0f172a"], [0.5, "#0ea5e9"], [1, "#00d4ff"]],
                    showscale=False,
                ),
            ))
            fig_aff.update_layout(title="Top Affiliates by Profit", **PLOTLY_LAYOUT)
            st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
            st.plotly_chart(fig_aff, use_container_width=True)
            st.markdown("</div>", unsafe_allow_html=True)

    with col_r:
        if "country" in df.columns and "revenue" in df.columns:
            country_df = df.groupby("country")["revenue"].sum().reset_index()
            fig_ctry = go.Figure(go.Pie(
                labels=country_df["country"],
                values=country_df["revenue"],
                hole=0.55,
                marker=dict(colors=PALETTE),
                textfont=dict(color="#e2e8f0"),
            ))
            fig_ctry.update_layout(
                title="Revenue by Country",
                legend=dict(font=dict(color="#94a3b8")),
                **PLOTLY_LAYOUT,
            )
            st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
            st.plotly_chart(fig_ctry, use_container_width=True)
            st.markdown("</div>", unsafe_allow_html=True)

    # ── Funnel ────────────────────────────────────────────────────────────────
    funnel_cols = [c for c in ["clicks", "registrations", "ftds"] if c in df.columns]
    if len(funnel_cols) >= 2:
        st.markdown("### Conversion Funnel")
        funnel_vals = [df[c].sum() for c in funnel_cols]
        fig_funnel = go.Figure(go.Funnel(
            y=[c.title() for c in funnel_cols],
            x=funnel_vals,
            textinfo="value+percent initial",
            marker=dict(color=["#00d4ff", "#7c3aed", "#10b981"][:len(funnel_cols)]),
        ))
        fig_funnel.update_layout(title="Clicks → Registrations → FTDs", **PLOTLY_LAYOUT)
        st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
        st.plotly_chart(fig_funnel, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# AFFILIATES PAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "Affiliates":
    st.markdown("### Affiliate Performance Table")
    table_cols = [c for c in ["affiliate_id", "clicks", "ftds", "revenue", "cost", "profit", "roi", "cpa", "conversion_rate"] if c in df.columns]
    if table_cols:
        display = df[table_cols].copy()
        if "roi" in display.columns:
            display["roi"] = display["roi"].map(lambda v: f"{v:.1%}" if not pd.isna(v) else "N/A")
        if "cpa" in display.columns:
            display["cpa"] = display["cpa"].map(lambda v: f"${v:,.2f}" if not pd.isna(v) else "N/A")
        if "conversion_rate" in display.columns:
            display["conversion_rate"] = display["conversion_rate"].map(
                lambda v: f"{v:.2%}" if not pd.isna(v) else "N/A"
            )
        st.dataframe(
            display.sort_values("profit", ascending=False) if "profit" in display.columns else display,
            use_container_width=True,
            height=500,
        )
    else:
        st.info("No affiliate data columns detected after normalization.")

    # Scatter: Clicks vs Profit
    if "clicks" in df.columns and "profit" in df.columns and "affiliate_id" in df.columns:
        st.markdown("### Clicks vs Profit Scatter")
        agg = df.groupby("affiliate_id").agg({"clicks": "sum", "profit": "sum"}).reset_index()
        fig_sc = px.scatter(
            agg, x="clicks", y="profit",
            text="affiliate_id",
            color="profit",
            color_continuous_scale=[[0, "#ef4444"], [0.5, "#f59e0b"], [1, "#10b981"]],
            labels={"clicks": "Total Clicks", "profit": "Total Profit"},
        )
        fig_sc.update_traces(textposition="top center", marker=dict(size=10))
        fig_sc.update_layout(title="Affiliate Clicks vs Profit", **PLOTLY_LAYOUT)
        st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
        st.plotly_chart(fig_sc, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# CAMPAIGNS PAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "Campaigns":
    st.markdown("### Campaign Performance")

    camp_col = next((c for c in ["campaign", "brand", "traffic_source"] if c in df.columns), None)

    if camp_col and "roi" in df.columns:
        camp_df = df.groupby(camp_col).agg(
            {c: "sum" for c in ["revenue", "cost", "profit", "ftds", "clicks"] if c in df.columns}
        ).reset_index()
        if "profit" in camp_df.columns and "cost" in camp_df.columns:
            camp_df["roi"] = camp_df["profit"] / camp_df["cost"].replace(0, float("nan"))

        top_camps = camp_df.nlargest(10, "roi") if "roi" in camp_df.columns else camp_df.head(10)
        fig_camp = go.Figure(go.Bar(
            x=top_camps[camp_col].astype(str),
            y=top_camps["roi"] if "roi" in top_camps.columns else top_camps.get("revenue", []),
            marker=dict(color=PALETTE[: len(top_camps)], opacity=0.85),
        ))
        fig_camp.update_layout(
            title=f"Top Campaigns by ROI",
            yaxis_tickformat=".0%",
            **PLOTLY_LAYOUT,
        )
        st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
        st.plotly_chart(fig_camp, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

        st.dataframe(camp_df.sort_values("roi", ascending=False) if "roi" in camp_df.columns else camp_df, use_container_width=True)
    else:
        st.info("No campaign / brand / traffic_source column detected in the data.")

# ══════════════════════════════════════════════════════════════════════════════
# INSIGHTS PAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "Insights":
    st.markdown("### Automated Insights & Recommendations")

    required = {"affiliate_id", "profit", "roi"}
    if required.issubset(df.columns):
        insights = generate_insights(df)

        col_t, col_w = st.columns(2)
        with col_t:
            st.markdown("#### Top Performers")
            for rank, aff in enumerate(insights["top_affiliates"], 1):
                profit_val = df[df["affiliate_id"] == aff]["profit"].sum()
                st.markdown(
                    f"<div class='insight-banner'>"
                    f"<span style='color:#00d4ff;font-weight:700;'>#{rank}</span> &nbsp;"
                    f"<strong>{aff}</strong> &nbsp;·&nbsp; Profit: {fmt_currency(profit_val)}"
                    f"</div>",
                    unsafe_allow_html=True,
                )

        with col_w:
            st.markdown("#### Underperformers (Lowest ROI)")
            for aff in insights["worst_affiliates"]:
                roi_val = df[df["affiliate_id"] == aff]["roi"].mean()
                st.markdown(
                    f"<div class='insight-banner' style='border-color:#ef4444;'>"
                    f"<strong style='color:#ef4444;'>{aff}</strong> &nbsp;·&nbsp; ROI: {fmt_pct(roi_val)}"
                    f"</div>",
                    unsafe_allow_html=True,
                )

        st.markdown("#### Recommendations")
        for rec in insights["recommendations"]:
            st.markdown(
                f"<div class='insight-banner'>"
                f"<span style='color:#00d4ff;'>▸</span> {rec}"
                f"</div>",
                unsafe_allow_html=True,
            )

        # ROI distribution
        if "roi" in df.columns:
            fig_hist = px.histogram(
                df.dropna(subset=["roi"]),
                x="roi",
                nbins=20,
                color_discrete_sequence=["#7c3aed"],
                labels={"roi": "ROI"},
            )
            fig_hist.update_layout(title="ROI Distribution", **PLOTLY_LAYOUT)
            st.markdown("<div class='chart-card'>", unsafe_allow_html=True)
            st.plotly_chart(fig_hist, use_container_width=True)
            st.markdown("</div>", unsafe_allow_html=True)
    else:
        missing = required - set(df.columns)
        st.warning(f"Missing columns for insights: {', '.join(missing)}")

# ── Footer ────────────────────────────────────────────────────────────────────
st.markdown(
    "<div style='text-align:center; color:#1e293b; margin-top:40px; font-size:0.75rem;'>"
    "RIO Dashboard · Affiliate Performance Analytics"
    "</div>",
    unsafe_allow_html=True,
)
