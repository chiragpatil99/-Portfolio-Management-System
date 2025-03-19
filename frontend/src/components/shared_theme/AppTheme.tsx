//sathya theme

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from '../customizations/inputs';
import { dataDisplayCustomizations } from '../customizations/dataDisplay';
import { feedbackCustomizations } from '../customizations/feedback';
import { navigationCustomizations } from '../customizations/navigation';
import { surfacesCustomizations } from '../customizations/surfaces';
import { colorSchemes, typography as baseTypography, shadows, shape } from './themePrimitives';

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

export default function AppTheme({
  children,
  disableCustomTheme,
  themeComponents,
}: AppThemeProps) {
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
        cssVariables: {
          colorSchemeSelector: 'data-mui-color-scheme',
          cssVarPrefix: 'template',
        },
        colorSchemes,
        typography: {
          ...baseTypography, // Keep your base typography settings
          fontFamily: "'Roboto', sans-serif", // Define the global font here
          h1: {
            fontFamily: "'Roboto', sans-serif",
            fontSize: '2.5rem',
          },
          h2: {
            fontFamily: "'Roboto', sans-serif",
            fontSize: '2rem',
          },
          body1: {
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
          },
          button: {
            fontFamily: "'Roboto', sans-serif",
            textTransform: 'none', // Prevent uppercase transformation on buttons
          },
        },
        shadows,
        shape,
        components: {
          ...inputsCustomizations,
          ...dataDisplayCustomizations,
          ...feedbackCustomizations,
          ...navigationCustomizations,
          ...surfacesCustomizations,
          ...themeComponents,
        },
      });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
