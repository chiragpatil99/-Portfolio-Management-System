'''
Arnav Taya
Created Sprint 1
Modified Sprint 2
Modified Sprint 3
'''


# asset/urls.py
from django.urls import path,re_path
from .views import *
urlpatterns = [
    
    path('price/<str:symbol>/', get_latest_stock_price, name='get_latest_stock_price'),
    re_path(r'^time_series/(?P<symbol>[^/]+)/(?:(?P<interval>[^/]+)/)?$', get_stock_time_series, name='get_stock_time_series'),
    path('purchase/', purchase_stock, name='purchase_stock'),
    path('sell/', sell_stock, name='sell_stock'),
    path('user-holding/', get_user_holdings, name='user-transactions'),
    path('search/', search_ticker, name='search_ticker'),
    path('profit_loss_percentage/<str:symbol>/', get_profit_loss_percentage, name='get_profit_loss_percentage'),  # New profit/loss percentage route
    path('portfolio_diversity/', get_portfolio_diversity, name='get_portfolio_diversity'),
    path('user-preferences/', user_preferences, name='user_preferences'),
    path('alerts/', get_user_alerts, name='get_user_alerts'),
    path('risk/', risk_assessment_view, name='risk_assessment_view'),
    path('portfolio-daily/', daily_portfolio_summary, name='daily_portfolio_summary'),
    path('get-company-info/<str:symbol>/', get_company_info, name='get_company_info'),
    path('check-volatility/<str:symbol>/', check_volatility, name='check_volatility'),

]


