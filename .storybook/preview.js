import '../src/scss/style.scss';

import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { withThemes } from '@react-theming/storybook-addon';
import { addDecorator } from '@storybook/react';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { APIProvider, GlobalConfigurationProvider } from '../src/contexts';
import store from '../src/redux/store';
import { darkTheme, defaultTheme } from '../src/theme';

const providerFn = ({ theme: { theme }, children }) => {
  const serialTheme = JSON.parse(JSON.stringify(theme));
  const muiTheme = createTheme(serialTheme);

  useEffect(() => {
    const interval = setInterval(() => {
      document.querySelector('#addon-backgrounds-color')?.remove();
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <GlobalConfigurationProvider>
        <APIProvider>
          <ReduxProvider store={store}>
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <Formik>{children}</Formik>
            </ThemeProvider>
          </ReduxProvider>
        </APIProvider>
      </GlobalConfigurationProvider>
    </BrowserRouter>
  );
};

addDecorator(
  withThemes(
    null,
    [
      {
        name: 'Light Theme',
        theme: defaultTheme,
      },
      {
        name: 'Dark Theme',
        theme: darkTheme,
      },
    ],
    { providerFn }
  )
);

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
  layout: 'fullscreen',
};
