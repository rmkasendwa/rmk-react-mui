import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Grow,
  IconButton,
  Popper,
  Stack,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { omit } from 'lodash';
import { forwardRef, useEffect, useRef, useState } from 'react';

import {
  OnSelectSortOption,
  SelectedSortOption,
  SortDirection,
  SortableFields,
} from '../../interfaces/Sort';
import { BaseDataRow } from '../../interfaces/Table';
import ButtonPopup, { ButtonPopupProps } from '../ButtonPopup';
import SortIcon from '../Icons/SortIcon';
import DataDropdownField from '../InputFields/DataDropdownField';
import PaginatedDropdownOptionList from '../PaginatedDropdownOptionList';

export interface SortOperationFieldSelectorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SortOperationFieldSelectorClassKey =
  keyof SortOperationFieldSelectorClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSortOperationFieldSelector: SortOperationFieldSelectorProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSortOperationFieldSelector: keyof SortOperationFieldSelectorClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSortOperationFieldSelector?: {
      defaultProps?: ComponentsProps['MuiSortOperationFieldSelector'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSortOperationFieldSelector'];
      variants?: ComponentsVariants['MuiSortOperationFieldSelector'];
    };
  }
}

export interface SortOperationFieldSelectorProps<
  RecordRow extends BaseDataRow = any
> extends Partial<ButtonPopupProps> {
  sortableFields: SortableFields<RecordRow>;
  onSelectSortOption?: OnSelectSortOption<RecordRow>;
  title?: string;
  addFieldText?: string;
  sortLabel?: string;
  selectedSortParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

export function getSortOperationFieldSelectorUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiSortOperationFieldSelector', slot);
}

export const sortOperationFieldSelectorClasses: SortOperationFieldSelectorClasses =
  generateUtilityClasses('MuiSortOperationFieldSelector', ['root']);

const slots = {
  root: ['root'],
};

export const SortOperationFieldSelector = forwardRef<
  HTMLDivElement,
  SortOperationFieldSelectorProps
