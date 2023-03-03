import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import { omit } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { PopupToolOptions, usePopupTool } from '../../hooks/Tools';
import { BaseDataRow } from '../../interfaces/Table';
import { PrimitiveDataType } from '../../interfaces/Utils';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../InputFields/DataDropdownField';
import NumberInputField from '../InputFields/NumberInputField';
import TextField from '../InputFields/TextField';
import { DropdownOption } from '../PaginatedDropdownOptionList';
import {
  ConditionGroup,
  Conjunction,
  DataFilterField,
  DataMultiSelectDropdownFilterField,
  EnumFilterOperator,
  contentExistenceFilterOperator,
  enumFilterOperators,
  filterConjunctions,
  numericFilterOperators,
  textFilterOperators,
} from './models';

export const MULTI_SELECT_DROPDOWN_TYPE = 'enum';
export const DROPDOWN_FILTER_FIELD_TYPES: PrimitiveDataType[] = ['enum'];

export const DROPDOWN_OPERATORS: EnumFilterOperator[] = ['is', 'is not'];

export const MULTI_SELECT_DROPDOWN_OPERATORS = enumFilterOperators;

export interface FilterToolOptions<RecordRow extends BaseDataRow = any>
  extends Partial<PopupToolOptions> {
  data: RecordRow[];
  filterFields: DataFilterField<RecordRow>[];
  selectedConditionGroup: ConditionGroup<RecordRow>;
  onChangeSelectedConditionGroup: (
    conditionGroup: ConditionGroup<RecordRow>
  ) => void;
}

