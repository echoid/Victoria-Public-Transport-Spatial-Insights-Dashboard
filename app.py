from __future__ import annotations

import json
from pathlib import Path

import folium
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from streamlit_folium import st_folium


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "processed" / "home_location_dashboard_data.json"

COLOURS = {
    "train": "#355070",
    "tram": "#6d597a",
    "bus": "#b56576",
    "school": "#e56b6f",
    "health": "#c75d68",
    "sport": "#eaac8b",
    "retail": "#8f6f8b",
    "property": "#b509ac",
}


st.set_page_config(
    page_title="Home Location Intelligence VIC",
    layout="wide",
)


@st.cache_data
def load_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, dict]:
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    properties = pd.DataFrame(payload["properties"])
    features = pd.DataFrame(payload["features"])
    targets = pd.DataFrame(payload["targets"])
    return properties, features, targets, payload["metadata"]


def format_money(value: float) -> str:
    return f"${value:,.0f}"


def build_map(
    properties: pd.DataFrame,
    features: pd.DataFrame,
    selected_id: str,
    radius_km: float = 2.0,
) -> folium.Map:
    selected = properties.loc[properties["property_id"] == selected_id].iloc[0]
    m = folium.Map(location=[selected.lat, selected.lon], zoom_start=13, tiles="CartoDB positron")

    for _, row in properties.iterrows():
        folium.CircleMarker(
            location=[row.lat, row.lon],
            radius=8 if row.property_id == selected_id else 5,
            color="#000000",
            fill=True,
            fill_color=COLOURS["property"] if row.property_id == selected_id else "#ffffff",
            fill_opacity=0.92,
            popup=f"{row.property_id} - {row.suburb}<br>{format_money(row.price)}<br>Score: {row.overall_score}/100",
        ).add_to(m)

    folium.Circle(
        location=[selected.lat, selected.lon],
        radius=400,
        color=COLOURS["property"],
        weight=1,
        fill=True,
        fill_opacity=0.04,
    ).add_to(m)
    folium.Circle(
        location=[selected.lat, selected.lon],
        radius=800,
        color=COLOURS["school"],
        weight=1,
        fill=True,
        fill_opacity=0.03,
    ).add_to(m)

    nearby = features.assign(
        approx_distance=((features["lat"] - selected.lat) ** 2 + (features["lon"] - selected.lon) ** 2) ** 0.5
    ).nsmallest(180, "approx_distance")
    for _, row in nearby.iterrows():
        folium.CircleMarker(
            location=[row.lat, row.lon],
            radius=3 if row.category == "bus" else 5,
            color=COLOURS.get(row.category, "#828282"),
            fill=True,
            fill_color=COLOURS.get(row.category, "#828282"),
            fill_opacity=0.72,
            popup=f"{row['name']}<br>{row.category}",
        ).add_to(m)

    return m


def score_chart(properties: pd.DataFrame) -> go.Figure:
    ordered = properties.sort_values("overall_score", ascending=True)
    fig = px.bar(
        ordered,
        x="overall_score",
        y="suburb",
        orientation="h",
        color_discrete_sequence=[COLOURS["property"]],
        labels={"overall_score": "Overall score", "suburb": "Suburb"},
    )
    fig.update_layout(height=360, margin=dict(l=20, r=20, t=10, b=30), showlegend=False)
    return fig


def commute_heatmap(properties: pd.DataFrame, targets: pd.DataFrame) -> go.Figure:
    z = []
    for _, row in properties.iterrows():
        distances = {item["target"]: item["km"] for item in row["target_distances"]}
        z.append([distances[target] for target in targets["target_name"]])
    fig = go.Figure(
        data=go.Heatmap(
            x=targets["target_name"],
            y=properties["suburb"],
            z=z,
            colorscale=[[0, "#eaac8b"], [0.55, "#b56576"], [1, "#355070"]],
            colorbar=dict(title="km"),
        )
    )
    fig.update_layout(height=420, margin=dict(l=90, r=20, t=10, b=80))
    return fig


