from django.db.models import Sum
from .models import StockTransaction, StockHolding
import yfinance as yf


"""
    Author: Pranav Pawar
    Description: calculate time series
"""
def recalculate_stock_holding(user, stock_symbol, stock_name):
    """
    Recalculate the stock holding for a user and symbol based on all transactions.
    """
    # Sum up all transactions for the user and symbol
    buy_total = StockTransaction.objects.filter(
        user=user, stock_symbol=stock_symbol, transaction_type="BUY"
    ).aggregate(Sum('stock_quantity'))['stock_quantity__sum'] or 0

    sell_total = StockTransaction.objects.filter(
        user=user, stock_symbol=stock_symbol, transaction_type="SELL"
    ).aggregate(Sum('stock_quantity'))['stock_quantity__sum'] or 0

    net_quantity = buy_total - sell_total
    stock = yf.Ticker(stock_symbol)
    stock_price = stock.history(period="1d")["Close"].iloc[-1] if not stock.history(period="1d").empty else None
    # Update or delete StockHolding
    if net_quantity > 0:
        holding, created = StockHolding.objects.update_or_create(
            user=user,
            stock_symbol=stock_symbol,
            defaults={
                "stock_name": stock_name,
                "stock_quantity": net_quantity,
                "portfolio_value": net_quantity * stock_price,
                "stock_price": stock_price
            }
        )
    else:
        StockHolding.objects.filter(user=user, stock_symbol=stock_symbol).delete()
