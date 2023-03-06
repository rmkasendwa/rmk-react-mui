import { Palette, alpha, createTheme, darken } from '@mui/material';
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
      MuiIconButton: {
        defaultProps: {
          color: 'inherit',
        },
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(1),
            '&.Mui-disabled': {
              color: palette.text.disabled,
            },
            '&:hover': {
              backgroundColor: alpha(palette.text.primary, 0.1),
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(palette.background.paper, 0.15),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: palette.primary.main,
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: 14,
            fontWeight: baseTheme.typography.fontWeightMedium,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            '& svg': {
              fontSize: 20,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            paddingLeft: baseTheme.spacing(3),
            paddingRight: baseTheme.spacing(3),
          },
          title: {
            fontSize: 20,
            [baseTheme.breakpoints.down('sm')]: {
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            paddingLeft: baseTheme.spacing(3),
            paddingRight: baseTheme.spacing(3),
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: 14,
          },
          asterisk: {
            color: palette.error.main,
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          colorAction: {
            color: palette.text.primary,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
          fullWidth: true,
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: 14,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(palette.text.disabled, 0.1),
            },
          },
          notchedOutline: {
            borderColor: alpha(palette.text.primary, 0.2),
          },
          input: {
            height: 'auto',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          message: {
            fontSize: 12,
            lineHeight: '20px',
          },
        },
      },
    },
  });
};
