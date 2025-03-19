import React, { useEffect, useState } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { Box, Typography } from "@mui/material";
import { fetchAlertData, fetchRecommendation } from "../services/stockService"; // Add fetchRecommendation
import AppTheme from "./shared_theme/AppTheme";
import { useNavigate } from 'react-router-dom';
import './AlertDataTable.css';
import type { CSSProperties } from "react";

createTheme('Dark', {
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
  },
  background: {
    default: '#121212',
  },
  context: {
    background: '#333333',
    text: '#FFFFFF',
  },
  divider: {
    default: '#424242',
  },
  button: {
    default: '#333333',
    hover: 'rgba(255, 255, 255, 0.08)',
    focus: 'rgba(255, 255, 255, 0.12)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
  sortFocus: {
    default: '#FF9800',
  },
  selected: {
    default: '#333333',
    text: '#FFFFFF',
  },
  highlightOnHover: {
    default: '#444444',
    text: '#FFFFFF',
  },
  rows: {
    text: '#B3B3B3',
    background: '#121212',
    borderColor: '#333333',
  },
  striped: {
    default: '#1E1E1E',
    text: '#B3B3B3',
  }
});


const customStyles = {
  headCells: {
    style: {
      whiteSpace: 'normal',
      padding: '10px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  cells: {
    style: {
      padding: '10px',
    },
  },
};

const AlertDataTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const navigate = useNavigate();

useEffect(() => {
    handleAlertData();
}, []);
  
const handleNavigate = (symbol: string) => {
  navigate(`/transact-stock-form?symbol=${symbol}`);
};

const handleAlertData = async () => {
  setLoading(true);
  setError(null);
  const recommendationCache: Record<string, any> = {}; // Cache to store recommendations by symbol

  try {
    const alertData = await fetchAlertData(); // Fetch alert data from the API

    const alertsWithRecommendations = [];
    for (const alert of alertData) {
      if (recommendationCache[alert.symbol]) {
        // Use cached recommendation if available
        alertsWithRecommendations.push({
          ...alert,
          recommendation: recommendationCache[alert.symbol],
        });
      } else {
        try {
          const recommendation = await fetchRecommendation(alert.symbol); // Fetch recommendation
          recommendationCache[alert.symbol] = recommendation; // Cache the result
          alertsWithRecommendations.push({
            ...alert,
            recommendation,
          });
        } catch (err) {
          console.error(`Failed to fetch recommendation for ${alert.symbol}:`, err);
          alertsWithRecommendations.push({
            ...alert,
            recommendation: { recommendation: 'No recommendation available' },
          }); // Handle failure gracefully
        }
      }
    }

    setData(alertsWithRecommendations); // Set the data with recommendations
    console.log(alertsWithRecommendations);
  } catch (error) {
    setError('Error fetching alert data');
  } finally {
    setLoading(false);
  }
};

  // Define columns for the table
  const columns = [
    {
      name: 'Symbol',
      // selector: (row: Transaction) => row.stock_symbol,
      cell: (row:any) => (
        <Typography
          variant="body2"
          color="primary"
          onClick={() => handleNavigate(row.symbol)}
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          {row.symbol}
        </Typography>
      ),
      sortable: true,
      width: '10%'
    },
    {
      name: "Threshold",
      selector: (row: any) => row.volatility_threshold,
      sortable: true,
    },
    {
      name: "Message",
      selector: (row: any) => row.message,
      wrap: true,
    },
    {
      name: "Alert Triggered",
      selector: (row: any) => (row.alert_triggered ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row: any) => new Date(row.created_at).toLocaleString(),
      sortable: true,
    },
    {
      name: "Recommendation", // New column for recommendation
      selector: (row: any) => row.recommendation.recommendation, // Display recommendation data
      sortable: true,
    },
  ];

  return (
    <AppTheme>
      <Box sx={{ width: '100%', mt: 4 }}>
        {loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : (
            <DataTable
              title="Volatility Alerts"
              columns={columns}
              data={data}
              pagination
              highlightOnHover
              theme="Dark"
              customStyles={customStyles}
              responsive
              progressPending={loading}
              noDataComponent={<Typography variant="body1" color="text.secondary">No data available</Typography>}
              className="data-table" // Add the custom class here
            />

        )}
      </Box>
    </AppTheme>
  );
};

export default AlertDataTable;
