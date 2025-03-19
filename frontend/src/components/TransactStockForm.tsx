/*
Author :- Chirag Patil
Description :- Frontend for all the activity on the purchase-sell page. Includes various components and given description on top of each part in the code below of what it does.
*/



import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TextField, Slider, IconButton, ButtonGroup, Button, ToggleButtonGroup, ToggleButton, Snackbar, Card, CardContent } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import AppTheme from './shared_theme/AppTheme';
import { fetchTimeSeries, purchaseStock, sellStock, fetchProfitLossData, getPortfolioDiversity, getRiskAssessment, setVolatility, getVolatility, getCompanyInfo } from '../services/stockService';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import Grid from '@mui/material/Grid2';
import Modal from '@mui/material/Modal';



const PurchaseStockForm: React.FC = () => {
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactionType, setTransactionType] = useState<'purchase' | 'sell'>('purchase');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [profitLossData, setProfitLossData] = useState<any>(null);
    const [interval, setInterval] = useState<string>('1day');
    const [portfolioDiversity, setPortfolioDiversity] = useState<number | null>(null); // For portfolio diversity
    const [riskAssessment, setRiskAssessment] = useState<any>(null); // New state for risk assessment
    const [open, setOpen] = React.useState(false);
    const [companyInfo, setCompanyInfo] = useState<string | null>(null); // State for company information

    const [sliderValue, setSliderValue] = useState<number>(0.5);
    const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null);
    const [volatilityError, setVolatilityError] = useState<string | null>(null);


    interface VolatilityData {
        symbol: string;
        current_volatility: number;

    }

    const fetchVolatilityData = async (symbol: string) => {
        try {
            const data: any = await getVolatility(symbol); // GET info for particular symbol
            setVolatilityData(data)

        } catch (error) {
            console.error('Error fetching volatility:', error);
            setVolatilityError('Failed to fetch volatility data. Please try again.');
        }
    };


    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const initialSymbol = queryParams.get('symbol');
        const intialName = queryParams.get('name');


        if (initialSymbol) {
            setSymbol(initialSymbol);
            if (intialName) { setName(intialName); }
            handleFetchTimeSeries(initialSymbol, interval);
            handleProfitLossData(initialSymbol)
            handlePortfolioDiversity(initialSymbol);
            fetchRiskAssessment(initialSymbol); // Fetch risk assessment data
            fetchVolatilityData(initialSymbol);

        }
    }, []);

    const handleFetchTimeSeries = async (symbolParam = symbol, interval = '1day') => {
        setInterval(interval); // Keep track of the interval state
        setLoading(true);
        setError(null)
        try {
            const data = await fetchTimeSeries(symbolParam, interval);
            const formattedData = data
                .map((entry: any) => ({
                    time: entry.time,
                    close: entry.close,
                }))
                .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

            setTimeSeriesData(formattedData);
        } catch (error) {
            setError('Failed to fetch time series data. Please check the symbol and try again.');
        } finally {
            setLoading(false);
        }
    };


    /*
        Author :- Chirag Patil.
        Description :- A function to fetch and manage profit/loss time series data for a given stock symbol with loading and error handling.
        */
    const handleProfitLossData = async (symbolParam = symbol, interval = '1day') => {
        setLoading(true);
        setError(null)
        try {
            const data = await fetchProfitLossData(symbolParam);

            setProfitLossData(data);
        } catch (error) {
            setError('Failed to fetch time series data. Please check the symbol and try again.');
        } finally {
            setLoading(false);
        }
    };


    const getDateFormat = () => {
        switch (interval) {
            case '1day':
                return 'HH:mm'; // Hourly format for 1 day
            case '1week':
            case '1month':
                return 'MMM d'; // Daily format for shorter intervals
            case '3month':
                return 'MMM d'; // Daily format for shorter intervals
            case 'ytd':
                return 'MMM d'; // Monthly format for longer intervals
            case '1year':
                return 'MMM yyyy'; // Monthly format for longer intervals
            case 'max':
                return 'yyyy'; // Yearly format for max interval
            default:
                return 'MMM d'; // Default format
        }
    };

    /*
    Author :- Chirag Patil.
    Description :- A function to handle stock purchase or sale transactions, update related data, and display feedback messages with error handling
    */
    const handleSubmit = async () => {
        try {
            if (transactionType === 'purchase') {
                console.log(symbol, name, quantity)
                await purchaseStock(symbol, name, quantity);

                setSnackbarMessage('Stock purchased successfully');
            } else {
                await sellStock(symbol, quantity);
                setSnackbarMessage('Stock sold successfully');
            }
            handleProfitLossData(symbol)
            setSnackbarOpen(true);
            fetchProfitLossData(symbol);
            handlePortfolioDiversity(symbol);
        } catch (error: any) {
            console.error('Transaction error:', error);
            setSnackbarMessage('Error during transaction');
            setSnackbarOpen(true);
        }
    };
    /*
    Author :- Chirag Patil
    Description :- Functions to manage snackbar visibility and fetch portfolio diversity data for a given stock symbol with error handling
    */
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handlePortfolioDiversity = async (symbolParam = symbol) => {
        try {
            const data = await getPortfolioDiversity();
            const stock = data.portfolio.find((item: any) => item.symbol === symbolParam);
            setPortfolioDiversity(stock ? stock.diversity_percentage : null);
        } catch (error) {
            console.error('Error fetching portfolio diversity:', error);
        }
    };



    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    /*
    Author :- Chirag Patil.
    Description:-A function to fetch and update risk assessment data for a given stock symbol with error handling.
    
    */
    const fetchRiskAssessment = async (symbol: string) => {
        try {
            const data = await getRiskAssessment(symbol);
            setRiskAssessment(data);
            setError(null); // Reset error
        } catch (err: any) {
            console.error('Error fetching risk assessment:', err);
            setError(err.response?.data?.error || 'Failed to fetch risk assessment.');
        }
    };



    const handlesetVolatility = async (symbol: string, sliderValue: number) => {
        try {
            await setVolatility(symbol, sliderValue);
            setSnackbarMessage('Volatility set successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to set volatility: ', error);
            setSnackbarMessage('Failed to set Volatility. Please try again');
            setSnackbarOpen(true);
        }
    };
    /*
    Author :- Chirag Patil
    Description :- A function to open a modal, fetch company information for a stock symbol, and handle loading and errors.
    
    */

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        setError(null);
        setCompanyInfo(null);

        try {
            const data = await getCompanyInfo(symbol);
            // Check if data contains the necessary fields
            if (data && data.description) {
                setCompanyInfo(data);  // Set the company information
            } else {
                setError('No company information available.');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);  // Turn off loading state
        }
    };

    /*
    
    Author :- Chirag Patil.
    Description:- A function to close the modal and reset company information and error state.
    
    */

    const handleClose = () => {
        setOpen(false);
        setCompanyInfo(null);
        setError(null);
    };


    /*
    Author :- Chirag Patil
    Description:- A React component displaying a stock price chart, company information in a modal, 
                  and profit/loss data with various time intervals, investment performance, risk assessment,
                  and volatility data in cards, and refresh functionality.
                  Also A React component for a stock transaction form with options for purchasing or selling,
                  adjusting volatility, and displaying success messages.

    */

    return (
        <AppTheme>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    p: 3,
                    px: 4,
                    mx: 'auto',
                }}
            >


                {/* Left Column: Graph */}
                <Box sx={{ flex: 1, maxWidth: '60%', pr: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h2">
                            {name.toUpperCase()} Stock Price Chart

                            <Button onClick={handleOpen} style={{ padding: '1px' }}>
                                <i className="fa-solid fa-circle-info" style={{ padding: '1px' }}></i>
                            </Button>

                            <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '60%',
                                        bgcolor: 'background.paper',
                                        boxShadow: 24,
                                        borderRadius: 2,
                                        p: 4,
                                    }}
                                >
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                        Company Information
                                    </Typography>
                                    <Box id="modal-modal-description" sx={{ mt: 2, textAlign: 'justify' }}>
                                        {loading ? (
                                            "Loading..."
                                        ) : error ? (
                                            `Error: ${error}`
                                        ) : companyInfo ? (
                                            Object.entries(companyInfo).map(([key, value]) => (
                                                <Typography key={key} sx={{ mb: 1 }}>
                                                    <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong> {value || "N/A"}
                                                </Typography>
                                            ))
                                        ) : (
                                            "No information available."
                                        )}
                                    </Box>
                                </Box>
                            </Modal>



                        </Typography>
                        <IconButton onClick={() => handleFetchTimeSeries(symbol, interval)}>
                            <RefreshIcon color="secondary" />
                        </IconButton>
                    </Box>
                    <ButtonGroup variant="outlined" color="primary" sx={{ mb: 2 }}>
                        <Button variant={interval === '1day' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, '1day')}>1 Day</Button>
                        <Button variant={interval === '1week' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, '1week')}>1 Week</Button>
                        <Button variant={interval === '1month' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, '1month')}>1 Month</Button>
                        <Button variant={interval === '3month' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, '3month')}>3 Months</Button>
                        <Button variant={interval === 'ytd' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, 'ytd')}>YTD</Button>
                        <Button variant={interval === '1year' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, '1year')}>1 Year</Button>
                        <Button variant={interval === 'max' ? 'contained' : 'outlined'} onClick={() => handleFetchTimeSeries(symbol, 'max')}>MAX</Button>
                    </ButtonGroup>

                    {loading && <CircularProgress />}
                    {error && <Typography color="error">{error}</Typography>}
                    {timeSeriesData.length > 0 && (
                        <Box sx={{ mt: 2, width: '100%', height: '400px', padding: '16px', borderRadius: '8px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: '#ccc' }}
                                        axisLine={{ stroke: '#ccc' }}
                                        tickFormatter={(time) => format(parseISO(time), getDateFormat())}
                                    />
                                    <YAxis
                                        domain={['dataMin', 'dataMax']}
                                        tick={{ fill: '#ccc' }}
                                        axisLine={{ stroke: '#ccc' }}
                                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => `$${(value as number).toFixed(2)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="close"
                                        stroke="#4caf50"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    )}


                    {profitLossData ? (
                        <Grid container spacing={3} sx={{ mt: 4 }}>
                            {/* First Card: Stock Details */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card elevation={3} sx={{ p: 2 }}>
                                    <CardContent>
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            Your Market Value:
                                            <br />
                                            {profitLossData ? (
                                                <Typography
                                                    variant="h4"
                                                    component="div"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    ${profitLossData.market_value.toFixed(2)}
                                                </Typography>
                                            ) : (
                                                'Loading...'
                                            )}
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 2 }}>
                                            {/* Total Return Grid Item */}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="body1"
                                                    sx={{ fontSize: '0.9rem' }}
                                                >
                                                    Quantity Owned:
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{ fontSize: '0.9rem', fontWeight: "normal" }}
                                                >
                                                    {profitLossData ? `${profitLossData.net_quantity}` : 'Loading...'}
                                                </Typography>
                                            </Grid>



                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="body1"
                                                    sx={{ fontSize: '0.9rem' }}
                                                >
                                                    Portfolio Diversity:
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{ fontSize: '0.9rem', fontWeight: "normal" }}
                                                >
                                                    {portfolioDiversity ? `${portfolioDiversity.toFixed(2)}%` : 'N/A'}
                                                </Typography>
                                            </Grid>



                                        </Grid>

                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Second Card: Investment Performance */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card elevation={3} sx={{ p: 2 }}>
                                    <CardContent>
                                        {/* Centered Average Buy Price */}
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            Your Average cost:
                                            <br />
                                            {profitLossData ? (
                                                <Typography
                                                    variant="h4"
                                                    component="div"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    ${profitLossData.average_buy_price.toFixed(2)}
                                                </Typography>
                                            ) : (
                                                'Loading...'
                                            )}
                                        </Typography>

                                        {/* Grid container for Total Return and Profit/Loss Percentage side by side */}
                                        <Grid container spacing={2} sx={{ mt: 2 }}>
                                            {/* Total Return Grid Item */}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="body1"
                                                    sx={{ fontSize: '0.9rem' }}
                                                >
                                                    Total Return:
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{ fontSize: '0.9rem', fontWeight: "normal" }}
                                                >
                                                    {profitLossData ? `$${profitLossData.total_return.toFixed(2)}` : 'Loading...'}
                                                </Typography>
                                            </Grid>

                                            {/* Profit/Loss Percentage Grid Item */}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="body1"
                                                    sx={{ fontSize: '0.9rem' }}
                                                >
                                                    Profit/Loss Percentage:
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{ fontSize: '0.9rem', fontWeight: "normal" }}

                                                >
                                                    {profitLossData ? `${profitLossData.profit_loss_percentage.toFixed(2)}%` : 'Loading...'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>


                            {/* Risk Assessment Card */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card elevation={3} sx={{ p: 1.5 }}>
                                    <CardContent>
                                        <Typography variant="h6"
                                            component="div"
                                            sx={{ mb: 1 }}
                                        >
                                            Risk Assessment
                                        </Typography>
                                        {riskAssessment ? (
                                            <>
                                                {/* <Typography variant="body2">Symbol: {riskAssessment.symbol}</Typography> */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}
                                                >
                                                    <span>Latest Close: ${riskAssessment.latest_close.toFixed(2)}</span>
                                                    <span>Recommendation: {riskAssessment.recommendation}</span>

                                                </Typography>
                                                {/* <Typography variant="body2">MA20: ${riskAssessment.MA20.toFixed(2)}</Typography>
                                                <Typography variant="body2">MA50: ${riskAssessment.MA50.toFixed(2)}</Typography> */}
                                                {/* <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                    Recommendation: {riskAssessment.recommendation}
                                                </Typography> */}
                                            </>
                                        ) : (
                                            <Typography variant="body2">Loading risk assessment...</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card elevation={3} sx={{ p: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="h6" component="div">Volatility Over Day</Typography>
                                            <IconButton
                                                onClick={() => fetchVolatilityData(symbol)}
                                                size="small"
                                                color="primary"
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </Box>

                                        {/* Display volatility data */}
                                        {volatilityError ? (
                                            <Typography color="error">{volatilityError}</Typography>
                                        ) : volatilityData ? (
                                            <>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Current Volatility:</strong> {volatilityData.current_volatility}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body2">Loading volatility data...</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    ) : (
                        ''
                    )}

                </Box>

                {/* Right Column: Transaction Form */}
                <Box sx={{ flex: 1, maxWidth: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "7rem" }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {transactionType === 'purchase' ? 'Purchase Stock' : 'Sell Stock'}
                    </Typography>
                    <ToggleButtonGroup
                        value={transactionType}
                        exclusive
                        onChange={(_, newType) => setTransactionType(newType || 'purchase')}
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="purchase">Purchase</ToggleButton>
                        <ToggleButton value="sell">Sell</ToggleButton>
                    </ToggleButtonGroup>
                    <TextField
                        label="Stock Symbol"
                        variant="outlined"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        sx={{ mb: 2, width: '300px' }}
                    />
                    {transactionType === 'purchase' && (
                        <TextField
                            label="Stock Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2, width: '300px' }}
                        />
                    )}
                    <TextField
                        label="Quantity"
                        variant="outlined"
                        value={quantity}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            if (/^\d*$/.test(newValue)) { // Only allow numeric input
                                setQuantity(Number(newValue));
                            }
                        }}
                        slotProps={{
                            input: {
                                inputMode: "numeric", // Suggest numeric keypad
                            },
                        }}
                        sx={{ mb: 2, width: '300px' }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                    >
                        {transactionType === 'purchase' ? 'Purchase' : 'Sell'}
                    </Button>
                    <Grid container spacing={3} sx={{ mt: 4 }}></Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3} sx={{ p: 2 }}>
                            <CardContent>
                                <Typography variant="h6" component="div">Annualized Volatility Over 30 days</Typography>

                                {/* Slider */}
                                <Box sx={{ my: 2, width: '300px' }}>
                                    <Typography gutterBottom>Adjust Volatility</Typography>
                                    <Slider
                                        value={sliderValue}
                                        onChange={(e, value) => setSliderValue(value as number)}
                                        step={0.01} // Slider increments by 0.01
                                        min={0}
                                        max={1}
                                        valueLabelDisplay="auto"
                                    />
                                    {/* Displaying the selected slider value */}
                                    <Typography variant='body2' color="textSecondary" align="center" sx={{ mt: 1 }}>
                                        Selected Volatility: {sliderValue.toFixed(2)}
                                    </Typography>
                                </Box>

                                {/* Button to set Volatility */}
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={() => handlesetVolatility(symbol, sliderValue)}
                                    sx={{ mt: 2 }}
                                >
                                    Set Volatility Preference
                                </Button>

                            </CardContent>
                        </Card>
                    </Grid>
                </Box>

            </Box>

            {/* Snackbar for success messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
        </AppTheme >
    );
};

export default PurchaseStockForm;
