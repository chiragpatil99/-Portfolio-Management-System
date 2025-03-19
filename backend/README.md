Backend API Documentation

Overview

This document provides an overview of all backend API functionalities, detailing their purpose, endpoints, methods, and key features. Each API is designed to manage and optimize portfolio management for users, providing insights, transaction handling, and risk assessments.

API Endpoints

1. Fetch Latest Stock Price

Endpoint: GET /api/get_latest_stock_price

Description: Retrieves the most recent stock price for a given symbol using yfinance.

2. Stock Time Series Data

Endpoint: GET /api/get_stock_time_series

Description: Provides flexible interval-based historical stock data, enabling detailed trend analysis.

3. Purchase Stock

Endpoint: POST /api/purchase_stock

Description: Facilitates stock purchase transactions, logs details, and updates user holdings.

4. Sell Stock

Endpoint: POST /api/sell_stock

Description: Handles stock sale transactions while ensuring sufficient holdings and logging details.

5. Risk Assessment

Endpoint: GET /api/risk_assessment

Description: Analyzes market trends with moving averages (MA20 and MA50) to provide buy/hold/sell recommendations.

6. Company Information

Endpoint: GET /api/get_company_info

Description: Fetches company details like sector, industry, and description using yfinance.

7. Stock Volatility Check

Endpoint: GET /api/check_volatility

Description: Computes stock volatility based on historical price data to assess market risks.

8. Daily Portfolio Summary

Endpoint: GET /api/daily_portfolio_summary

Description: Provides a daily summary of the user’s portfolio, including portfolio value and profit/loss.

9. Get User Holdings

Endpoint: GET /api/get_user_holdings

Description: Retrieves the user’s stock holdings and their associated details.

10. Search Ticker

Endpoint: GET /api/search_ticker

Description: Searches for stock ticker symbols using an external API (e.g., Alpha Vantage).

11. Get Profit/Loss Percentage

Endpoint: GET /api/get_profit_loss_percentage/{symbol}

Description: Calculates and returns the profit/loss percentage for a specific stock symbol in the user’s portfolio.

12. Portfolio Diversity

Endpoint: GET /api/get_portfolio_diversity

Description: Calculates and returns the diversity of the user’s portfolio based on current stock holdings.

13. User Preferences

Endpoint: GET/POST /api/user_preferences

Description:

GET: Retrieves user preferences for stock tracking and alerts.

POST: Allows the user to set or update preferences, such as volatility thresholds.

14. Get User Alerts

Endpoint: GET /api/get_user_alerts

Description: Fetches alerts for the user, enriched with preference data such as volatility thresholds.

Developer Notes

Each API is secured with authentication and authorization to ensure user privacy and data security. Implementations leverage Django REST Framework (DRF), and external APIs like yfinance and Alpha Vantage are utilized for real-time and historical market data.