def main() -> None:
    properties, features, targets, metadata = load_data()

    st.title("Home Location Intelligence Dashboard for Victoria")
    st.caption(
        "Compare candidate residential locations using real transport stops, school locations, health services, sport facilities and target-distance indicators."
    )

    uploaded = st.file_uploader("Upload candidate property CSV", type=["csv"])
    if uploaded is not None:
        uploaded_df = pd.read_csv(uploaded)
        if {"latitude", "longitude"}.issubset(uploaded_df.columns):
            st.info("CSV upload received. The static scoring refresh is implemented in the GitHub Pages version; this Streamlit prototype currently displays the bundled scored dataset.")
        else:
            st.warning("CSV must include latitude and longitude columns.")

    selected_id = st.selectbox(
        "Selected property",
        properties["property_id"],
        format_func=lambda value: f"{value} - {properties.loc[properties.property_id == value, 'suburb'].iloc[0]}",
    )
    selected = properties.loc[properties["property_id"] == selected_id].iloc[0]

    best_overall = properties.sort_values("overall_score", ascending=False).iloc[0]
    best_transport = properties.sort_values("transport_score", ascending=False).iloc[0]
    best_amenity = properties.sort_values("amenity_score", ascending=False).iloc[0]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Selected overall score", f"{selected.overall_score}/100", selected.suburb)
    c2.metric("Best overall", best_overall.suburb, f"{best_overall.overall_score}/100")
    c3.metric("Best transport", best_transport.suburb, f"{best_transport.transport_score}/100")
    c4.metric("Best amenities", best_amenity.suburb, f"{best_amenity.amenity_score}/100")

    tab_overview, tab_deep, tab_commute, tab_method = st.tabs(
        ["Overview", "Property deep dive", "Commute", "Method and limitations"]
    )

    with tab_overview:
        col_map, col_rank = st.columns([1.35, 1])
        with col_map:
            st_folium(build_map(properties, features, selected_id), height=560, use_container_width=True)
        with col_rank:
            st.plotly_chart(score_chart(properties), use_container_width=True)
            st.dataframe(
                properties[
                    [
                        "property_id",
                        "suburb",
                        "price",
                        "overall_score",
                        "transport_score",
                        "amenity_score",
                        "commute_score",
                    ]
                ].sort_values("overall_score", ascending=False),
                use_container_width=True,
                hide_index=True,
            )

    with tab_deep:
        st.subheader(f"{selected.property_id} - {selected.suburb}")
        col_a, col_b, col_c = st.columns(3)
        col_a.metric("Nearest train", selected.nearest_train, f"{selected.nearest_train_km} km")
        col_b.metric("Stops within 800m", int(selected.stops_800m))
        col_c.metric("Weighted target distance", f"{selected.weighted_target_km} km")
        st.dataframe(
            pd.DataFrame(
                [
                    ["Nearest school", selected.nearest_school, selected.nearest_school_km],
                    ["Nearest health service", selected.nearest_health, selected.nearest_health_km],
                    ["Nearest sport facility", selected.nearest_sport, selected.nearest_sport_km],
                    ["Nearest retail anchor", selected.nearest_retail, selected.nearest_retail_km],
                ],
                columns=["Indicator", "Nearest feature", "Distance km"],
            ),
            use_container_width=True,
            hide_index=True,
        )

    with tab_commute:
        st.plotly_chart(commute_heatmap(properties, targets), use_container_width=True)

    with tab_method:
        st.write(metadata["calculation"])
        st.write(metadata["transport_features_source"])
        st.write(metadata["facility_features_source"])
        st.markdown(
            """
            **Limitations**

            - Distances are straight-line approximations.
            - Scores are simplified decision-support indicators.
            - Retail anchors are curated demo points; a production version should refresh OSM amenities.
            - Property candidates are user-supplied and not scraped from commercial listing platforms.
            """
        )


if __name__ == "__main__":
    main()
