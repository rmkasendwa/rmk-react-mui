import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { APIProvider } from '../src/contexts/APIContext';
import { GlobalConfigurationProvider } from '../src/contexts/GlobalConfigurationContext';
import { MessagingProvider } from '../src/contexts/MessagingContext';
import { defaultTheme } from '../src/theme';

const preview: Preview = {
  decorators: [
    (Story) => {
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
              <ThemeProvider theme={defaultTheme}>
                <CssBaseline />
                <MessagingProvider>
                  <Story />
                </MessagingProvider>
              </ThemeProvider>
            </APIProvider>
          </GlobalConfigurationProvider>
        </BrowserRouter>
      );
    },
  ],
};

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

export default preview;
