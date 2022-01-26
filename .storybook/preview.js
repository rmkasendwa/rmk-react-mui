import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { withThemes } from '@react-theming/storybook-addon';
import { addDecorator } from '@storybook/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { APIProvider, GlobalConfigurationProvider } from '../src/contexts';
import { defaultTheme } from '../src/theme';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../src/redux/store';
import '../src/scss/style.scss';

const providerFn = ({ theme, children }) => {
  const serialTheme = JSON.parse(JSON.stringify(theme));
  const muiTheme = createTheme(serialTheme);
  return (
    <BrowserRouter>
      <GlobalConfigurationProvider>
        <APIProvider>
          <ReduxProvider store={store}>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <Box minWidth={960} maxWidth={1200}>
                {children}
              </Box>
            </ThemeProvider>
          </ReduxProvider>
        </APIProvider>
      </GlobalConfigurationProvider>
    </BrowserRouter>
  );
};

addDecorator(withThemes(null, [defaultTheme], { providerFn }));

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    source: {
      type: 'code',
    },
  },
};
