import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  ClickAwayListener,
  Grid,
  Grow,
  IconButton,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools';
import {
  OnSelectSortOption,
  SelectedSortOption,
  SortDirection,
  SortableFields,
} from '../../../interfaces/Sort';
import { BaseDataRow } from '../../../interfaces/Table';
import SortIcon from '../../Icons/SortIcon';
import DataDropdownField from '../../InputFields/DataDropdownField';
import PaginatedDropdownOptionList from '../../PaginatedDropdownOptionList';

export interface SortOperationFieldSelectorToolOptions<
  RecordRow extends BaseDataRow = any
> extends Partial<PopupToolOptions> {
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

export const useSortOperationFieldSelectorTool = <
  RecordRow extends BaseDataRow
>({
  sortableFields,
  onSelectSortOption,
  addFieldText = 'Add another sort',
  footerContent,
  title,
  icon = <SortIcon />,
  sortLabel = 'Sort',
  selectedSortParams,
  onChangeSelectedSortParams,
  ...rest
}: SortOperationFieldSelectorToolOptions<RecordRow>) => {
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

  const hasSortParams = selectedSortParams.length > 0;
  const variant = (() => {
    if (hasSortParams) {
      return 'contained';
    }
    return 'text';
  })();

  return usePopupTool({
    ...rest,
    label: sortLabel
      ? sortLabel
      : hasSortParams
      ? (() => {
          if (selectedSortParams.length === 1) {
            return `${sortLabel}ed by ${selectedSortParams[0].label}`;
          }
          return `${sortLabel}ed by ${selectedSortParams.length} fields`;
        })()
      : sortLabel,
    popupCardTitle: (
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
    ),
    bodyContent: (() => {
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
                            onChangeSelectedSortParams([...selectedSortParams]);
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
                    zIndex: 9999,
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
                                searchable={unselectedSortableFields.length > 5}
                                options={unselectedSortableFields.map(
                                  ({ id, label }) => {
                                    return {
                                      label,
                                      value: String(id),
                                    };
                                  }
                                )}
                                onChangeSelectedOptions={(selectedOptions) => {
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
          searchable={unselectedSortableFields.length > 5}
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
    })(),
    icon,
    footerContent,
    variant,
  });
};
