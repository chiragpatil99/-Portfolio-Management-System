import yfinance as yf
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from .models import StockTransaction, UserPreference, Alert, StockHolding
from .serializers import StockHoldingSerializer, UserPreferenceSerializer  # Import serializer
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from decimal import Decimal
import requests
from django.http import JsonResponse
import pandas as pd
from .utility import recalculate_stock_holding
from django.db.models import Sum, F, Q
from datetime import datetime
from datetime import date, timedelta
from django.utils.timezone import now
from collections import defaultdict
import numpy as np
from django.shortcuts import render
from datetime import datetime

'''
Arnav Taya
Created Sprint 1

'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_latest_stock_price(request, symbol):
    """
    API to fetch the latest stock price for a given symbol.
    """
    stock = yf.Ticker(symbol)
    price = stock.history(period="5d")["Close"].iloc[-1] if not stock.history(period="5d").empty else None
    if price is None:
        return Response({"error": "Unable to retrieve stock data."}, status=404)
    return Response({"symbol": symbol, "price": float(price)})


'''
Arnav Taya
Created Sprint 1

'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_stock_time_series(request, symbol, interval="1min"):
    """
    API to fetch the time series data for a stock with flexible intervals.
        Author: Pranav Pawar
        Description: calculate time series
    
    """
    stock = yf.Ticker(symbol)
    
    # Mapping for yfinance intervals with appropriate periods
    interval_mapping = {
        "1day": ("5m", "1d"),    
        "1week": ("1d", "5d"),   
        "1month": ("1d", "1mo"), 
        "3month": ("1d", "3mo"), 
        "ytd": ("1d", "ytd"),    
        "1year": ("1d", "1y"),   
        "max": ("1mo", "max")    

    }
    start_date = "2000-01-01"
 
    yf_interval, period = interval_mapping.get(interval, (None, None))
    if not yf_interval or not period:
        return Response({"error": "Invalid interval specified."}, status=400)
    print(yf_interval, period)
    if period == "max":
        data = stock.history(start=start_date, period=period, interval=yf_interval)
    else:
        data = stock.history(period=period, interval=yf_interval)
    if data.empty:
        return Response({"error": "Unable to retrieve stock data."}, status=404)

    # Format the data for response
    formatted_data = [
        {
            "time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "open": row['Open'],
            "high": row['High'],
            "low": row['Low'],
            "close": row['Close'],
            "volume": row['Volume']
        }
        for time, row in data.iterrows()
    ]

    return Response({"symbol": symbol, "time_series": formatted_data})

