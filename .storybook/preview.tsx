import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Preview } from '@storybook/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDarkMode } from 'storybook-dark-mode';

import { APIProvider } from '../src/contexts/APIContext';
import { GlobalConfigurationProvider } from '../src/contexts/GlobalConfigurationContext';
import { MessagingProvider } from '../src/contexts/MessagingContext';
import { darkTheme, lightTheme } from '../src/theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      source: {
        type: 'code',
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      const darkMode = useDarkMode();
      return (
        <BrowserRouter>
          <GlobalConfigurationProvider>
            <APIProvider>
              <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
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

export default preview;
