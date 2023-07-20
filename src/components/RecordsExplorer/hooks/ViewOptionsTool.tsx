import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import {
  Box,
  Button,
  ButtonProps,
  ClickAwayListener,
  Grid,
  Grow,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useMemo, useRef, useState } from 'react';

import TimelineIcon from '../../Icons/TimelineIcon';
import ModalPopup from '../../ModalPopup';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../../PaginatedDropdownOptionList';
import { Tool } from '../../SearchSyncToolbar';

/******* View Options Tool ********************/

export const viewOptionTypes = ['Timeline', 'Grid', 'List'] as const;

export type ViewOptionType<ViewType extends string = string> =
  | (typeof viewOptionTypes)[number]
  | ViewType;

export interface ViewOption<ViewType extends string = string> {
  label: ViewOptionType<ViewType>;
  icon: ReactNode;
}

const defaultViewOptions: ViewOption[] = [
  { label: 'Timeline', icon: <TimelineIcon /> },
  { label: 'Grid', icon: <GridViewIcon /> },
  { label: 'List', icon: <ListIcon /> },
];

const DEFAULT_VIEW_OPTIONS_TYPES = defaultViewOptions.map(({ label }) => label);

export interface ViewOptionsToolOptions<ViewType extends string = string> {
  viewOptions?: ViewOption<ViewType>[];
  onChangeViewType?: (viewType: ViewOptionType<ViewType>) => void;
  viewType?: ViewOptionType<ViewType>;
  viewOptionTypes?: ViewOptionType<ViewType>[];
  expandedIfHasLessOptions?: boolean;
  SelectedViewOptionButtonProps?: Partial<ButtonProps>;
}

