import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { Autocomplete, TextField, Stack, Divider } from '@mui/material';
import AppTheme from './shared_theme/AppTheme';
import StockImage from '../assets/stock_management_image4.webp';
import { getUserDetails, searchTicker } from '../services/stockService';
import UserPortfolio from './userPortfolio';

interface Suggestion {
  name: string;
  symbol: string;
  label: string;

}

const getCurrentDateTime = () => {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { date, time };
};

const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
};

export default function Homepage() {
  const [symbol, setSymbol] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [date, setDate] = useState<string>(getCurrentDateTime().date);
  const [time, setTime] = useState<string>(getCurrentDateTime().time);
  const [username, setUsername] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const marketStatus = isMarketOpen() ? 'Market Open' : 'Market Closed';

  const handleSearch = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && symbol) {
      navigate(`/transact-stock-form?symbol=${encodeURIComponent(symbol)}`);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const { date, time } = getCurrentDateTime();
      setDate(date);
      setTime(time);
    }, 60000);
    handleuserDetails()
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (symbol.length >= 2) {
      const fetchSuggestions = async () => {
        try {
          const data = await searchTicker(symbol);
      
          if (data.bestMatches && data.bestMatches.length > 0) {
            setSuggestions(
              data.bestMatches.map((match: any) => ({
                name: `${match['2. name']}`,
                label: `${match['1. symbol']} - ${match['2. name']}`,
                symbol: match['1. symbol'],
              }))
            );
          } else {
            setSuggestions([]);
            console.warn("No suggestions found for the given symbol.");
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      };      
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [symbol]);


  const handleuserDetails = async () => {
    try {
        const data = await getUserDetails();
        setUsername(data.user.username);
    } catch (error) {
        setError('Failed to fetch user data');
    } finally {
        setLoading(false);
    }
};

  return (
    <AppTheme>
      <CssBaseline />

      {/* Full Background Image with Darker Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${StockImage})`,
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
      />

      {/* Content Wrapper */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          width: '100%',
          maxWidth: '1200px',
          px: 4,
          pt: 4,
          mx: 'auto', // Ensure content is centered
        }}
      >
        {/* Greeting and Market Status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%',
            mb: 4,
            padding: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Hello, {username}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body1" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#ddd' }}>
              {date}, {time}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography
              variant="body1"
              sx={{
                fontSize: '0.8rem',
                color: marketStatus === 'Market Open' ? '#76ff03' : '#ff5252',
                fontWeight: 500,
              }}
            >
              {marketStatus}
            </Typography>
          </Stack>
        </Stack>

        {/* Search Bar */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '600px',
            mb: 6,
          }}
        >
          <Autocomplete
            freeSolo
            options={suggestions}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
            inputValue={symbol}
            onInputChange={(event, newInputValue) => setSymbol(newInputValue)}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue !== 'string' && 'symbol' in newValue) {
                setSymbol(newValue.symbol);
                navigate(`/transact-stock-form?symbol=${encodeURIComponent(newValue.symbol)}&name=${newValue.name}`);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for Company Symbol"
                variant="outlined"
                fullWidth
                onKeyPress={handleSearch}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light background for input
                  borderRadius: 1,
                }}
              />
            )}
          />
        </Box>

        {/* User Portfolio Table */}
        <UserPortfolio />
      </Box>
    </AppTheme>
  );
}
