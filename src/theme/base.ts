import { Palette, createTheme, darken } from '@mui/material';
import { grey } from '@mui/material/colors';

// Mood Colors
export const SUCCESS_COLOR = '#238636';

export const WHITE_COLOR = '#fff';
export const BLACK_COLOR = '#000';
export const DARK_FG_COLOR = grey[800];

export const getBaseTheme = (palette: Palette): any => {
  const baseTheme = createTheme({ palette });
  return createTheme({
    ...baseTheme,
    mixins: {
      toolbar: {
        minHeight: 48,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:active': {
              boxShadow: 'none',
            },
          },
          containedInherit: {
            backgroundColor: darken(palette.background.paper, 0.1),
            '&:hover': {
              backgroundColor: darken(palette.background.paper, 0.18),
              boxShadow: 'none',
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
  });
};
