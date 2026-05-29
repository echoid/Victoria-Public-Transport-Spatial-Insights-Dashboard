from __future__ import annotations

import pandas as pd
import plotly.express as px


def build_patronage_chart(df: pd.DataFrame, colour_map: dict[str, str]):
    fig = px.line(
        df,
        x="date",
        y="patronage",
        color="mode",
        color_discrete_map=colour_map,
        markers=False,
        labels={"date": "", "patronage": "Monthly patronage", "mode": "Mode"},
    )
    fig.update_traces(line_width=2.4)
    fig.update_layout(height=440, hovermode="x unified", margin=dict(l=0, r=20, t=25, b=20))
    return fig


def build_mode_share_chart(df: pd.DataFrame, colour_map: dict[str, str]):
    monthly = df.groupby(["date", "mode"], as_index=False)["patronage"].sum()
    monthly["total"] = monthly.groupby("date")["patronage"].transform("sum")
    monthly["share"] = monthly["patronage"] / monthly["total"]
    fig = px.area(
        monthly,
        x="date",
        y="share",
        color="mode",
        color_discrete_map=colour_map,
        labels={"date": "", "share": "Mode share", "mode": "Mode"},
    )
    fig.update_yaxes(tickformat=".0%")
    fig.update_layout(height=340, hovermode="x unified", margin=dict(l=0, r=20, t=25, b=20))
    return fig