export const useViewOptionsTool = <ViewType extends string = string>({
  onChangeViewType,
  viewType = 'List',
  viewOptionTypes = DEFAULT_VIEW_OPTIONS_TYPES as any,
  expandedIfHasLessOptions = false,
  viewOptions = defaultViewOptions as any,
  SelectedViewOptionButtonProps = {},
  ...rest
}: ViewOptionsToolOptions<ViewType>) => {
  const {
    sx: SelectedViewOptionButtonPropsSx,
    ...SelectedViewOptionButtonPropsRest
  } = SelectedViewOptionButtonProps;

  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null);
  const viewOptionsRef = useRef(viewOptions);
  viewOptionsRef.current = viewOptions;

  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    return [
      ...new Set([
        ...viewOptionTypes,
        ...viewOptionsRef.current
          .filter(({ label }) => {
            return !DEFAULT_VIEW_OPTIONS_TYPES.includes(label);
          })
          .map(({ label }) => label),
      ]),
    ]
      .map((viewOptionType) => {
        return [...viewOptionsRef.current, ...defaultViewOptions].find(
          ({ label }) => viewOptionType === label
        )!;
      })
      .filter((viewOption) => {
        return viewOption;
      })
      .map(({ label, icon }) => {
        return {
          icon,
          label,
          value: label,
        } as DropdownOption;
      });
  }, [viewOptionTypes]);

  const {
    viewOption: { icon },
    selectedOptions,
  } = useMemo(() => {
    return {
      viewOption:
        [...viewOptionsRef.current, ...defaultViewOptions].find(({ label }) => {
          return label === viewType;
        }) || viewOptionsRef.current[0],
      selectedOptions: options.filter(({ value }) => {
        return value === viewType;
      }),
    };
  }, [options, viewType]);

  const handleClose = () => setOpen(false);

  if (options.length <= 1) {
    return null;
  }

  const expandOptions = expandedIfHasLessOptions && options.length <= 2;

  const tool: Tool = {
    ...rest,
    ...(() => {
      if (expandOptions) {
        return {
          element: (
            <Stack direction="row">
              {options.map(({ icon, label, value }) => {
                const viewTypeDisplay = value as string;
                return (
                  <Tooltip
                    key={viewTypeDisplay}
                    title={`View as ${viewTypeDisplay}`}
                    PopperProps={{
                      sx: {
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Button
                      color="inherit"
                      variant={
                        viewType === viewTypeDisplay ? 'contained' : 'text'
                      }
                      {...(() => {
                        if (viewType === viewTypeDisplay) {
                          return SelectedViewOptionButtonPropsRest;
                        }
                      })()}
                      onClick={() => {
                        onChangeViewType && onChangeViewType(value as any);
                      }}
                      sx={{
                        ...(() => {
                          if (viewType === viewTypeDisplay) {
                            return SelectedViewOptionButtonPropsSx;
                          }
                        })(),
                      }}
                    >
                      <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                        <Grid item sx={{ display: 'flex' }}>
                          {icon}
                        </Grid>
                        <Grid item xs>
                          <Typography variant="body2">{label}</Typography>
                        </Grid>
                      </Grid>
                    </Button>
                  </Tooltip>
                );
              })}
            </Stack>
          ),
          elementMaxWidth: 180,
          collapsedElement: (
            <Stack direction="row">
              {options.map(({ icon, value }) => {
                const viewTypeDisplay = value as string;
                return (
                  <Tooltip
                    key={viewTypeDisplay}
                    title={`View as ${viewTypeDisplay}`}
                    PopperProps={{
                      sx: {
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Button
                      color="inherit"
                      variant={
                        viewType === viewTypeDisplay ? 'contained' : 'text'
                      }
                      {...(() => {
                        if (viewType === viewTypeDisplay) {
                          return SelectedViewOptionButtonPropsRest;
                        }
                      })()}
                      onClick={() => {
                        onChangeViewType && onChangeViewType(value as any);
                      }}
                      sx={{
                        minWidth: 'auto !important',
                        width: 32,
                        ...(() => {
                          if (viewType === viewTypeDisplay) {
                            return SelectedViewOptionButtonPropsSx;
                          }
                        })(),
                      }}
                    >
                      {icon}
                    </Button>
                  </Tooltip>
                );
              })}
            </Stack>
          ),
          collapsedElementMaxWidth: 64,
        };
      }
      const optionsElement = (
        <PaginatedDropdownOptionList
          options={options}
          minWidth={
            anchorRef.current ? anchorRef.current.offsetWidth : undefined
          }
          onClose={handleClose}
          selectedOptions={selectedOptions}
          onChangeSelectedOptions={(selectableOptions) => {
            onChangeViewType?.(selectableOptions[0].value as any);
          }}
          searchable={options.length > 5}
          {...{
            ...(() => {
              if (isSmallScreenSize) {
                return {
                  optionHeight: 50,
                  maxHeight: window.innerHeight - 240,
                  sx: {
                    border: 'none',
                  },
                };
              }
            })(),
          }}
        />
      );
      return {
        color: 'inherit',
        ref: anchorRef,
        label: isSmallScreenSize ? 'View' : viewType,
        icon,
        endIcon: <ExpandMoreIcon />,
        type: 'button',
        onClick: () => {
          setOpen(true);
        },
        popupElement: (() => {
          if (isSmallScreenSize) {
            return (
              <ModalPopup
                {...{ open }}
                onClose={() => {
                  setOpen(false);
                }}
                CardProps={{
                  sx: {
                    maxHeight: 'none',
                  },
                }}
                CardBodyProps={{
                  sx: {
                    p: 0,
                  },
                }}
                disableEscapeKeyDown={false}
                disableAutoFocus={false}
                showHeaderToolbar={false}
                enableCloseOnBackdropClick
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {optionsElement}
              </ModalPopup>
            );
          }
          return (
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              transition
              placement="bottom-start"
              tabIndex={-1}
              sx={{
                zIndex: 9999,
              }}
            >
              {({ TransitionProps }) => {
                return (
                  <Grow {...TransitionProps}>
                    <Box tabIndex={-1}>
                      <ClickAwayListener onClickAway={handleClose}>
                        {optionsElement}
                      </ClickAwayListener>
                    </Box>
                  </Grow>
                );
              }}
            </Popper>
          );
        })(),
      };
    })(),
  };
  return tool;
};
