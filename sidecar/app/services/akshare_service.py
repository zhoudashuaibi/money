# AkShare 数据服务封装
import akshare as ak
import pandas as pd
from typing import Optional


def get_realtime_quote(symbol: str) -> dict:
    """获取 A 股实时行情"""
    df = ak.stock_zh_a_spot_em()
    row = df[df["代码"] == symbol]
    if row.empty:
        return {}
    r = row.iloc[0]
    return {
        "symbol": str(r.get("代码", "")),
        "name": str(r.get("名称", "")),
        "price": float(r.get("最新价", 0) or 0),
        "changePct": float(r.get("涨跌幅", 0) or 0),
        "volume": int(r.get("成交量", 0) or 0),
        "amount": float(r.get("成交额", 0) or 0),
        "highPrice": float(r.get("最高", 0) or 0),
        "lowPrice": float(r.get("最低", 0) or 0),
        "openPrice": float(r.get("今开", 0) or 0),
    }


def get_kline(symbol: str, period: str = "daily", count: int = 120) -> list:
    """获取 A 股 K 线数据"""
    period_map = {"daily": "daily", "weekly": "weekly", "monthly": "monthly"}
    ak_period = period_map.get(period, "daily")

    df = ak.stock_zh_a_hist(
        symbol=symbol,
        period=ak_period,
        adjust="qfq",
    )
    if df.empty:
        return []

    df = df.tail(count)
    result = []
    for _, r in df.iterrows():
        result.append({
            "date": str(r.get("日期", "")),
            "open": float(r.get("开盘", 0) or 0),
            "close": float(r.get("收盘", 0) or 0),
            "high": float(r.get("最高", 0) or 0),
            "low": float(r.get("最低", 0) or 0),
            "volume": int(r.get("成交量", 0) or 0),
            "amount": float(r.get("成交额", 0) or 0),
        })
    return result
