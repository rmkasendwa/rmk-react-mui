import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import {
  Box,
  Button,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Grow,
  Popper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { ButtonProps } from '@mui/material/Button';
import clsx from 'clsx';
import { ReactNode, forwardRef, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../PaginatedDropdownOptionList';

export interface ViewOptionsButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ViewOptionsButtonClassKey = keyof ViewOptionsButtonClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiViewOptionsButton: ViewOptionsButtonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiViewOptionsButton: keyof ViewOptionsButtonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiViewOptionsButton?: {
      defaultProps?: ComponentsProps['MuiViewOptionsButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiViewOptionsButton'];
      variants?: ComponentsVariants['MuiViewOptionsButton'];
    };
  }
}

export const viewOptionTypes = ['Timeline', 'Grid', 'List'] as const;

export type ViewOptionType = typeof viewOptionTypes[number];

export interface ViewOption {
  label: ViewOptionType;
  icon: ReactNode;
}

const viewOptions: ViewOption[] = [
  { label: 'Timeline', icon: <ViewTimelineIcon /> },
  { label: 'Grid', icon: <GridViewIcon /> },
  { label: 'List', icon: <ListIcon /> },
];

const DEFAULT_VIEW_OPTIONS_TYPES = viewOptions.map(({ label }) => label);

export interface ViewOptionsButtonProps extends ButtonProps {
  onChangeViewType?: (viewType: ViewOptionType) => void;
  viewType?: ViewOptionType;
  viewOptionTypes?: ViewOptionType[];
  expandedIfHasLessOptions?: boolean;
}

export function getViewOptionsButtonUtilityClass(slot: string): string {
  return generateUtilityClass('MuiViewOptionsButton', slot);
}

export const viewOptionsButtonClasses: ViewOptionsButtonClasses =
  generateUtilityClasses('MuiViewOptionsButton', ['root']);

const slots = {
  root: ['root'],
};

export const ViewOptionsButton = forwardRef<
  HTMLButtonElement,
  ViewOptionsButtonProps
>(function ViewOptionsButton(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiViewOptionsButton' });
  const {
    className,
    onChangeViewType,
    viewType = 'List',
    viewOptionTypes = DEFAULT_VIEW_OPTIONS_TYPES,
    expandedIfHasLessOptions = false,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getViewOptionsButtonUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { palette } = useTheme();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    return viewOptionTypes
      .map((viewOptionType) => {
        return viewOptions.find(({ label }) => viewOptionType === label)!;
      })
      .map(({ label, icon }) => {
        return {
          label: (
            <Grid container spacing={1} sx={{ alignItems: 'center' }}>
              <Grid item sx={{ display: 'flex' }}>
                {icon}
              </Grid>
              <Grid item xs>
                <Typography variant="body2">{label}</Typography>
              </Grid>
            </Grid>
          ),
          value: label,
        } as DropdownOption;
      });
  }, [viewOptionTypes]);

  const {
    viewOption: { icon },
    selectedOptions,
  } = useMemo(() => {
    return {
      viewOption: viewOptions.find(({ label }) => {
        return label === viewType;
      })!,
      selectedOptions: options.filter(({ value }) => {
        return value === viewType;
      }),
    };
  }, [options, viewType]);

  const handleClose = () => setOpen(false);

  if (options.length <= 1) {
    return null;
  }

  if (expandedIfHasLessOptions && options.length <= 2) {
    return (
      <Stack direction="row">
        {options.map(({ label, value }) => {
          const viewTypeDisplay = value as string;
          return (
            <Tooltip key={viewTypeDisplay} title={`View as ${viewTypeDisplay}`}>
              <Button
                color="inherit"
                variant="contained"
                onClick={() => {
                  onChangeViewType && onChangeViewType(value as any);
                }}
                sx={{
                  '&,&:hover': {
                    ...(() => {
                      if (viewType === viewTypeDisplay) {
                        return {
                          color: palette.background.paper,
                          bgcolor: alpha(palette.text.primary, 0.5),
                        };
                      }
                      return {
                        color: palette.text.primary,
                        bgcolor: `transparent`,
                      };
                    })(),
                  },
                }}
              >
                {label}
              </Button>
            </Tooltip>
          );
        })}
      </Stack>
    );
  }

  return (
    <>
      <Tooltip
        title="Layout and view options"
        PopperProps={{
          sx: {
            pointerEvents: 'none',
          },
        }}
      >
        <Button
          ref={mergeRefs([anchorRef, ref])}
          {...rest}
          className={clsx(classes.root)}
          color="inherit"
          startIcon={icon}
          endIcon={<ExpandMoreIcon />}
          onClick={() => setOpen(true)}
          sx={{ lineHeight: 1 }}
        >
          {viewType}
        </Button>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
        ref={(element) => {
          if (element) {
            element.style.zIndex = '1400';
          }
        }}
        tabIndex={-1}
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box tabIndex={-1}>
                <ClickAwayListener onClickAway={handleClose}>
                  <PaginatedDropdownOptionList
                    options={options}
                    minWidth={
                      anchorRef.current
                        ? anchorRef.current.offsetWidth
                        : undefined
                    }
                    onClose={handleClose}
                    selectedOptions={selectedOptions}
                    onSelectOption={({ value }) => {
                      onChangeViewType && onChangeViewType(value as any);
                    }}
                  />
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
});

export default ViewOptionsButton;
