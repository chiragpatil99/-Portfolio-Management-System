/*

Aythor :- Chirag Patil
Description :- A React component to fetch and display stock prices by symbol with error handling.

*/


import React, { useState } from 'react';
import { fetchStockPrice } from '../services/stockService';

const StockPriceFetcher: React.FC = () => {
    const [symbol, setSymbol] = useState('');
    const [price, setPrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetchPrice = async () => {
        try {
            const data = await fetchStockPrice(symbol);
            setPrice(data.price);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error fetching stock price');
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Stock Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
            />
            <button onClick={handleFetchPrice}>Fetch Price</button>
            {price && <p>Price: ${price}</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default StockPriceFetcher;
