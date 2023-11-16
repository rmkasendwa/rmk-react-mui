import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  Box,
  Button,
  Checkbox,
  ComponentsProps,
  ComponentsVariants,
  Divider,
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
import { Fragment, useMemo } from 'react';

import { PopupToolProps, usePopupTool } from '../../../hooks/Tools/PopupTool';
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
  Condition,
  ConditionGroup,
  Conjunction,
  DataFilterField,
  DataMultiSelectDropdownFilterField,
  EnumFilterOperator,
  booleanFilterOperators,
  contentExistenceFilterOperators,
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
  extends Partial<PopupToolProps> {
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

  //#region Generating field options
  const filterFieldsWithOptions = useMemo(() => {
    return filterFields.map((baseField) => {
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
          const fieldValue = (() => {
            if (baseField.getFilterValue) {
              return baseField.getFilterValue(row);
            }
            return result(row, field.id) as any;
          })();
          if (fieldValue) {
            const fieldValueOptions = Array.isArray(fieldValue)
              ? fieldValue
              : [fieldValue];
            fieldValueOptions.forEach((fieldValueOption) => {
              if (
                fieldValueOption &&
                !options.find(({ value }) => {
                  return value === fieldValueOption;
                })
              ) {
                options.push({
                  label: getFieldOptionLabel
                    ? getFieldOptionLabel(row)
                    : fieldValueOption,
                  searchableLabel: fieldValueOption,
                  value: fieldValueOption,
                });
              }
            });
          }
        });
        dropdownField.options = options;
      }
      return field;
    });
  }, [data, filterFields]);
  //#endregion

  const getFieldLabelById = (fieldId: keyof RecordRow) => {
    return filterFields.find(({ id }) => id === fieldId)?.label ?? fieldId;
  };

  const getFormattedFilterValue = ({
    fieldId,
    value,
    operator,
  }: Condition<RecordRow>) => {
    const field = filterFieldsWithOptions.find(({ id }) => id === fieldId);
    if (field) {
      const { type } = field;
      switch (type) {
        case 'enum':
          if (enumFilterOperators.includes(operator as any)) {
            const { options } =
              field as DataMultiSelectDropdownFilterField<RecordRow>;
            if (Array.isArray(value)) {
              return (
                <Grid
                  container
                  sx={{
                    gap: 1,
                  }}
                >
                  {value.map((value, index) => {
                    return (
                      <Grid item key={index}>
                        {options?.find((option) => option.value === value)
                          ?.label ?? value}
                      </Grid>
                    );
                  })}
                </Grid>
              );
            }
            return (
              options?.find((option) => option.value === value)?.label ?? value
            );
          }
        case 'boolean':
          return <Checkbox checked={Boolean(value)} />;
        case 'number':
          return typeof value === 'number' ? addThousandCommas(value) : value;
      }
    }
    return value;
  };

  const tool = usePopupTool({
    icon: <FilterAltOutlinedIcon />,
    ...rest,
    label: (() => {
      if (selectedConditionGroup?.conditions?.length) {
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
                        case 'boolean':
                          return booleanFilterOperators;
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
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        lineHeight: '24px',
                                      }}
                                    >
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
                                ...contentExistenceFilterOperators,
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
                          if (
                            selectedOperator &&
                            !contentExistenceFilterOperators.includes(
                              selectedOperator as any
                            )
                          ) {
                            if (type === 'date') {
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
                            return (
                              <TableCell>
                                {selectedOperator ? (
                                  (() => {
                                    if (
                                      type === 'boolean' &&
                                      booleanFilterOperators.includes(
                                        selectedOperator as any
                                      )
                                    ) {
                                      return (
                                        <Checkbox
                                          checked={Boolean(condition.value)}
                                          onChange={(event) => {
                                            nextSelectedConditionGroup.conditions[
                                              index
                                            ].value = event.target.checked;
                                            onChangeSelectedConditionGroup(
                                              nextSelectedConditionGroup
                                            );
                                          }}
                                          size="medium"
                                        />
                                      );
                                    }
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
                                              ].value = event.target
                                                .value as any;
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
                                              ].value = event.target
                                                .value as any;
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
                                        searchableLabel,
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
                                        fieldProps.multiline = true;
                                        fieldProps.sx = {
                                          minWidth: 250,
                                        };
                                      }
                                      return (
                                        <DataDropdownField
                                          placeholder={
                                            typeof label === 'string'
                                              ? label
                                              : searchableLabel
                                          }
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
                                            ...fieldProps.sx,
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
                          }
                          return <TableCell />;
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
    title: selectedConditionGroup?.conditions?.length
      ? (() => {
          const { conjunction, conditions } = selectedConditionGroup;
          return (
            <Stack
              sx={{
                gap: 1,
              }}
            >
              <Typography variant="body2">Where</Typography>
              <Divider />
              {conditions.map((condition, index) => {
                const { fieldId, operator } = condition;
                const label = getFieldLabelById(fieldId);
                return (
                  <Fragment key={index}>
                    {index > 0 ? <Divider>{conjunction}</Divider> : null}
                    <Typography component="div" variant="body2">
                      <strong>{String(label)}</strong> {operator}{' '}
                      <strong>{getFormattedFilterValue(condition)}</strong>
                    </Typography>
                  </Fragment>
                );
              })}
            </Stack>
          );
        })()
      : 'Not Filtered',
    variant: selectedConditionGroup?.conditions?.length ? 'contained' : 'text',
  });

  return omit(tool, 'open', 'setOpen');
};
