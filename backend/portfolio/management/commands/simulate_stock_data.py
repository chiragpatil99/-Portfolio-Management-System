from django.utils.timezone import is_naive, make_aware, get_current_timezone
from datetime import datetime, timedelta
from decimal import Decimal
import random
import yfinance as yf
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Sum
from asset.models import StockTransaction, StockHolding  # Replace with your model names


class Command(BaseCommand):
    help = "Simulate stock data for testing and update aggregated holdings"

    def add_arguments(self, parser):
        # Add optional arguments for specifying the number of days, market trend, and user ID
        parser.add_argument(
            '--days',
            type=int,
            default=180,  # Default to 180 days if not specified
            help='Number of days to generate stock data for.',
        )
        parser.add_argument(
            '--trend',
            type=str,
            choices=['up', 'down', 'neutral'],
            default='neutral',
            help='Market trend: "up" for gains, "down" for losses, "neutral" for no trend.',
        )
        parser.add_argument(
            '--user_id',
            type=int,
            required=False,  # Make user_id mandatory
            default=1,
            help='The ID of the user for whom to generate stock data.',
        )

    def handle(self, *args, **kwargs):
        days = kwargs['days']
        trend = kwargs['trend']
        user_id = kwargs['user_id']
        User = get_user_model()

        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with ID {user_id} does not exist."))
            return

        StockTransaction.objects.filter(user=user).delete()
        StockHolding.objects.filter(user=user).delete()
        self.stdout.write(self.style.WARNING(f"Deleted all existing transactions and holdings for user: {user.username}"))

        stock_data = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "GOOGL", "name": "Alphabet Inc."},
            {"symbol": "TSLA", "name": "Tesla Inc."},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "NVDA", "name": "NVIDIA Corp"},
        ]

        transaction_types = ["BUY", "SELL"]

        for stock in stock_data:
            stock_info = yf.Ticker(stock["symbol"])
            stock_price = stock_info.history(period="1d")["Close"].iloc[-1] if not stock_info.history(period="1d").empty else None
            if stock_price is None:
                self.stdout.write(self.style.ERROR(f"Could not fetch stock price for {stock['symbol']}. Skipping."))
                continue

            base_price = stock_price
            daily_change = 0.005 if trend == 'up' else -0.005 if trend == 'down' else 0

            cumulative_buy_quantity = 0
            cumulative_sell_quantity = 0

            for days_ago in range(days):
                transaction_datetime = datetime.now() - timedelta(days=days_ago)

                if is_naive(transaction_datetime):
                    transaction_datetime = make_aware(transaction_datetime, get_current_timezone())

                # Simulate daily stock price with random fluctuation around the trend
                fluctuation = random.uniform(-0.02, 0.02)
                stock_price = round(base_price * (1 + daily_change + fluctuation), 2)

                transaction_type = random.choice(transaction_types)
                stock_quantity = random.randint(1, 100)

                if transaction_type == "SELL":
                    # Ensure sufficient quantity available for sale
                    if cumulative_buy_quantity - cumulative_sell_quantity < stock_quantity:
                        # Skip SELL transaction if insufficient quantity
                        continue
                    cumulative_sell_quantity += stock_quantity
                else:  # BUY transaction
                    cumulative_buy_quantity += stock_quantity

                StockTransaction.objects.create(
                    user=user,
                    stock_symbol=stock["symbol"],
                    stock_name=stock["name"],
                    transaction_type=transaction_type,
                    stock_price=stock_price,
                    stock_quantity=stock_quantity,
                    buying_price=Decimal(stock_price) * Decimal(stock_quantity),
                    transaction_datetime=transaction_datetime,
                )

            # Calculate and update holdings
            net_quantity = cumulative_buy_quantity - cumulative_sell_quantity

            if net_quantity > 0:
                portfolio_value = net_quantity * stock_price
                StockHolding.objects.update_or_create(
                    user=user,
                    stock_symbol=stock["symbol"],
                    defaults={
                        'stock_name': stock["name"],
                        'stock_quantity': net_quantity,
                        'portfolio_value': portfolio_value,
                        'stock_price': stock_price,
                    },
                )
            else:
                StockHolding.objects.filter(user=user, stock_symbol=stock["symbol"]).delete()

        self.stdout.write(self.style.SUCCESS(f"Stock transactions and holdings updated successfully for user: {user.username}"))
