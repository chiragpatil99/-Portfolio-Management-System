

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DataTable, { createTheme } from 'react-data-table-component';
import { fetchTransactions } from '../services/stockService';
import { useTheme } from '@mui/material/styles';
import AppTheme from './shared_theme/AppTheme';
import './userPortfolio.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Interface for transactions
interface Transaction {
  id: number;
  stock_symbol: string;
  stock_name: string;
  stock_quantity: number;
  stock_price: number;
  portfolio_value: number;
  transaction_datetime: string;
  user: number;
}

// Custom theme for DataTable
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

// Define custom styles for DataTable
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

export default function UserPortfolio() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    handleFetchTransactionData();
  }, []);

  const handleFetchTransactionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data_fetched = await fetchTransactions();
      console.log(data_fetched);
      setTransactions(data_fetched.transactions);
    } catch (error) {
      setError('Failed to fetch transactions. Please try again.');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (symbol: string) => {
    navigate(`/transact-stock-form?symbol=${symbol}`);
  };

  const formatDateTime = (datetime: string): string => {
    const date = new Date(datetime);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  // Function to export the table to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();

    // Add title
    doc.text('Stock Portfolio', 14, 10);

    // Map transactions to a format suitable for jsPDF autotable
    const tableData = transactions.map((transaction) => [
        transaction.stock_symbol,
        transaction.stock_name,
        transaction.stock_quantity,
        transaction.stock_price
            ? `$${Number(transaction.stock_price).toFixed(2)}`
            : 'N/A', // Handle missing or undefined stock_price
        `$${Number(transaction.portfolio_value).toFixed(2)}`, // Convert portfolio_value to a number
    ]);

    // Add table using autoTable
    autoTable(doc, {
        head: [['Symbol', 'Name', 'Quantity', 'Stock Price', 'Portfolio Value']],
        body: tableData,
        startY: 20,
    });

    // Save the PDF
    doc.save('StockPortfolio.pdf');
};


  const columns = [
    {
      name: 'Symbol',
      cell: (row: Transaction) => (
        <Typography
          variant="body2"
          color="primary"
          onClick={() => handleNavigate(row.stock_symbol)}
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          {row.stock_symbol}
        </Typography>
      ),
      sortable: true,
      width: '10%',
    },
    {
      name: 'Name',
      selector: (row: Transaction) => row.stock_name,
      sortable: true,
      width: '20%',
    },
    {
      name: 'Quantity',
      selector: (row: Transaction) => row.stock_quantity,
      sortable: true,
    },
    {
      name: 'Current Stock Price',
      selector: (row: Transaction) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(row.stock_price),
      sortable: true,
    },
    {
      name: 'Portfolio Value',
      selector: (row: Transaction) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(row.portfolio_value),
      sortable: true,
    },
  ];

  return (
    <AppTheme>
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Your Stock Portfolio
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPdf}
          >
            Export to PDF
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : (
          <DataTable
            columns={columns}
            data={transactions}
            pagination
            highlightOnHover
            striped
            progressPending={loading}
            theme="Dark"
            customStyles={customStyles}
            noDataComponent={
              <Typography variant="body1" color="text.secondary">
                No stocks owned yet
              </Typography>
            }
          />
        )}
      </Box>
    </AppTheme>
  );
}
