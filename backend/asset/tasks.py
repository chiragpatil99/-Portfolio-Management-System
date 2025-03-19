# tasks.py
from celery import shared_task
import yfinance as yf
import numpy as np
from datetime import timedelta, date
from .models import UserPreference, Alert
from django.utils import timezone  

"""
        Author: Pranav Pawar
        Description: celery task for volatility scheduling
"""
@shared_task()
def check_and_trigger_alerts():
    """Check if stock volatility exceeds user thresholds and create/update alerts."""
    preferences = UserPreference.objects.all()

    for pref in preferences:
        # Fetch 30 days of data for the stock
        stock_data = yf.Ticker(pref.symbol).history(period="1mo")
        close_prices = stock_data['Close']
        
        # Calculate daily returns and volatility
        returns = close_prices.pct_change().dropna()
        volatility = np.std(returns) * np.sqrt(252)  # Annualized volatility

        # Check if the volatility exceeds the user's threshold
        if volatility > pref.volatility_threshold:
            # Try to get an existing alert for this user and symbol
            alert, created = Alert.objects.update_or_create(
                user=pref.user,
                symbol=pref.symbol,
                defaults={
                    'message': f"Volatility alert! {pref.symbol} has exceeded your threshold.",
                    'created_at': timezone.now() 

                }
            )
            # Mark the alert as triggered in UserPreference
            pref.alert_triggered = True
        else:
            pref.alert_triggered = False
        
        # Save any updates to the UserPreference instance
        pref.save()
