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
          sizeMedium: {
            [baseTheme.breakpoints.down('sm')]: {
              height: 32,
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
      MuiTabs: {
        styleOverrides: {
          root: {
            marginLeft: baseTheme.spacing(1),
          },
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: palette.common.white,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            margin: '0 16px',
            minWidth: 0,
            padding: 0,
            [baseTheme.breakpoints.up('md')]: {
              padding: 0,
              minWidth: 0,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: baseTheme.spacing(1),
            color: palette.text.primary,
            '&.Mui-disabled': {
              color: palette.text.disabled,
            },
            '&:hover': {
              backgroundColor: alpha(palette.text.primary, 0.1),
            },
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
            minWidth: 'auto',
            marginRight: baseTheme.spacing(2),
            '& svg': {
              fontSize: 20,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: 32,
            height: 32,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: `1px solid ${alpha(palette.text.secondary, 0.2)}`,
          },
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
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${alpha(palette.text.primary, 0.1)}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
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
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: palette.text.secondary,
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
    },
  });
};
