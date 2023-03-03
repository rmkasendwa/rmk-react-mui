import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import {
  Box,
  Button,
  ClickAwayListener,
  Grid,
  Grow,
  Popper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { ReactNode, useMemo, useRef, useState } from 'react';

import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../../PaginatedDropdownOptionList';
import { Tool } from '../../SearchSyncToolbar';

/******* View Options Tool ********************/

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

export interface ViewOptionsToolOptions {
  onChangeViewType?: (viewType: ViewOptionType) => void;
  viewType?: ViewOptionType;
  viewOptionTypes?: ViewOptionType[];
  expandedIfHasLessOptions?: boolean;
}

export const useViewOptionsTool = ({
  onChangeViewType,
  viewType = 'List',
  viewOptionTypes = DEFAULT_VIEW_OPTIONS_TYPES,
  expandedIfHasLessOptions = false,
  ...rest
}: ViewOptionsToolOptions) => {
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

  const expandOptions = expandedIfHasLessOptions && options.length <= 2;

  const tool: Tool = {
    ...rest,
    ...(() => {
      if (expandOptions) {
        return {
          element: (
            <Stack direction="row">
              {options.map(({ label, value }) => {
                const viewTypeDisplay = value as string;
                return (
                  <Tooltip
                    key={viewTypeDisplay}
                    title={`View as ${viewTypeDisplay}`}
                  >
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
          ),
        };
      }
      return {
        color: 'inherit',
        ref: anchorRef,
        label: (() => {
          if (!expandOptions) {
            return (
              <>
                {viewType}
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
                                onChangeViewType &&
                                  onChangeViewType(value as any);
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
          }
        })(),
        icon,
        endIcon: <ExpandMoreIcon />,
        type: 'button',
        onClick: () => {
          setOpen(true);
        },
      };
    })(),
  };
  return tool;
};
