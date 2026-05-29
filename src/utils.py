from __future__ import annotations

from pathlib import Path

import pandas as pd


def load_csv(path: Path, **kwargs) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Expected data file was not found: {path}")
    return pd.read_csv(path, **kwargs)


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r"[^0-9a-zA-Z]+", "_", regex=True)
        .str.strip("_")
    )
    return df


def format_number(value: float | int) -> str:
    return f"{value:,.0f}"
