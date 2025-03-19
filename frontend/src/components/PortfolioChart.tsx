import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { fetchDailyData } from '../services/stockService';

interface ProfitLossData {
  date: string;
  dailyProfitLoss: number;
}

interface PortfolioValueData {
  date: string;
  portfolioValue: number;
}

interface StockPriceData {
    date: string;
    [stock: string]: number | string | null; 
  }

const Dashboard: React.FC = () => {
  const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([]);
  const [portfolioValueData, setPortfolioValueData] = useState<PortfolioValueData[]>([]);
  const [stockPriceData, setStockPriceData] = useState<StockPriceData[]>([]);

  useEffect(() => {
    // Fetch data from your Django API using Axios
    handleGraphData()
  }, []);

  const handleGraphData = async () => {
    try {
      const data = await fetchDailyData(); // Fetch portfolio data from the API
      const summaries = data.daily_summary;
  
      const stockSet = new Set<string>();
  
      // Collect all unique stock symbols across all summaries
      summaries.forEach((summary: any) => {
        for (const stock in summary) {
          if (stock !== 'date' && stock !== 'portfolio_value' && stock !== 'daily_profit_loss') {
            stockSet.add(stock);
          }
        }
      });
  
      const allStocks = Array.from(stockSet);
  
      const profitLoss = summaries.map((summary: any) => ({
        date: summary.date,
        dailyProfitLoss: parseFloat(summary.daily_profit_loss),
      }));
  
      const portfolioValue = summaries.map((summary: any) => ({
        date: summary.date,
        portfolioValue: parseFloat(summary.portfolio_value),
      }));
  
      const stockPrices = summaries.map((summary: any) => {
        const stockData: StockPriceData = { date: summary.date };
  
        // Populate all stocks with either their value or null
        allStocks.forEach((stock) => {
          stockData[stock] = summary[stock]?.total_price
            ? parseFloat(summary[stock].total_price)
            : null; // Use null for missing values
        });
  
        return stockData;
      });
  
      // Update the state with the filled data
      setProfitLossData(profitLoss);
      setPortfolioValueData(portfolioValue);
      setStockPriceData(stockPrices);
      console.log(stockPrices, "Updated stockPriceData");
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  
  return (
    <Box sx={{ padding: 3, display: 'grid', gap: 4 }}>
      <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#333' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
          Daily Profit/Loss Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profitLossData} >
            <CartesianGrid stroke="#666" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis 
              stroke="#fff" 
              domain={['auto', 'auto']} 
              tick={{ fill: '#fff' }} 
              axisLine={{ stroke: '#fff' }}
            />
              <ReferenceLine y={0} stroke="#ff0000" strokeWidth={2} strokeDasharray="3 3" />

            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#888' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="dailyProfitLoss" stroke="#8884d8" dot={false} legendType="none"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Portfolio Value Chart */}
      <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#333' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
          Portfolio Value Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={portfolioValueData}>
            <CartesianGrid stroke="#666" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#888' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="portfolioValue" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Stock Total Prices Chart */}
      <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#333' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
          Total Price of Each Stock Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stockPriceData}>
            <CartesianGrid stroke="#666" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#888' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {Object.keys(stockPriceData[0] || {})
              .filter((key) => key !== 'date')
              .map((stock) => (
               <Line
                 key={stock}
                 type="monotone"
                 dataKey={stock}
                 stroke={`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`}
                 dot={false}
               />

              ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
