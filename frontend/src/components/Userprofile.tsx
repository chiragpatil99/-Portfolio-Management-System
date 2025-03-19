/*

Author:- Chirag Patil
Description :- A React component that displays a user's profile details, including username, email,
               and last login, with loading and error handling.
*/

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Divider, Avatar, Button } from '@mui/material';
import AppTheme from './shared_theme/AppTheme';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StockImage from '../assets/stock_management_image4.webp';


const Userprofile: React.FC = () => {
    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('User not authenticated.');
                    return;
                }

                const response = await axios.get('/api/user/', {
                    headers: { Authorization: `Token ${token}` },
                });

                setUserDetails(response.data?.user);
            } catch (err) {
                setError('Failed to fetch user details.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <AppTheme>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(36, 36, 36, 0.8))', // Dark gradient background
                    color: 'text.primary',
                    p: 3,
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
                    }

                }}
            >
                <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 4, boxShadow: 10 }}>
                    <CardContent sx={{ textAlign: 'center', paddingBottom: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 100, height: 100, mx: 'auto', mb: 2 }}>
                            <AccountCircleIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                            My Profile
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {loading ? (
                            <CircularProgress />
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : (
                            <Box sx={{ mt: 2, textAlign: 'left' }}>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    <strong>Username:</strong> {userDetails?.username || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    <strong>Email:</strong> {userDetails?.email || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    <strong>First Name:</strong> {userDetails?.firstName || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    <strong>Last Name:</strong> {userDetails?.lastName || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    <strong>Last Login:</strong>{' '}
                                    {userDetails?.last_login
                                        ? new Date(userDetails.last_login).toLocaleDateString()
                                        : 'N/A'}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </AppTheme>
    );
};

export default Userprofile;
