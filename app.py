from __future__ import annotations

from pathlib import Path

import folium
import pandas as pd
import plotly.express as px
import streamlit as st
from streamlit_folium import st_folium

from src.charts import build_mode_share_chart, build_patronage_chart
from src.spatial_analysis import build_lga_geojson
from src.utils import format_number, load_csv


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "processed"

MODE_COLOURS = {
    "Metropolitan train": "#2563eb",
    "Regional train": "#38bdf8",
    "Tram": "#16a34a",
    "Metropolitan bus": "#f97316",
    "Regional bus": "#a855f7",
    "Regional coach": "#dc2626",
}


st.set_page_config(
    page_title="Victoria Public Transport Spatial Insights",
    page_icon=":train:",
    layout="wide",
)


@st.cache_data
def load_dashboard_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    stops = load_csv(DATA_DIR / "sample_stops.csv")
    lga = load_csv(DATA_DIR / "sample_lga_access_summary.csv")
    patronage = load_csv(DATA_DIR / "sample_patronage_long.csv", parse_dates=["date"])
    return stops, lga, patronage


def metric_row(items: list[tuple[str, str, str | None]]) -> None:
    cols = st.columns(len(items))
    for col, (label, value, delta) in zip(cols, items):
        col.metric(label, value, delta)


def build_stop_map(stops: pd.DataFrame, lga: pd.DataFrame) -> folium.Map:
    m = folium.Map(location=[-37.25, 144.55], zoom_start=7, tiles="CartoDB positron")
    folium.GeoJson(
        build_lga_geojson(lga),
        name="LGA access summary",
        style_function=lambda feature: {
            "fillColor": "#dbeafe",
            "color": "#64748b",
            "weight": 1,
            "fillOpacity": 0.18,
        },
        tooltip=folium.GeoJsonTooltip(
            fields=["lga_name", "stop_count", "stop_density_per_sq_km", "mode_diversity"],
            aliases=["LGA", "Stops", "Stops / sq km", "Mode diversity"],
            localize=True,
        ),
    ).add_to(m)

    for mode, group in stops.groupby("mode"):
        layer = folium.FeatureGroup(name=mode, show=True)
        for row in group.itertuples():
            folium.CircleMarker(
                location=[row.lat, row.lon],
                radius=5,
                color=MODE_COLOURS.get(mode, "#475569"),
                fill=True,
                fill_opacity=0.75,
                popup=folium.Popup(
                    f"<strong>{row.stop_name}</strong><br>{mode}<br>{row.lga_name}",
                    max_width=260,
                ),
                tooltip=f"{row.stop_name} ({mode})",
            ).add_to(layer)
        layer.add_to(m)

    folium.LayerControl(collapsed=False).add_to(m)
    return m


def build_density_map(lga: pd.DataFrame) -> folium.Map:
    geojson = build_lga_geojson(lga)
    m = folium.Map(location=[-37.25, 144.55], zoom_start=7, tiles="CartoDB positron")
    folium.Choropleth(
        geo_data=geojson,
        data=lga,
        columns=["lga_name", "stop_density_per_sq_km"],
        key_on="feature.properties.lga_name",
        fill_color="YlGnBu",
        fill_opacity=0.78,
        line_opacity=0.45,
        legend_name="Stops per square kilometre",
        name="Stop density",
    ).add_to(m)
    folium.GeoJson(
        geojson,
        name="LGA labels",
        style_function=lambda _: {"fillOpacity": 0, "weight": 0.8, "color": "#334155"},
        tooltip=folium.GeoJsonTooltip(
            fields=["lga_name", "stop_count", "stop_density_per_sq_km", "mode_diversity"],
            aliases=["LGA", "Stops", "Stops / sq km", "Modes"],
            localize=True,
        ),
    ).add_to(m)
    return m


def coverage_tab(stops: pd.DataFrame, lga: pd.DataFrame) -> None:
    modes = sorted(stops["mode"].unique())
    selected_modes = st.multiselect("Transport mode", modes, default=modes)
    filtered = stops[stops["mode"].isin(selected_modes)]
    if filtered.empty:
        st.warning("Select at least one transport mode to draw the map.")
        return

    highest_density = lga.sort_values("stop_density_per_sq_km", ascending=False).iloc[0]["lga_name"]
    metric_row(
        [
            ("Stops in view", format_number(len(filtered)), None),
            ("Modes represented", format_number(filtered["mode"].nunique()), None),
            ("LGAs covered", format_number(filtered["lga_name"].nunique()), None),
            ("Highest density LGA", highest_density, None),
        ]
    )

    left, right = st.columns([2.2, 1])
    with left:
        st_folium(build_stop_map(filtered, lga), height=590, use_container_width=True)
    with right:
        mode_counts = filtered["mode"].value_counts().rename_axis("mode").reset_index(name="stops")
        fig = px.bar(
            mode_counts,
            x="stops",
            y="mode",
            orientation="h",
            color="mode",
            color_discrete_map=MODE_COLOURS,
            labels={"stops": "Stops", "mode": ""},
        )
        fig.update_layout(showlegend=False, height=350, margin=dict(l=0, r=10, t=20, b=20))
        st.plotly_chart(fig, use_container_width=True)
        st.info(
            "Inner Melbourne sample LGAs show the strongest stop concentration, while regional examples have lower density but often retain train or coach access."
        )


