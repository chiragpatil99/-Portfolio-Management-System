from django.db import models
from django.conf import settings  # Use AUTH_USER_MODEL


'''
Arnav Taya
Created Sprint 1
Modified Sprint 2
Modified Sprint 3

'''
class StockTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    ]

    user                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    stock_symbol        = models.CharField(max_length=10)
    stock_name          = models.CharField(max_length=100)
    transaction_type    = models.CharField(max_length=4, choices=TRANSACTION_TYPE_CHOICES)
    stock_price         = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity      = models.IntegerField()
    buying_price        = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_datetime = models.DateTimeField()

    def __str__(self):
        return f"{self.transaction_type} {self.stock_symbol} - {self.stock_quantity} shares"
    def calculate_profit_loss(self, current_price):
        """Calculate profit/loss margin"""
        return (current_price - float(self.stock_price)) * self.stock_quantity

class StockHolding(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    stock_symbol = models.CharField(max_length=10)
    stock_name = models.CharField(max_length=255)
    stock_quantity = models.PositiveIntegerField()
    portfolio_value = models.DecimalField(max_digits=10, decimal_places=2)
    stock_price = models.DecimalField(max_digits=10, decimal_places=2, default=None)    

class UserPreference(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    symbol = models.CharField(max_length=10)
    volatility_threshold = models.FloatField(default=0.05)  # Default threshold at 5%
    alert_triggered = models.BooleanField(default=False)  # Whether alert is active

class Alert(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    symbol = models.CharField(max_length=10)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField()

