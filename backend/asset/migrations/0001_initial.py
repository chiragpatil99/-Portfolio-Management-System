# Generated by Django 5.1.1 on 2024-12-02 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=10)),
                ('message', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='StockHolding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock_symbol', models.CharField(max_length=10)),
                ('stock_name', models.CharField(max_length=255)),
                ('stock_quantity', models.PositiveIntegerField()),
                ('portfolio_value', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock_price', models.DecimalField(decimal_places=2, default=None, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='StockTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock_symbol', models.CharField(max_length=10)),
                ('stock_name', models.CharField(max_length=100)),
                ('transaction_type', models.CharField(choices=[('BUY', 'Buy'), ('SELL', 'Sell')], max_length=4)),
                ('stock_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock_quantity', models.IntegerField()),
                ('buying_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('transaction_datetime', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='UserPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=10)),
                ('volatility_threshold', models.FloatField(default=0.05)),
                ('alert_triggered', models.BooleanField(default=False)),
            ],
        ),
    ]
