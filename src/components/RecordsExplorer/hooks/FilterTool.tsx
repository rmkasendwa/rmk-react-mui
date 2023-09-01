import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  Box,
  Button,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  tableCellClasses,
  useThemeProps,
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
import Tooltip from '../../Tooltip';
import {
  ConditionGroup,
  Conjunction,
  DataFilterField,
  DataMultiSelectDropdownFilterField,
  EnumFilterOperator,
  contentExistenceFilterOperator,
  dateFilterOperators,
  enumFilterOperators,
  filterConjunctions,
  numericFilterOperators,
  textFilterOperators,
} from '../models';
import DateFilterConditionRowValue from './DateFilterConditionRowValue';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFilterTool: FilterToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiFilterTool?: {
      defaultProps?: ComponentsProps['MuiFilterTool'];
      variants?: ComponentsVariants['MuiFilterTool'];
    };
  }
}
//#endregion

export const MULTI_SELECT_DROPDOWN_TYPE = 'enum';
export const DROPDOWN_FILTER_FIELD_TYPES: PrimitiveDataType[] = ['enum'];

export const DROPDOWN_OPERATORS: EnumFilterOperator[] = ['is', 'is not'];

export const MULTI_SELECT_DROPDOWN_OPERATORS = enumFilterOperators;

export interface FilterToolProps<RecordRow extends BaseDataRow = any>
  extends Partial<PopupToolOptions> {
  data: RecordRow[];
  filterFields: DataFilterField<RecordRow>[];
  selectedConditionGroup?: ConditionGroup<RecordRow>;
  onChangeSelectedConditionGroup: (
    conditionGroup: ConditionGroup<RecordRow> | null
  ) => void;
}

export const useFilterTool = <RecordRow extends BaseDataRow>(
  inProps: FilterToolProps<RecordRow>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFilterTool' });
  const {
    data,
    filterFields,
    selectedConditionGroup,
    onChangeSelectedConditionGroup,
    ...rest
  } = props;

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

  const tool = usePopupTool({
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
                          return [
                            {
                              label: '=',
                              value: '=',
                              description: 'is equal to',
                            },
                            {
                              label: '≠',
                              value: '≠',
                              description: 'is not equal to',
                            },
                            {
                              label: '<',
                              value: '<',
                              description: 'is less than',
                            },
                            {
                              label: '>',
                              value: '>',
                              description: 'is greater than',
                            },
                            {
                              label: '≤',
                              value: '≤',
                              description: 'is less than or equal to',
                            },
                            {
                              label: '≥',
                              value: '≥',
                              description: 'is greater than or equal to',
                            },
                          ] as DropdownOption[];
                        case 'date':
                          return dateFilterOperators;
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
                                  Object.keys(
                                    nextSelectedConditionGroup.conditions[index]
                                  )
                                    .filter((key) => {
                                      return key !== 'fieldId';
                                    })
                                    .forEach((key) => {
                                      delete nextSelectedConditionGroup
                                        .conditions[index][key];
                                    });
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
                              ].map((option) => {
                                if (typeof option === 'string') {
                                  return {
                                    label: option,
                                    value: option,
                                  };
                                }
                                return option;
                              })}
                              showClearButton={false}
                              size="small"
                              variant="text"
                            />
                          </Box>
                        </TableCell>

                        {/* Filter Value */}
                        {(() => {
                          if (type === 'date') {
                            if (selectedOperator) {
                              return (
                                <DateFilterConditionRowValue
                                  {...{
                                    condition,
                                    selectedConditionGroup,
                                    onChangeSelectedConditionGroup,
                                  }}
                                />
                              );
                            }
                            return null;
                          }
                          return (
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
                                          if (event.target.value != null) {
                                            nextSelectedConditionGroup.conditions[
                                              index
                                            ].value = event.target.value as any;
                                          } else {
                                            delete nextSelectedConditionGroup
                                              .conditions[index].value;
                                          }
                                          onChangeSelectedConditionGroup(
                                            nextSelectedConditionGroup
                                          );
                                        }}
                                        size="small"
                                        fullWidth
                                        sx={{
                                          width: 115,
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
                                          if (event.target.value != null) {
                                            nextSelectedConditionGroup.conditions[
                                              index
                                            ].value = event.target.value as any;
                                          } else {
                                            delete nextSelectedConditionGroup
                                              .conditions[index].value;
                                          }
                                          onChangeSelectedConditionGroup(
                                            nextSelectedConditionGroup
                                          );
                                        }}
                                        size="small"
                                        fullWidth
                                        sx={{
                                          width: 115,
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
                                      fieldProps.optionVariant = 'check';
                                      fieldProps.SelectProps = {
                                        multiple: true,
                                      };
                                    }
                                    return (
                                      <DataDropdownField
                                        placeholder={label}
                                        value={condition.value as any}
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
                          );
                        })()}

                        {/* Clear Filter Condition */}
                        <TableCell
                          sx={{
                            width: 40,
                          }}
                        >
                          <Tooltip title="Remove condition" disableInteractive>
                            <IconButton
                              sx={{
                                p: 0.5,
                              }}
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

  return omit(tool, 'open', 'setOpen');
};
