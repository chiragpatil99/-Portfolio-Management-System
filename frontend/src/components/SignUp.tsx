import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppTheme from './shared_theme/AppTheme';
import ColorModeSelect from './shared_theme/ColorModeSelect';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  padding: 20,
  marginTop: '10vh',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  // Error states
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');

  const [generalErrorMessage, setGeneralErrorMessage] = React.useState(''); // General error state for backend errors

  const [password, setPassword] = React.useState(''); // State for password
  const [confirmPassword, setConfirmPassword] = React.useState(''); // State for re-enter password

  const navigate = useNavigate();

  const validateInputs = () => {
    const name = document.getElementById('name') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;

    let isValid = true;

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Please enter your user name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    // Compare the two passwords
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralErrorMessage(''); // Reset general error message before submitting
  
    if (validateInputs()) {
      const data = new FormData(event.currentTarget);
      const username = data.get('name') as string;
      const email = data.get('email') as string;
      const lastName = data.get('lastName') as string;
      const firstName = data.get('firstName') as string;

      try {
        // Register the user
        const response = await axios.post('/api/register/', {
          username,
          email,
          password,
          lastName,
          firstName,
        });
  
        if (response.status === 201) {
          console.log('Registration successful:', response.data);
  
          // Automatically logging in the user after successful registration
          const loginResponse = await axios.post('/api/login/', { email, password });
          if (loginResponse.data.token) {
            localStorage.setItem('authToken', loginResponse.data.token); // Save token in localStorage
            navigate('/dashboard'); // Redirect to dashboard after successful login
          } else {
            setGeneralErrorMessage('Login failed after registration: No token received.');
          }
        } else {
          setGeneralErrorMessage('Registration failed. Please try again.');
        }
      } catch (error: any) {
        // Handle backend errors
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 400) {
              // Extract message from backend response and display it
              const backendMessage = error.response.data.message;
              if (Array.isArray(backendMessage) && backendMessage.length > 0) {
                setGeneralErrorMessage(backendMessage[0].replace(/['"]+/g, ''));
              } else {
                setGeneralErrorMessage('Registration failed: Email already exists.');
              }
            } else if (error.response.status >= 500) {
              // Server errors (HTTP 500 and above)
              setGeneralErrorMessage('Something went wrong. Please try again.');
            } else {
              // Other kinds of response errors
              setGeneralErrorMessage('Registration failed. Please check your details.');
            }
          } else {
            // No response from the server, likely a network error
            setGeneralErrorMessage('Network error. Please check your connection.');
          }
        } else {
          // General catch-all for unexpected errors
          setGeneralErrorMessage('An error occurred during registration. Please try again.');
        }
      }
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>

          {/* Show general error message */}
          {generalErrorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {generalErrorMessage}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="name">UserName</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="name"
                name="name"
                placeholder="JonSnow101"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="firstName"
                name="firstName"
                placeholder="Jon"
                autoComplete="firstName"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="lastName"
                name="lastName"
                placeholder="Snow"
                autoComplete="lastName"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Track password input
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirm-password">Re-enter Password</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="••••••"
                required
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} // Track confirm password input
                color={confirmPasswordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="agreeTerms" color="primary" />}
              label="I agree to the terms and conditions."
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Sign up
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Google')}
            >
              Sign up with Google
            </Button>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Facebook')}
            >
              Sign up with Facebook
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
