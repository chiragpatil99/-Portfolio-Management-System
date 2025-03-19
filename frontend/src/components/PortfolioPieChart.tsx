import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CircularProgress, Paper, Typography } from '@mui/material';
import { getPortfolioDiversity } from '../services/stockService'; 

// Define the type for portfolio items
interface PortfolioItem {
  name: string;
  diversity_percentage: number;
}

const PortfolioPieChart: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]); // State to hold portfolio data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string>(''); // Error state

  // Fetch data from the API on component mount
  useEffect(() => {
    handlePortfolioDiversity();
  }, []);

  // Function to fetch portfolio data and handle the response
  const handlePortfolioDiversity = async () => {
    try {
      const data = await getPortfolioDiversity(); // Fetch portfolio data from the API
      setPortfolio(data.portfolio); 
      setLoading(false);
    } catch (error) {
      setError('Error fetching portfolio data');
      setLoading(false);
    }
  };

  // Prepare data for the Pie chart with rounded percentages
  const chartData = portfolio.map(item => ({
    name: item.name,
    value: parseFloat(item.diversity_percentage.toFixed(2)), // Round to 2 decimal places
  }));

  // Muted color palette for dark theme
  const colorPalette = [
    '#4F7CAC', // Muted Blue
    '#6B8B3B', // Muted Green
    '#6A4C92', // Muted Purple
    '#9E4F56', // Muted Red
    '#C8A400', // Muted Yellow
    '#3C9D9B', // Muted Teal
    '#D56A47', // Muted Coral
    '#F5A5C0', // Muted Pink
    '#A2A2A2', // Muted Gray
    '#F4C1A1', // Muted Peach
  ];

  if (loading) {
    return (
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading Portfolio Data...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#121212' }}>
      <PieChart width={500} height={400}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={130} // Outer radius for the donut chart
          innerRadius={90} // Inner radius to create the donut hole
          fill="#8884d8"
          label
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </Paper>
  );
};

export default PortfolioPieChart;
