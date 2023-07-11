import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  tableCellClasses,
} from '@mui/material';
import { omit, result } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools/PopupTool';
import { PrimitiveDataType } from '../../../models/Utils';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../../InputFields/DataDropdownField';
import NumberInputField from '../../InputFields/NumberInputField';
import TextField from '../../InputFields/TextField';
import { DropdownOption } from '../../PaginatedDropdownOptionList';
import { BaseDataRow } from '../../Table';
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
} from '../models';

export const MULTI_SELECT_DROPDOWN_TYPE = 'enum';
export const DROPDOWN_FILTER_FIELD_TYPES: PrimitiveDataType[] = ['enum'];

export const DROPDOWN_OPERATORS: EnumFilterOperator[] = ['is', 'is not'];

export const MULTI_SELECT_DROPDOWN_OPERATORS = enumFilterOperators;

export interface FilterToolOptions<RecordRow extends BaseDataRow = any>
  extends Partial<PopupToolOptions> {
  data: RecordRow[];
  filterFields: DataFilterField<RecordRow>[];
  selectedConditionGroup?: ConditionGroup<RecordRow>;
  onChangeSelectedConditionGroup: (
    conditionGroup: ConditionGroup<RecordRow> | null
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
          const fieldValue = result(row, field.id) as any;
          if (
            fieldValue &&
            !options.find(({ value }) => {
              return value === fieldValue;
            })
          ) {
            options.push({
              label: getFieldOptionLabel
                ? getFieldOptionLabel(row)
                : fieldValue,
              searchableLabel: fieldValue,
              value: fieldValue,
            });
          }
        });
        dropdownField.options = options;
      }
      return field;
    });
  }, [data]);

  const hasSearchFilters = Boolean(
    selectedConditionGroup && selectedConditionGroup?.conditions.length > 0
  );

  const variant = (() => {
    if (hasSearchFilters) {
      return 'contained';
    }
    return 'text';
  })();

  return usePopupTool({
    icon: <FilterAltOutlinedIcon />,
    ...rest,
    label: (() => {
      if (hasSearchFilters && selectedConditionGroup) {
        const { label } =
          filterFields.find(
            ({ id }) => id === selectedConditionGroup.conditions[0].fieldId
          ) || {};
        if (selectedConditionGroup.conditions.length === 1 && label) {
          return `Filtered by ${label}`;
        }
        return `Filtered by ${selectedConditionGroup.conditions.length} fields`;
      }
      return 'Filter';
    })(),
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
        {selectedConditionGroup &&
        selectedConditionGroup.conditions.length > 0 ? (
          <Grid item>
            <Button
              color="inherit"
              onClick={(event) => {
                event.stopPropagation();
                onChangeSelectedConditionGroup(null);
              }}
            >
              Clear
            </Button>
          </Grid>
        ) : null}
      </Grid>
    ),
    bodyContent: (
      <Stack
        sx={{
          gap: 1,
        }}
      >
        <Table
          size="small"
          sx={{
            fontSize: 14,
            width: 'auto',
            mx: -2,
          }}
        >
          <TableBody>
            {(() => {
              if (
                selectedConditionGroup &&
                selectedConditionGroup.conditions.length > 0
              ) {
                const { conjunction } = selectedConditionGroup;
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
                      <TableRow
                        key={index}
                        sx={{
                          mb: 1,
                          alignItems: 'center',
                          [`.${tableCellClasses.root}`]: {
                            px: 1,
                            '&:first-of-type': {
                              pl: 2,
                            },
                            '&:last-of-type': {
                              pr: 2,
                            },
                          },
                        }}
                      >
                        {/* Where Clause */}
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                            }}
                          >
                            {(() => {
                              switch (index) {
                                case 0:
                                  return (
                                    <Typography variant="body2">
                                      Where
                                    </Typography>
                                  );
                                case 1:
                                  return (
                                    <DataDropdownField
                                      value={conjunction}
                                      options={filterConjunctions.map(
                                        (label) => {
                                          return {
                                            label,
                                            value: label,
                                          };
                                        }
                                      )}
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
                                      size="small"
                                      variant="text"
                                    />
                                  );
                                default:
                                  return (
                                    <Typography variant="body2">
                                      {conjunction}
                                    </Typography>
                                  );
                              }
                            })()}
                          </Box>
                        </TableCell>

                        {/* Filter field */}
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'end',
                            }}
                          >
                            <DataDropdownField
                              value={String(id)}
                              onChange={(event) => {
                                if (event.target.value) {
                                  nextSelectedConditionGroup.conditions[
                                    index
                                  ].fieldId = event.target.value as any;
                                  delete nextSelectedConditionGroup.conditions[
                                    index
                                  ].value;
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
                              size="small"
                              variant="text"
                            />
                          </Box>
                        </TableCell>

                        {/* Filter operator */}
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'end',
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
                                  delete nextSelectedConditionGroup.conditions[
                                    index
                                  ].value;
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
                              size="small"
                              variant="text"
                            />
                          </Box>
                        </TableCell>

                        {/* Filter Value */}
                        <TableCell>
                          {selectedOperator ? (
                            (() => {
                              if (
                                textFilterOperators.includes(
                                  selectedOperator as any
                                )
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
                                    size="small"
                                    fullWidth
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
                                    size="small"
                                    fullWidth
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
                                    size="small"
                                    fullWidth
                                    sx={{
                                      minWidth: 150,
                                    }}
                                  />
                                );
                              }
                            })()
                          ) : (
                            <>&nbsp;</>
                          )}
                        </TableCell>

                        {/* Clear Filter Condition */}
                        <TableCell
                          sx={{
                            width: 40,
                          }}
                        >
                          <Tooltip
                            title="Remove condition"
                            PopperProps={{
                              sx: {
                                pointerEvents: 'none',
                              },
                            }}
                          >
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
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  });
              }
            })()}
          </TableBody>
        </Table>
        <Grid container>
          <Grid item>
            <Button
              startIcon={<AddIcon />}
              color="inherit"
              onClick={() => {
                if (filterFields.length > 0) {
                  const nextSelectedConditionGroup =
                    selectedConditionGroup ||
                    ({
                      conjunction: 'and',
                      conditions: [],
                    } as NonNullable<typeof selectedConditionGroup>);

                  const { id } =
                    filterFields[
                      nextSelectedConditionGroup.conditions.length
                    ] || filterFields[0];

                  onChangeSelectedConditionGroup({
                    ...nextSelectedConditionGroup,
                    conditions: [
                      ...nextSelectedConditionGroup.conditions,
                      { fieldId: id },
                    ],
                  });
                }
              }}
            >
              Add condition
            </Button>
          </Grid>
        </Grid>
      </Stack>
    ),
    variant,
  });
};
