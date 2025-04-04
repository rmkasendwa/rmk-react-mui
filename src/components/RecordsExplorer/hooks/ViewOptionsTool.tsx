import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import {
  Box,
  Button,
  ButtonProps,
  ClickAwayListener,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Grow,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { FC, ReactNode, RefObject, useMemo, useRef, useState } from 'react';

import TimelineIcon from '../../Icons/TimelineIcon';
import ModalPopup from '../../ModalPopup';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../../PaginatedDropdownOptionList';
import { Tool } from '../../SearchSyncToolbar';
import Tooltip from '../../Tooltip';
import { ViewOptionType } from '../models';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiViewOptionsTool: ViewOptionsToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiViewOptionsTool?: {
      defaultProps?: ComponentsProps['MuiViewOptionsTool'];
      variants?: ComponentsVariants['MuiViewOptionsTool'];
    };
  }
}
//#endregion

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

//#region View Options Tool Popover
export interface ViewOptionsToolPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  options: DropdownOption[];
  selectedOptions: DropdownOption[];
  onChangeViewType?: (viewType: ViewOptionType) => void;
  togglePopupFunctionRef: RefObject<((open: boolean) => void) | undefined>;
}

export const ViewOptionsToolPopover: FC<ViewOptionsToolPopoverProps> = ({
  anchorRef,
  options,
  selectedOptions,
  onChangeViewType,
  togglePopupFunctionRef,
}) => {
  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  togglePopupFunctionRef.current = (open) => {
    setOpen(open);
  };

  const optionsElement = (
    <PaginatedDropdownOptionList
      options={options}
      minWidth={anchorRef.current ? anchorRef.current.offsetWidth : undefined}
      onClose={() => {
        setOpen(false);
      }}
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
              <ClickAwayListener
                onClickAway={() => {
                  setOpen(false);
                }}
              >
                {optionsElement}
              </ClickAwayListener>
            </Box>
          </Grow>
        );
      }}
    </Popper>
  );
};
//#endregion

//#region View Options Tool
export interface ViewOptionsToolProps<ViewType extends string = string>
  extends Pick<ViewOptionsToolPopoverProps, 'onChangeViewType'> {
  viewOptions?: ViewOption<ViewType>[];
  viewType?: ViewOptionType<ViewType>;
  viewOptionTypes?: ViewOptionType<ViewType>[];
  expandedIfHasLessOptions?: boolean;
  SelectedViewOptionButtonProps?: Partial<ButtonProps>;
}

export const useViewOptionsTool = <ViewType extends string = string>(
  inProps: ViewOptionsToolProps<ViewType>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiViewOptionsTool' });
  const {
    onChangeViewType,
    viewType = 'List',
    viewOptionTypes = DEFAULT_VIEW_OPTIONS_TYPES as any,
    expandedIfHasLessOptions = false,
    viewOptions = defaultViewOptions,
    SelectedViewOptionButtonProps = {},
    ...rest
  } = props;
  const {
    sx: SelectedViewOptionButtonPropsSx,
    ...SelectedViewOptionButtonPropsRest
  } = SelectedViewOptionButtonProps;

  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  //#region Refs
  const anchorRef = useRef<HTMLButtonElement>(null);
  const viewOptionsRef = useRef(viewOptions);
  viewOptionsRef.current = viewOptions;
  const togglePopupFunctionRef = useRef<(open: boolean) => void>(undefined);
  //#endregion

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

  if (options.length <= 1) {
    return null;
  }

  const expandOptions = expandedIfHasLessOptions && options.length <= 2;

  return {
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
                    disableInteractive
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
                        <Grid
                          item
                          xs
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography variant="body2" noWrap>
                            {label}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Button>
                  </Tooltip>
                );
              })}
            </Stack>
          ),
          elementMaxWidth: 170,
          collapsedElement: (
            <Stack direction="row">
              {options.map(({ icon, value }) => {
                const viewTypeDisplay = value as string;
                return (
                  <Tooltip
                    key={viewTypeDisplay}
                    title={`View as ${viewTypeDisplay}`}
                    disableInteractive
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
      return {
        color: 'inherit',
        ref: anchorRef,
        label: isSmallScreenSize ? 'View' : viewType,
        icon,
        endIcon: <ExpandMoreIcon />,
        type: 'button',
        onClick: () => {
          togglePopupFunctionRef.current?.(true);
        },
        popupElement: (
          <ViewOptionsToolPopover
            {...{
              anchorRef,
              options,
              selectedOptions,
              onChangeViewType,
              togglePopupFunctionRef,
            }}
          />
        ),
      };
    })(),
  } as Tool;
};
//#endregion
