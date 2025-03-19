import axios from 'axios';

// Fetch item from local storage when the component mounts
const getAuthToken = () => localStorage.getItem('authToken');

const API_URL = '/api';

/*
Author:- Chirag Patil
Description :- Fetches the current stock price for a given symbol using an authenticated API request.
*/

export const fetchStockPrice = async (symbol: string) => {
    const storedData = getAuthToken(); // Fetch latest token

    const response = await axios.get(`${API_URL}/price/${symbol}/`, {
        headers: { Authorization: `Token ${storedData}` }
    });
    return response.data;
};

export const fetchDailyData = async () => {
    const storedData = getAuthToken(); // Fetch latest token

    const response = await axios.get(`${API_URL}/portfolio-daily`, {
        headers: { Authorization: `Token ${storedData}` }
    });
    return response.data;
};

/*
Author:- Chirag Patil
Description :- Makes a purchase request for a specific stock symbol, name, 
               and quantity using an authenticated API call.
*/

export const purchaseStock = async (symbol: string, name: string, quantity: number) => {
    const storedData = getAuthToken(); // Fetch latest token

    await axios.post(`${API_URL}/purchase/`, { symbol, name, quantity }, {
        headers: { Authorization: `Token ${storedData}` }
    });
};

export const getData = async () => {
    const storedData = getAuthToken(); // Fetch latest token

    const response = await axios.get(`${API_URL}/monte-carlo-simulation/`, {
        headers: { Authorization: `Token ${storedData}` }
    });

    return response.data;
};

/*
Author :- Chirag Patil
Description :-Makes a sell request for a specific stock symbol and quantity using an authenticated API call.

*/

export const sellStock = async (symbol: string, quantity: Number) => {
    const storedData = getAuthToken(); // Fetch latest token

    await axios.post(`${API_URL}/sell/`, { symbol, quantity }, {
        headers: { Authorization: `Token ${storedData}` }
    });
};

export const searchTicker = async (ticker: string) => {
    const storedData = getAuthToken();

    const response = await axios.get(`${API_URL}/search/`, {
        params: { ticker },
        headers: { Authorization: `Token ${storedData}` }
    });

    return response.data;
};

/*
Author :- Chirag Patil
Description :-Fetches company information for a given stock symbol using an authenticated API call.

*/

export const getCompanyInfo = async (symbol: string) => {
    const storedData = getAuthToken();

    const response = await axios.get(`/api/get-company-info/${symbol}/`, {
        headers: { Authorization: `Token ${storedData}` }
    });

    return response.data;
};

export const fetchAlertData = async () => {
    const storedData = getAuthToken();

    const response = await axios.get(`${API_URL}/alerts/`, {
        headers: { Authorization: `Token ${storedData}` }
    });

    return response.data;
};

export const fetchRecommendation = async (symbol: string) => {
    const storedData = getAuthToken();

    const response = await axios.get(`${API_URL}/risk?symbol=${symbol}`, {
        headers: { Authorization: `Token ${storedData}` }
    });

    return response.data;
};

/*
Author :- Chirag Patil
Description :- Fetches time series data for a given stock symbol and interval using an authenticated API call.

*/
export const fetchTimeSeries = async (symbol: string, interval: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('User is not authenticated.');

    try {
        const response = await axios.get(`${API_URL}/time_series/${symbol}/${interval}`, {
            headers: { Authorization: `Token ${token}` }
        });
        return response.data.time_series;
    } catch (error) {
        console.error('Error fetching time series:', error);
        throw error;
    }
};

export const fetchTransactions = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No auth token found');
        }

        console.log('Auth Token:', token);

        const response = await axios.get(`${API_URL}/user-holding/`, {
            headers: { Authorization: `Token ${token}` }
        });
        console.log('API Response', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};


/*
Author :- Chirag Patil
Description :- Fetches profit and loss data for a given stock symbol using an authenticated API call.

*/

export const fetchProfitLossData = async (symbol: string) => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('User is not authenticated.');
        const response = await axios.get(`${API_URL}/profit_loss_percentage/${symbol}/`, {
            headers: { Authorization: `Token ${token}` }
        });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error('Error fetching profit/loss data:', error);
        return null; // Return null if there was an error
    }
};

/*
Author :- Chirag Patil
Description :- Fetches user details using an authenticated API call and returns the data.


*/

export const getUserDetails = async () => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('User is not authenticated.');
        const response = await axios.get(`${API_URL}/user/`, {
            headers: { Authorization: `Token ${token}` }
        });
        return response.data; // Return the fetched data
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null; // Return null if there was an error
    }
};


/*
Author :- Chirag Patil
Description :- Fetches portfolio diversity data using an authenticated API call and returns the data.

*/

export const getPortfolioDiversity = async () => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/portfolio_diversity/`, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};

/*
Author :- Chirag Patil
Description :- Fetches risk assessment data for a given stock symbol using an authenticated API call and returns the data.
*/

export const getRiskAssessment = async (symbol: string) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/risk/`, {
            headers: { Authorization: `Token ${token}` },
            params: { symbol } // Pass the symbol as a query parameter
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch risk assessment:', error);
        throw error;
    }
};

export const setVolatility = async (symbol: string, volatility: number) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('User is not authenticated');
    }

    try {
        const response = await axios.post(
            `${API_URL}/user-preferences/`,
            { symbol, volatility_threshold: volatility },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error setting volatility:', error);
        throw error;
    }
};


export const getVolatility = async (symbol: string) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('User is not authenticated');
    }

    try {
        const response = await axios.get(
            `${API_URL}/check-volatility/${symbol}`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error checking volatility:', error);
        throw error;
    }
};