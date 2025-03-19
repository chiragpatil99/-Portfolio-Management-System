import * as React from 'react';
import { useEffect, useState } from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import AppTheme from './shared_theme/AppTheme';
import ColorModeSelect from './shared_theme/ColorModeSelect';

const NavbarLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

const LogoLink = styled(RouterLink)({
  textDecoration: 'none',
  color: 'inherit',
});

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userInitials = 'AB';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get isLoggedIn state from Redux store
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  return (
    <AppTheme>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '48px', px: 2 }}>
          <LogoLink to="/">
            <Logo variant="h6">
              Profolio
            </Logo>
          </LogoLink>

          {isLoggedIn && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <NavbarLink to="/dashboard">
                Dashboard
              </NavbarLink>
              <NavbarLink to="/report-dashboard">
                Reports
              </NavbarLink>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* ColorMode switcher */}
            <ColorModeSelect />

            {/* User Avatar with Menu */}
            {isLoggedIn ? (
              <>
                <IconButton onClick={handleMenuClick}>
                  <Avatar>{userInitials}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate('/user'); // Navigate to My Profile
                    }}
                  >
                    Profile
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <NavbarLink to="/">
                Login
              </NavbarLink>
            )}
          </Box>
        </Toolbar>
      </AppBar>

    </AppTheme>
  );
};

export default Navbar;