>(function SortOperationFieldSelector(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiSortOperationFieldSelector',
  });
  const {
    className,
    sortableFields,
    onSelectSortOption,
    addFieldText = 'Add another sort',
    footerContent,
    children,
    startIcon = <SortIcon />,
    sortLabel = 'Sort',
    selectedSortParams,
    onChangeSelectedSortParams,
    ...rest
  } = omit(props, 'title');

  let { title } = props;

  const classes = composeClasses(
    slots,
    getSortOperationFieldSelectorUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  title || (title = `${sortLabel} by`);

  const unselectedSortableFieldsAnchorRef = useRef<HTMLButtonElement | null>(
    null
  );
  const sortableFieldsRef = useRef(sortableFields);

  useEffect(() => {
    sortableFieldsRef.current = sortableFields;
  }, [onSelectSortOption, sortableFields]);

  const [openUnselectedSortableFields, setOpenUnselectedSortableFields] =
    useState(false);

  const unselectedSortableFields = (() => {
    const selectedSortParamIds = selectedSortParams.map(({ id }) => id);
    return sortableFields.filter(({ id }) => {
      return !selectedSortParamIds.includes(id);
    });
  })();

  const hasSearchFilters = selectedSortParams.length > 0;
  const variant = (() => {
    if (hasSearchFilters) {
      return 'contained';
    }
    return 'text';
  })();

  return (
    <ButtonPopup
      ref={ref as any}
      {...rest}
      className={clsx(classes.root)}
      title={
        <Grid
          container
          sx={{
            alignItems: 'center',
            py: 1,
            px: 2,
          }}
        >
          <Grid item xs>
            <Typography
              variant="body2"
              component="h2"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {title}
            </Typography>
          </Grid>
          {selectedSortParams.length > 0 ? (
            <Grid item>
              <Button
                color="inherit"
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeSelectedSortParams([]);
                }}
              >
                Clear
              </Button>
            </Grid>
          ) : null}
        </Grid>
      }
      bodyContent={(() => {
        if (selectedSortParams.length > 0) {
          return (
            <>
              {selectedSortParams.map(
                (
                  { id, label, type = 'string', sortLabels, sortDirection },
                  index
                ) => {
                  return (
                    <Grid
                      key={String(id)}
                      container
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Grid item xs>
                        <DataDropdownField
                          value={String(id)}
                          onChange={(event) => {
                            const value = event.target.value;
                            const fieldSelectedSortParam = sortableFields.find(
                              ({ id }) => id === value
                            );
                            if (fieldSelectedSortParam && index !== -1) {
                              const nextSortParams = [...selectedSortParams];
                              nextSortParams[index] = {
                                ...fieldSelectedSortParam,
                                sortDirection,
                              };
                              onChangeSelectedSortParams([...nextSortParams]);
                            }
                          }}
                          options={[
                            {
                              label,
                              value: String(id),
                            },
                            ...unselectedSortableFields.map(({ id, label }) => {
                              return {
                                label,
                                value: String(id),
                              };
                            }),
                          ]}
                          showClearButton={false}
                        />
                      </Grid>
                      <Grid item>
                        <Stack direction="row">
                          {(
                            [
                              {
                                sortDirection: 'ASC',
                              },
                              {
                                sortDirection: 'DESC',
                              },
                            ] as {
                              sortDirection: SortDirection;
                            }[]
                          ).map(({ sortDirection: baseSortDirection }) => {
                            return (
                              <Button
                                key={baseSortDirection}
                                color={
                                  sortDirection === baseSortDirection
                                    ? 'primary'
                                    : 'inherit'
                                }
                                onClick={() => {
                                  const selectedSortParam =
                                    selectedSortParams.find(
                                      ({ id: currentId }) => currentId === id
                                    );
                                  if (selectedSortParam) {
                                    selectedSortParam.sortDirection =
                                      baseSortDirection;
                                    onChangeSelectedSortParams([
                                      ...selectedSortParams,
                                    ]);
                                  }
                                }}
                                variant={
                                  sortDirection === baseSortDirection
                                    ? 'contained'
                                    : 'text'
                                }
                              >
                                {(() => {
                                  const sorts = (() => {
                                    if (sortLabels) {
                                      return [...sortLabels];
                                    }
                                    switch (type) {
                                      case 'number':
                                      case 'date':
                                        return [0, 9];
                                      case 'boolean':
                                        return ['T', 'F'];
                                      case 'string':
                                      default:
                                        return ['A', 'Z'];
                                    }
                                  })();

                                  const [a, b] =
                                    baseSortDirection === 'ASC'
                                      ? sorts
                                      : sorts.reverse();

                                  return (
                                    <>
                                      {a} <ArrowRightAltIcon /> {b}
                                    </>
                                  );
                                })()}
                              </Button>
                            );
                          })}
                        </Stack>
                      </Grid>
                      <Grid item>
                        <IconButton
                          onClick={() => {
                            const selectedSortParamIndex =
                              selectedSortParams.findIndex(
                                ({ id: currentId }) => currentId === id
                              );
                            if (selectedSortParamIndex !== -1) {
                              selectedSortParams.splice(
                                selectedSortParamIndex,
                                1
                              );
                              onChangeSelectedSortParams([
                                ...selectedSortParams,
                              ]);
                            }
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  );
                }
              )}
              {unselectedSortableFields.length > 0 ? (
                <>
                  <Button
                    startIcon={<AddIcon />}
                    endIcon={<ArrowDropDownIcon />}
                    ref={unselectedSortableFieldsAnchorRef}
                    color="inherit"
                    onClick={() => {
                      setOpenUnselectedSortableFields(true);
                    }}
                  >
                    {addFieldText}
                  </Button>
                  <Popper
                    open={openUnselectedSortableFields}
                    anchorEl={unselectedSortableFieldsAnchorRef.current}
                    transition
                    placement="bottom-start"
                    sx={{
                      zIndex: 10,
                    }}
                  >
                    {({ TransitionProps }) => {
                      return (
                        <Grow {...TransitionProps}>
                          <Box>
                            <ClickAwayListener
                              onClickAway={() => {
                                setOpenUnselectedSortableFields(false);
                              }}
                            >
                              <Box>
                                <PaginatedDropdownOptionList
                                  options={unselectedSortableFields.map(
                                    ({ id, label }) => {
                                      return {
                                        label,
                                        value: String(id),
                                      };
                                    }
                                  )}
                                  onChangeSelectedOptions={(
                                    selectedOptions
                                  ) => {
                                    const selectedSortParam =
                                      unselectedSortableFields.find(
                                        ({ id }) =>
                                          id === selectedOptions[0].value
                                      );
                                    if (selectedSortParam) {
                                      onChangeSelectedSortParams([
                                        ...selectedSortParams,
                                        {
                                          ...selectedSortParam,
                                          sortDirection:
                                            selectedSortParam.sortDirection ||
                                            'ASC',
                                        },
                                      ]);
                                      setOpenUnselectedSortableFields(false);
                                    }
                                  }}
                                />
                              </Box>
                            </ClickAwayListener>
                          </Box>
                        </Grow>
                      );
                    }}
                  </Popper>
                </>
              ) : null}
            </>
          );
        }
        return (
          <PaginatedDropdownOptionList
            options={unselectedSortableFields.map(({ id, label }) => {
              return {
                label,
                value: String(id),
              };
            })}
            onChangeSelectedOptions={(selectedOptions) => {
              const selectedSortParam = unselectedSortableFields.find(
                ({ id }) => id === selectedOptions[0].value
              );
              if (selectedSortParam) {
                onChangeSelectedSortParams([
                  ...selectedSortParams,
                  {
                    ...selectedSortParam,
                    sortDirection: selectedSortParam.sortDirection || 'ASC',
                  },
                ]);
              }
            }}
            sx={{
              border: 'none',
            }}
          />
        );
      })()}
      {...{ startIcon, footerContent, variant }}
      {...rest}
    >
      {children
        ? children
        : hasSearchFilters
        ? (() => {
            if (selectedSortParams.length === 1) {
              return `${sortLabel}ed by ${selectedSortParams[0].label}`;
            }
            return `${sortLabel}ed by ${selectedSortParams.length} fields`;
          })()
        : sortLabel}
    </ButtonPopup>
  );
});

export default SortOperationFieldSelector;