export const useFilterTool = <RecordRow extends BaseDataRow>({
  data,
  filterFields,
  selectedConditionGroup,
  onChangeSelectedConditionGroup,
  ...rest
}: FilterToolOptions<RecordRow>) => {
  const filterFieldsRef = useRef(filterFields);
  useEffect(() => {
    filterFieldsRef.current = filterFields;
  }, [filterFields]);

  const baseConditionGroup = useMemo(() => {
    return {
      conjunction: 'and',
      conditions: [],
    } as ConditionGroup<RecordRow>;
  }, []);

  // Generating field options
  const filterFieldsWithOptions = useMemo(() => {
    return filterFieldsRef.current.map((baseField) => {
      const field = { ...baseField };
      const { type = 'string' } = field;
      const dropdownField =
        field as DataMultiSelectDropdownFilterField<RecordRow>;
      if (
        DROPDOWN_FILTER_FIELD_TYPES.includes(type) &&
        !dropdownField.options
      ) {
        const { getFieldOptionLabel } = dropdownField;
        const options: DropdownOption[] = [];
        data.forEach((row) => {
          if (
            (row as any)[field.id] &&
            !options.find(({ value }) => {
              return value === (row as any)[field.id];
            })
          ) {
            options.push({
              label: getFieldOptionLabel
                ? getFieldOptionLabel(row)
                : (row as any)[field.id],
              searchableLabel: (row as any)[field.id],
              value: (row as any)[field.id],
            });
          }
        });
        dropdownField.options = options;
      }
      return field;
    });
  }, [data]);

  const hasSearchFilters = selectedConditionGroup.conditions.length > 0;

  const variant = (() => {
    if (hasSearchFilters) {
      return 'contained';
    }
    return 'text';
  })();

  return usePopupTool({
    icon: <FilterAltOutlinedIcon />,
    ...rest,
    label: hasSearchFilters
      ? (() => {
          const { label } =
            filterFields.find(
              ({ id }) => id === selectedConditionGroup.conditions[0].fieldId
            ) || {};
          if (selectedConditionGroup.conditions.length === 1 && label) {
            return `Filtered by ${label}`;
          }
          return `Filtered by ${selectedConditionGroup.conditions.length} fields`;
        })()
      : 'Filter',
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
            Filter
          </Typography>
        </Grid>
        {selectedConditionGroup.conditions.length > 0 ? (
          <Grid item>
            <Button
              color="inherit"
              onClick={(event) => {
                event.stopPropagation();
                onChangeSelectedConditionGroup({ ...baseConditionGroup });
              }}
            >
              Clear
            </Button>
          </Grid>
        ) : null}
      </Grid>
    ),
    bodyContent: (
      <>
        {(() => {
          if (selectedConditionGroup.conditions.length > 0) {
            const { conjunction } = baseConditionGroup;

            return selectedConditionGroup.conditions
              .map((condition) => {
                const { fieldId } = condition;
                const baseFilter = filterFieldsWithOptions.find(
                  ({ id }) => fieldId === id
                )!;
                return [baseFilter, condition] as [
                  typeof baseFilter,
                  typeof condition
                ];
              })
              .filter(([field]) => field != null)
              .map(([field, condition], index) => {
                const { id, label, type = 'text' } = field;
                const operatorOptions = (() => {
                  switch (type) {
                    case 'enum':
                      return MULTI_SELECT_DROPDOWN_OPERATORS;
                    case 'number':
                    case 'date':
                      return numericFilterOperators;
                  }
                  return textFilterOperators;
                })();
                const { operator: selectedOperator } = condition;

                const nextSelectedConditionGroup = JSON.parse(
                  JSON.stringify(selectedConditionGroup)
                ) as typeof selectedConditionGroup;

                return (
                  <Grid
                    key={index}
                    container
                    spacing={1}
                    sx={{ mb: 1, alignItems: 'center' }}
                  >
                    {/* Where Clause */}
                    <Grid
                      item
                      sx={{
                        width: 90,
                      }}
                    >
                      {(() => {
                        switch (index) {
                          case 0:
                            return (
                              <Typography
                                variant="body2"
                                sx={{
                                  pl: 2,
                                }}
                              >
                                Where
                              </Typography>
                            );
                          case 1:
                            return (
                              <DataDropdownField
                                value={conjunction}
                                options={filterConjunctions.map((label) => {
                                  return {
                                    label,
                                    value: label,
                                  };
                                })}
                                onChange={(event) => {
                                  if (event.target.value) {
                                    onChangeSelectedConditionGroup({
                                      ...selectedConditionGroup,
                                      conjunction: event.target
                                        .value as Conjunction,
                                    });
                                  }
                                }}
                                showClearButton={false}
                              />
                            );
                          default:
                            return (
                              <Typography
                                variant="body2"
                                sx={{
                                  pl: 2,
                                }}
                              >
                                {conjunction}
                              </Typography>
                            );
                        }
                      })()}
                    </Grid>

                    {/* Filter field */}
                    <Grid
                      item
                      sx={{
                        width: 140,
                      }}
                    >
                      <DataDropdownField
                        value={String(id)}
                        onChange={(event) => {
                          if (event.target.value) {
                            nextSelectedConditionGroup.conditions[
                              index
                            ].fieldId = event.target.value as any;
                            delete nextSelectedConditionGroup.conditions[index]
                              .value;
                            onChangeSelectedConditionGroup(
                              nextSelectedConditionGroup
                            );
                          }
                        }}
                        selectedOption={{
                          label,
                          value: String(id),
                        }}
                        options={filterFields.map(({ id, label }) => {
                          return {
                            label,
                            value: String(id),
                          };
                        })}
                        showClearButton={false}
                      />
                    </Grid>

                    {/* Filter operator */}
                    <Grid
                      item
                      sx={{
                        width: 140,
                      }}
                    >
                      <DataDropdownField
                        placeholder="Select an operator"
                        value={selectedOperator}
                        onChange={(event) => {
                          if (event.target.value) {
                            nextSelectedConditionGroup.conditions[
                              index
                            ].operator = event.target.value as any;
                            delete nextSelectedConditionGroup.conditions[index]
                              .value;
                            onChangeSelectedConditionGroup(
                              nextSelectedConditionGroup
                            );
                          }
                        }}
                        options={[
                          ...operatorOptions,
                          ...contentExistenceFilterOperator,
                        ].map((label) => {
                          return {
                            label,
                            value: label,
                          };
                        })}
                        showClearButton={false}
                      />
                    </Grid>

                    {/* Filter Value */}
                    <Grid
                      item
                      sx={{
                        width: 140,
                      }}
                    >
                      {(() => {
                        if (
                          textFilterOperators.includes(selectedOperator as any)
                        ) {
                          return (
                            <TextField
                              placeholder="Enter a value"
                              value={condition.value as any}
                              onChange={(event) => {
                                if (event.target.value) {
                                  nextSelectedConditionGroup.conditions[
                                    index
                                  ].value = event.target.value as any;
                                  onChangeSelectedConditionGroup(
                                    nextSelectedConditionGroup
                                  );
                                }
                              }}
                            />
                          );
                        } else if (
                          numericFilterOperators.includes(
                            selectedOperator as any
                          )
                        ) {
                          return (
                            <NumberInputField
                              placeholder="Enter a value"
                              value={condition.value as any}
                              onChange={(event) => {
                                if (event.target.value) {
                                  nextSelectedConditionGroup.conditions[
                                    index
                                  ].value = event.target.value as any;
                                  onChangeSelectedConditionGroup(
                                    nextSelectedConditionGroup
                                  );
                                }
                              }}
                            />
                          );
                        } else if (
                          MULTI_SELECT_DROPDOWN_OPERATORS.includes(
                            selectedOperator as any
                          )
                        ) {
                          const {
                            label,
                            type = MULTI_SELECT_DROPDOWN_TYPE,
                            ...rest
                          } = field;
                          const fieldProps: Partial<DataDropdownFieldProps> =
                            {};
                          if (
                            type === MULTI_SELECT_DROPDOWN_TYPE &&
                            !DROPDOWN_OPERATORS.includes(
                              selectedOperator as any
                            )
                          ) {
                            fieldProps.SelectProps = {
                              multiple: true,
                            };
                          }
                          return (
                            <DataDropdownField
                              placeholder={label}
                              value={condition.value as any}
                              optionVariant="check"
                              sortOptions
                              SelectedOptionPillProps={{
                                sx: {
                                  bgcolor: 'transparent',
                                  px: 0,
                                  mr: 1,
                                },
                              }}
                              {...fieldProps}
                              {...omit(
                                rest,
                                'getFilterValue',
                                'title',
                                'getFieldOptionLabel',
                                'id'
                              )}
                              onChange={(event) => {
                                nextSelectedConditionGroup.conditions[
                                  index
                                ].value = event.target.value as any;
                                onChangeSelectedConditionGroup(
                                  nextSelectedConditionGroup
                                );
                              }}
                            />
                          );
                        }
                      })()}
                    </Grid>

                    {/* Clear Filter Condition */}
                    <Grid item>
                      <IconButton
                        onClick={() => {
                          const selectedFilterParamIndex =
                            nextSelectedConditionGroup.conditions.findIndex(
                              ({ fieldId }) => fieldId === id
                            );
                          if (selectedFilterParamIndex !== -1) {
                            nextSelectedConditionGroup.conditions.splice(
                              selectedFilterParamIndex,
                              1
                            );
                            onChangeSelectedConditionGroup(
                              nextSelectedConditionGroup
                            );
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              });
          }
        })()}
        <Grid container>
          <Grid item>
            <Button
              startIcon={<AddIcon />}
              color="inherit"
              onClick={() => {
                if (filterFields.length > 0) {
                  const { id } =
                    filterFields[selectedConditionGroup.conditions.length] ||
                    filterFields[0];
                  onChangeSelectedConditionGroup({
                    ...selectedConditionGroup,
                    conditions: [
                      ...selectedConditionGroup.conditions,
                      { fieldId: id, operator: 'is', value: '' },
                    ],
                  });
                }
              }}
            >
              Add condition
            </Button>
          </Grid>
        </Grid>
      </>
    ),
    variant,
  });
};