def patronage_tab(patronage: pd.DataFrame) -> None:
    modes = sorted(patronage["mode"].unique())
    selected = st.multiselect(
        "Modes",
        modes,
        default=["Metropolitan train", "Tram", "Metropolitan bus"],
    )
    years = sorted(patronage["date"].dt.year.unique())
    min_year, max_year = int(min(years)), int(max(years))
    year_range = st.slider("Year range", min_year, max_year, (min_year, max_year))
    filtered = patronage[
        patronage["mode"].isin(selected)
        & patronage["date"].dt.year.between(year_range[0], year_range[1])
    ]
    if filtered.empty:
        st.warning("Select at least one mode and year range with data.")
        return

    latest_date = filtered["date"].max()
    latest_total = filtered.loc[filtered["date"].eq(latest_date), "patronage"].sum()
    peak = filtered.sort_values("patronage", ascending=False).iloc[0]
    yoy = filtered.groupby("date", as_index=False)["patronage"].sum().sort_values("date")
    latest_yoy = yoy["patronage"].pct_change(12).iloc[-1] if len(yoy) > 12 else None

    metric_row(
        [
            ("Latest selected month", latest_date.strftime("%b %Y"), None),
            ("Latest patronage", format_number(latest_total), None),
            ("Highest mode-month", f"{peak['mode']} - {peak['date'].strftime('%b %Y')}", format_number(peak["patronage"])),
            ("YoY change", "n/a" if pd.isna(latest_yoy) else f"{latest_yoy:.1%}", None),
        ]
    )

    st.plotly_chart(build_patronage_chart(filtered, MODE_COLOURS), use_container_width=True)
    st.plotly_chart(build_mode_share_chart(filtered, MODE_COLOURS), use_container_width=True)
    st.info(
        "Metropolitan modes account for most patronage in the sample, with recovery and seasonality more visible for train, tram and metropolitan bus than regional coach."
    )


def access_tab(lga: pd.DataFrame) -> None:
    metric_row(
        [
            ("LGAs analysed", format_number(len(lga)), None),
            ("Median stop density", f"{lga['stop_density_per_sq_km'].median():.2f}", "stops / sq km"),
            ("Median mode diversity", format_number(int(lga["mode_diversity"].median())), "modes"),
            ("Indicative catchment", f"{lga['catchment_800m_pct'].median():.0%}", "median 800m buffer"),
        ]
    )

    left, right = st.columns([2, 1])
    with left:
        st_folium(build_density_map(lga), height=570, use_container_width=True)
    with right:
        st.plotly_chart(
            px.scatter(
                lga,
                x="stop_density_per_sq_km",
                y="mode_diversity",
                size="stop_count",
                color="region_type",
                hover_name="lga_name",
                labels={
                    "stop_density_per_sq_km": "Stops / sq km",
                    "mode_diversity": "Mode diversity",
                    "region_type": "Region type",
                },
            ).update_layout(height=330, margin=dict(l=0, r=10, t=25, b=20)),
            use_container_width=True,
        )
        st.dataframe(
            lga.sort_values("stop_density_per_sq_km", ascending=False)[
                ["lga_name", "stop_count", "stop_density_per_sq_km", "mode_diversity", "catchment_800m_pct"]
            ],
            hide_index=True,
            use_container_width=True,
        )

    st.info(
        "Stop density and mode diversity are useful screening indicators, but they do not replace service frequency, travel time, reliability, accessibility or population-need modelling."
    )


def main() -> None:
    stops, lga, patronage = load_dashboard_data()

    st.title("Victoria Public Transport Spatial Insights Dashboard")
    st.caption("Portfolio MVP for open-data GIS, patronage analytics and decision-ready transport planning communication.")
    st.write(
        "This dashboard explores Victorian public transport access and patronage using open government datasets. "
        "It combines geospatial analysis of public transport stops and routes with monthly patronage trends to provide "
        "planning-style insights into service coverage, mode distribution and transport usage patterns."
    )

    with st.expander("Data, cloud analytics and lifecycle notes", expanded=False):
        st.markdown(
            """
- The deployed MVP ships with compact sample data so the app is fast and reliable on Streamlit Community Cloud.
- `src/data_download.py`, `src/data_cleaning.py` and `src/spatial_analysis.py` document the path for replacing sample data with official Transport Victoria, Data Vic and Vicmap extracts.
- For larger operational datasets, the same pipeline could run in PySpark or Databricks, publish curated Delta tables, and use MLflow to track forecasting or accessibility model experiments.
            """
        )

    tab1, tab2, tab3 = st.tabs(
        ["Public Transport Coverage Map", "Patronage Trends by Mode", "Spatial Access Indicators"]
    )
    with tab1:
        coverage_tab(stops, lga)
    with tab2:
        patronage_tab(patronage)
    with tab3:
        access_tab(lga)

    st.divider()
    st.download_button(
        "Download LGA access summary CSV",
        data=lga.to_csv(index=False),
        file_name="vic_transport_lga_access_summary_sample.csv",
        mime="text/csv",
    )


if __name__ == "__main__":
    main()
