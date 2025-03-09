import { Palette, alpha, createTheme } from '@mui/material';
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
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            '&.Mui-disabled': {
              color: alpha(palette.text.primary, 0.26),
            },
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
            '&,&:hover': {
              backgroundColor: palette.divider,
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
          PopperProps: {
            sx: {
              zIndex: 9999,
            },
          },
          componentsProps: {
            tooltip: {
              sx: {
                bgcolor: palette.text.primary,
                color: palette.background.paper,
              },
            },
            arrow: {
              sx: {
                color: palette.text.primary,
              },
            },
          },
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
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: 32,
            height: 32,
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
            backgroundColor: alpha(palette.background.paper, 0.7),
            backdropFilter: `blur(20px)`,
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
      MuiFieldValueDisplay: {
        styleOverrides: {
          label: {
            fontWeight: 'normal',
            opacity: 0.75,
          },
        },
      },
      MuiFormWrapper: {
        defaultProps: {
          SubmitButtonProps: {
            color: 'primary',
          },
        },
      },
      MuiPermissionGuard: {
        defaultProps: {
          showFallbackComponent: false,
        },
      },
      MuiDropdownOption: {
        defaultProps: {
          sx: {
            fontWeight: 'normal',
          },
        },
      },
      MuiChip: {
        defaultProps: {
          sx: {
            [`&.MuiChip-filled.MuiChip-colorDefault`]: {
              bgcolor: alpha(palette.divider, 0.08),
            },
          },
        },
      },
    },
  });
};
