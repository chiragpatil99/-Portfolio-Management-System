import React from 'react';
import { Grid, Paper, Typography, Box, Container } from '@mui/material';
import PortfolioPieChart from './PortfolioPieChart';
import PortfolioChart from './PortfolioChart';
import AlertDataTable from './AlertDataTable';
import StockImageBl from '../assets/sbg.jpg';

const ReportDashboard: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: '40px 20px',
        backgroundImage: `url(${StockImageBl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker overlay effect with 50% transparency
          zIndex: -1,
        },
      }}
    >
      {/* Title Section */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: '#ffffff',
          marginBottom: '40px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Report Dashboard
      </Typography>

      {/* Centered Content Section */}
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Alerts Section */}
        <Grid container spacing={3}>

          {/* Charts Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                padding: '20px',
                backgroundColor: '#1E1E1E',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.4)',
                display: 'flex',         
                justifyContent: 'center', // Center horizontally
                alignItems: 'center',     // Center vertically
                height: '100%',         
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  color: '#ffffff',
                  position: 'absolute', // Keep the title outside the chart area
                  fontWeight: '500',
                  fontSize: '18px'
                }}
              >
                Portfolio Allocation
              </Typography>
              <PortfolioPieChart />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                padding: '20px',
                backgroundColor: '#1E1E1E',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.4)',
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ color: '#ffffff', marginBottom: '10px', fontWeight: '500' }}
              >
                Alerts Table
              </Typography>
              <AlertDataTable />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                padding: '20px',
                backgroundColor: '#1E1E1E',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.4)',
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ color: '#ffffff', marginBottom: '10px', fontWeight: '500' }}
              >
                Portfolio Performance
              </Typography>
              <PortfolioChart />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportDashboard;
