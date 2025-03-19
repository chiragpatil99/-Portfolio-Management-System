# asset/services.py
import yfinance as yf
from django.conf import settings

'''
Arnav Taya
Created Sprint 1
'''
def get_stock_price(symbol):
    # Use yfinance to get the stock price
    try:
        stock = yf.Ticker(symbol)
        # Fetch the latest price
        latest_price = stock.history(period="1d")['Close'].iloc[-1]  # Get the last closing price
        return float(latest_price)
    except Exception as e:
        return None  # Handle any exceptions and return None
