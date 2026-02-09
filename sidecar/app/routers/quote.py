# 行情路由
from fastapi import APIRouter, HTTPException, Query
from app.services.akshare_service import get_realtime_quote, get_kline

router = APIRouter()


@router.get("/realtime")
def realtime(
    symbol: str = Query(..., description="股票代码，如 000001"),
    market: str = Query("CN", description="市场"),
):
    """获取实时行情"""
    try:
        data = get_realtime_quote(symbol)
        if not data:
            raise HTTPException(404, f"未找到 {symbol} 的行情数据")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"获取行情失败: {str(e)}")


@router.get("/kline")
def kline(
    symbol: str = Query(..., description="股票代码"),
    period: str = Query("daily", description="周期: daily/weekly/monthly"),
    count: int = Query(120, description="返回条数", ge=1, le=500),
):
    """获取 K 线数据"""
    try:
        data = get_kline(symbol, period, count)
        if not data:
            raise HTTPException(404, f"未找到 {symbol} 的K线数据")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"获取K线失败: {str(e)}")