'''
Arnav Taya
Created Sprint 1

'''
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def purchase_stock(request):
    """
    API to purchase a specified quantity of a stock for the logged-in user.
    """
    user = request.user
    stock_symbol = request.data.get('symbol')
    stock_name = request.data.get('name')
    stock_quantity = int(request.data.get('quantity'))

    if not stock_symbol or not stock_quantity:
        return Response({"error": "Stock symbol and quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

    stock = yf.Ticker(stock_symbol)
    stock_price = stock.history(period="1d")["Close"].iloc[-1] if not stock.history(period="1d").empty else None
    if stock_price is None:
        return Response({"error": "Unable to fetch stock price."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Log the transaction with timezone-aware datetime
    StockTransaction.objects.create(
        user=user,
        stock_symbol=stock_symbol,
        stock_name=stock_name,
        stock_price=stock_price,
        stock_quantity=stock_quantity,
        transaction_type="BUY",
        buying_price=Decimal(stock_price) * Decimal(stock_quantity),
        transaction_datetime=now()  # Save with timezone-aware datetime
    )

    # Recalculate holding
    recalculate_stock_holding(user, stock_symbol, stock_name)

    return Response({
        "message": "Stock purchased successfully",
        "stock_symbol": stock_symbol,
        "stock_quantity": stock_quantity,
        "transaction_type": "BUY"
    }, status=status.HTTP_201_CREATED)


'''
Arnav Taya
Created Sprint 1

'''
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sell_stock(request):
    """
    API to sell a specified quantity of a stock owned by the logged-in user.
    """
    user = request.user
    stock_symbol = request.data.get('symbol')
    stock_quantity = int(request.data.get('quantity'))

    if not stock_symbol or not stock_quantity:
        return Response({"error": "Stock symbol and quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

    stock = yf.Ticker(stock_symbol)
    stock_price = stock.history(period="1d")["Close"].iloc[-1] if not stock.history(period="1d").empty else None
    if stock_price is None:
        return Response({"error": "Unable to fetch stock price."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Ensure user owns sufficient stock
    holding = StockHolding.objects.filter(user=user, stock_symbol=stock_symbol).first()
    if not holding or holding.stock_quantity < stock_quantity:
        return Response({"error": "Insufficient shares to sell."}, status=status.HTTP_400_BAD_REQUEST)

    # Log the transaction with timezone-aware datetime
    StockTransaction.objects.create(
        user=user,
        stock_symbol=stock_symbol,
        stock_name=holding.stock_name,
        stock_price=stock_price,
        stock_quantity=stock_quantity,
        transaction_type="SELL",
        buying_price=Decimal(stock_price) * Decimal(stock_quantity),
        transaction_datetime=now()  # Save with timezone-aware datetime
    )

    # Recalculate holding
    recalculate_stock_holding(user, stock_symbol, holding.stock_name)

    return Response({
        "message": "Stock sold successfully",
        "stock_symbol": stock_symbol,
        "stock_quantity": stock_quantity,
        "transaction_type": "SELL"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_holdings(request):

    """
        Author: Pranav Pawar
        Description: calculate time series
    """
    user = request.user
    transactions = StockHolding.objects.filter(user=user)
    serializer = StockHoldingSerializer(transactions, many=True)

    response_data = {
        "username": user.username,
        "transactions": serializer.data
    }

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def search_ticker(request):
    """
        Author: Pranav Pawar
        Description: calculate time series
    """
    ticker = request.GET.get('ticker', None)
    if not ticker:
        return Response({"error": "Ticker symbol is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch data from an external API like Yahoo Finance or Alpha Vantage
    api_url = f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={ticker}&apikey={settings.ALPHAVANTAGE_API_KEY}"
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()
        return Response(data)
    else:
        return Response({"error": "Failed to fetch data"}, status=response.status_code)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_profit_loss_percentage(request, symbol):
    user = request.user

    # Separate buy and sell transactions
    buy_transactions = StockTransaction.objects.filter(stock_symbol=symbol, user=user, transaction_type="BUY")
    sell_transactions = StockTransaction.objects.filter(stock_symbol=symbol, user=user, transaction_type="SELL")

    if not buy_transactions.exists():
        return Response({"error": "You do not own any shares of this stock."}, status=status.HTTP_404_NOT_FOUND)

    # Fetch current stock price
    current_price = yf.Ticker(symbol).history(period="1d")["Close"].iloc[-1] if not yf.Ticker(symbol).history(period="1d").empty else None
    if current_price is None:
        return Response({"error": "Unable to fetch stock price."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Calculate total bought quantity and investment
    buy_aggregated = buy_transactions.aggregate(
        total_bought_quantity=Sum('stock_quantity'),
        total_investment=Sum(F('stock_price') * F('stock_quantity'))
    )
    total_bought_quantity = buy_aggregated["total_bought_quantity"] or 0
    total_investment = buy_aggregated["total_investment"] or 0

    # Calculate total sold quantity
    sell_aggregated = sell_transactions.aggregate(
        total_sold_quantity=Sum('stock_quantity')
    )
    total_sold_quantity = sell_aggregated["total_sold_quantity"] or 0

    # Calculate net quantity
    net_quantity = total_bought_quantity - total_sold_quantity
    if net_quantity <= 0:
        return Response({"error": "You do not own any shares of this stock."}, status=status.HTTP_404_NOT_FOUND)

    # Calculate weighted average buy price
    weighted_avg_buy_price = total_investment / total_bought_quantity

    # Calculate profit/loss percentage and total return
    profit_loss_percentage = ((Decimal(current_price) - weighted_avg_buy_price) / weighted_avg_buy_price) * 100
    total_return = (Decimal(current_price) - weighted_avg_buy_price) * net_quantity

    return Response({
        "symbol": symbol,
        "net_quantity": net_quantity,
        "current_price": Decimal(current_price),
        "average_buy_price": float(weighted_avg_buy_price),
        "profit_loss_percentage": float(profit_loss_percentage),
        "market_value": float(Decimal(current_price) * net_quantity),
        "total_return": float(total_return)
    }, status=status.HTTP_200_OK)



"""
Author :- Chirag Patil
Description :- API endpoint that calculates and returns the portfolio diversity 

"""

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_portfolio_diversity(request):
    """
    API to calculate and return portfolio diversity for the logged-in user.
    """
    user = request.user

    # Fetch all transactions grouped by stock symbol
    transactions = (
        StockTransaction.objects.filter(user=user)
        .values('stock_symbol', 'stock_name')
        .annotate(
            total_bought_quantity=Sum('stock_quantity', filter=Q(transaction_type='BUY')),
            total_sold_quantity=Sum('stock_quantity', filter=Q(transaction_type='SELL')),
        )
    )

    if not transactions:
        return Response({"error": "No stocks in the portfolio."}, status=status.HTTP_404_NOT_FOUND)

    total_portfolio_value = Decimal(0)
    portfolio = []

    for transaction in transactions:
        # Calculate net quantity
        total_bought_quantity = transaction['total_bought_quantity'] or 0
        total_sold_quantity = transaction['total_sold_quantity'] or 0
        net_quantity = total_bought_quantity - total_sold_quantity

        if net_quantity <= 0:
            continue  # Skip stocks with no net holdings

        # Fetch current stock price
        stock = yf.Ticker(transaction['stock_symbol'])
        current_price = stock.history(period="1d")["Close"].iloc[-1] if not stock.history(period="1d").empty else None
        if current_price is None:
            continue

        # Calculate current stock value
        stock_value = Decimal(current_price) * Decimal(net_quantity)
        total_portfolio_value += stock_value

        portfolio.append({
            "symbol": transaction['stock_symbol'],
            "name": transaction['stock_name'],
            "net_quantity": net_quantity,
            "current_price": float(current_price),
            "current_value": float(stock_value)
        })

    if total_portfolio_value == 0:
        return Response({"error": "No valid stocks in the portfolio."}, status=status.HTTP_404_NOT_FOUND)

    # Calculate diversity percentage for each stock
    for stock in portfolio:
        stock['diversity_percentage'] = round((stock['current_value'] / float(total_portfolio_value)) * 100, 2)

    return Response({
        "username": user.username,
        "total_portfolio_value": float(total_portfolio_value),
        "portfolio": portfolio
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_preferences(request):
    user = request.user
    """
        Author: Pranav Pawar
        Description: calculate time series
    """
    if request.method == 'GET':
        # Retrieve all preferences for the logged-in user
        preferences = UserPreference.objects.filter(user=user)
        serializer = UserPreferenceSerializer(preferences, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserPreferenceSerializer(data=request.data)
        if serializer.is_valid():
            symbol = serializer.validated_data['symbol']
            new_threshold = serializer.validated_data['volatility_threshold']

            # Check if the preference already exists for this symbol
            existing_preference = UserPreference.objects.filter(user=user, symbol=symbol).first()

            # If preference exists and the threshold has changed
            if existing_preference and existing_preference.volatility_threshold != new_threshold:
                # Delete any existing alerts related to this symbol
                Alert.objects.filter(user=user, symbol=symbol).delete()
                existing_preference.alert_triggered = False
                existing_preference.save()

            # Update or create the user preference
            preference, created = UserPreference.objects.update_or_create(
                user=user,
                symbol=symbol,
                defaults={'volatility_threshold': new_threshold},
            )

            return Response({
                'message': 'Preference saved successfully',
                'preference': UserPreferenceSerializer(preference).data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_alerts(request):
    user = request.user
    """
        Author: Pranav Pawar
        Description: calculate time series
    """
    # Fetch user alerts
    alerts = Alert.objects.filter(user=user).order_by('-created_at')

    # Build enriched response with preference data merged into alert data
    enriched_alerts = []
    for alert in alerts:
        # Fetch the matching preference for the alert's symbol
        try:
            user_preference = UserPreference.objects.get(user=user, symbol=alert.symbol)
            preference_data = {
                "volatility_threshold": user_preference.volatility_threshold,
                "alert_triggered": user_preference.alert_triggered,
            }
        except UserPreference.DoesNotExist:
            preference_data = {
                "volatility_threshold": None,
                "alert_triggered": None,
            }

        # Merge alert data with preference data
        enriched_alert = {
            "id": alert.id,
            "symbol": alert.symbol,
            "message": alert.message,
            "created_at": alert.created_at,
            "is_read": getattr(alert, "is_read", False),  # Assuming `is_read` is optional
            "volatility_threshold": preference_data["volatility_threshold"],
            "alert_triggered": preference_data["alert_triggered"],
        }
        enriched_alerts.append(enriched_alert)

    return Response(enriched_alerts, status=status.HTTP_200_OK)



'''
Arnav Taya
Created Sprint 3

'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def risk_assessment_view(request):
    
    # Get the stock symbol from the URL parameter
    stock_symbol = request.GET.get('symbol')
    
    if not stock_symbol:
        return JsonResponse({'error': 'Please provide a stock symbol.'}, status=400)
    
    # Fetch stock data
    try:
        stock_data = yf.download(stock_symbol, period="3mo", interval="1d")
    except Exception as e:
        return JsonResponse({'error': f'Failed to fetch data: {str(e)}'}, status=500)

    # Check if data is empty
    if stock_data.empty:
        return JsonResponse({'error': 'Invalid stock symbol or no data available.'}, status=400)
    
    # Use only the "Close" column and remove any additional ticker index if present
    stock_data = stock_data[['Close']].copy()
    stock_data.columns = stock_data.columns.droplevel(0) if isinstance(stock_data.columns, pd.MultiIndex) else stock_data.columns
    
    # Ensure enough data for calculating MA20 and MA50
    if len(stock_data) < 50:
        return JsonResponse({'error': 'Insufficient data for risk assessment.'}, status=400)
    
    print(stock_data,"======================================")
    # Calculate Moving Averages
    stock_data['MA20'] = stock_data[stock_symbol].rolling(window=20).mean()
    stock_data['MA50'] = stock_data[stock_symbol].rolling(window=50).mean()
    
    # Get the latest closing price and moving averages
    latest_close = stock_data[stock_symbol].iloc[-1]  # Now a single float
    latest_ma20  = stock_data['MA20'].iloc[-1]
    latest_ma50  = stock_data['MA50'].iloc[-1]

    
    
    # Decision logic for Buy/Sell/Hold recommendation
    if latest_close > latest_ma20 and latest_ma20 > latest_ma50:
        recommendation = "Buy"
    elif latest_close < latest_ma20 and latest_ma20 < latest_ma50:
        recommendation = "Sell"
    else:
        recommendation = "Hold"
    
    return JsonResponse({
        'symbol'         : stock_symbol,
        'latest_close'   : float(latest_close),  # Convert to float for JSON response
        'MA20'           : latest_ma20,
        'MA50'           : latest_ma50,
        'recommendation' : recommendation
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def daily_portfolio_summary(request):
    
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated."}, status=401)

    user = request.user

    # Fetch transactions for the user
    transactions = (
        StockTransaction.objects.filter(user=user)
        .values('stock_symbol', 'transaction_type', 'transaction_datetime', 'stock_price', 'stock_quantity')
    )

    if not transactions:
        return JsonResponse({"message": "No transactions found for the user."}, status=404)

    # Group transactions by date and calculate aggregates
    transaction_data = defaultdict(lambda: defaultdict(lambda: {'quantity': 0, 'total_cost': Decimal(0)}))
    earliest_date = None

    for txn in transactions:
        txn_date = txn['transaction_datetime'].date()
        earliest_date = min(earliest_date, txn_date) if earliest_date else txn_date
        stock = txn['stock_symbol']
        if txn['transaction_type'] == 'BUY':
            transaction_data[txn_date][stock]['quantity'] += txn['stock_quantity']
            transaction_data[txn_date][stock]['total_cost'] += Decimal(txn['stock_price']) * txn['stock_quantity']
        elif txn['transaction_type'] == 'SELL':
            transaction_data[txn_date][stock]['quantity'] -= txn['stock_quantity']
            transaction_data[txn_date][stock]['total_cost'] -= Decimal(txn['stock_price']) * txn['stock_quantity']

    # Calculate daily summaries with rolling updates for missing days
    summary_data = []
    portfolio_value = Decimal(0)
    prev_day_data = {}
    current_date = earliest_date
    today = date.today()

    while current_date <= today:
        day_data = {'date': current_date, 'portfolio_value': Decimal(0), 'daily_profit_loss': Decimal(0)}

        # Copy the previous day's data to fill missing days
        for stock, data in prev_day_data.items():
            day_data[stock] = data.copy()

        # Update with current day's transactions
        for stock, txn_data in transaction_data.get(current_date, {}).items():
            if stock not in day_data:
                day_data[stock] = {'quantity': 0, 'average_price': Decimal(0), 'total_price': Decimal(0)}
            quantity = day_data[stock]['quantity'] + txn_data['quantity']
            if quantity > 0:
                total_cost = (
                    day_data[stock]['average_price'] * day_data[stock]['quantity']
                    + txn_data['total_cost']
                )
                day_data[stock]['average_price'] = total_cost / quantity
            else:
                day_data[stock]['average_price'] = Decimal(0)  # Reset if no stock remains
            day_data[stock]['quantity'] = quantity
            day_data[stock]['total_price'] = day_data[stock]['average_price'] * quantity

        # Calculate portfolio value as the sum of total prices
        day_data['portfolio_value'] = sum(stock_data['total_price'] for stock_data in day_data.values() if isinstance(stock_data, dict))

        # Calculate daily profit/loss
        day_data['daily_profit_loss'] = day_data['portfolio_value'] - portfolio_value
        portfolio_value = day_data['portfolio_value']

        # Save the current day's data
        prev_day_data = {stock: data.copy() for stock, data in day_data.items() if isinstance(data, dict)}
        summary_data.append(day_data)
        current_date += timedelta(days=1)

    return JsonResponse({'daily_summary': summary_data}, safe=False)

'''
Arnav Taya
Created Sprint 3

'''
@api_view(['GET'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def get_company_info(request, symbol):
    """
    API to fetch company information for a given stock symbol.
    """
    stock = yf.Ticker(symbol)
    try:
        info = stock.info

        # Prepare the response data
        company_info = {
            "name": info.get("longName", "N/A"),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "website": info.get("website", "N/A"),
            "description": info.get("longBusinessSummary", "N/A"),
        }
        return Response(company_info)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

'''
Arnav Taya
Created Sprint 3

'''
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def check_volatility(request, symbol):
    """
    API to check stock volatility against user-defined thresholds.
    """
    stock = yf.Ticker(symbol).history(period="1d",interval = "60m")


    try:
        # Fetch historical data for the stock
        close_prices = stock['Close']
        
        # Calculate daily returns and volatility
        returns = close_prices.pct_change().dropna()
        volatility = {'current_volatility': str(np.std(returns) * np.sqrt(252)*100) + '%' }
        return Response(volatility)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
