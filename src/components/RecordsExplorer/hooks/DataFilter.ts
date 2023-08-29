import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import { result } from 'lodash';
import { useCallback } from 'react';

import { BaseDataRow } from '../../Table';
import { ConditionGroup, DataFilterField, FilterOperator } from '../models';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDataFilter: DataFilterProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiDataFilter?: {
      defaultProps?: ComponentsProps['MuiDataFilter'];
      variants?: ComponentsVariants['MuiDataFilter'];
    };
  }
}
//#endregion

export interface DataFilterProps<RecordRow extends BaseDataRow = any> {
  data: RecordRow[];
  filterFields?: DataFilterField<RecordRow>[];
}

export const useDataFilter = <RecordRow extends BaseDataRow>(
  inProps: DataFilterProps<RecordRow>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiDataFilter' });
  const { data, filterFields } = props;

  const filter = useCallback(
    ({
      selectedConditionGroup,
    }: {
      selectedConditionGroup?: ConditionGroup<RecordRow>;
    }) => {
      if (filterFields) {
        if (
          selectedConditionGroup &&
          selectedConditionGroup.conditions.length > 0
        ) {
          const emptyfilterOperators: FilterOperator[] = [
            'is empty',
            'is not empty',
          ];
          return data.filter((row) => {
            return selectedConditionGroup.conditions
              .filter(({ operator, value }) => {
                return (
                  operator &&
                  (emptyfilterOperators.includes(operator) ||
                    (value != null && String(value).length > 0))
                );
              })
              [selectedConditionGroup.conjunction === 'and' ? 'every' : 'some'](
                ({ operator, value, fieldId }) => {
                  const filterValues: any[] = (() => {
                    const rawFieldValue = result(row, fieldId);
                    const filterField = filterFields!.find(
                      ({ id }) => id === fieldId
                    );
                    if (filterField?.getFilterValue) {
                      return [filterField.getFilterValue(row)];
                    }
                    return [rawFieldValue];
                  })();
                  return filterValues.some((fieldValue) => {
                    switch (operator) {
                      case 'is':
                        return Array.isArray(fieldValue)
                          ? fieldValue.some(
                              (fieldValueItem) =>
                                fieldValueItem === (value as any)
                            )
                          : fieldValue === (value as any);
                      case 'is not':
                        return Array.isArray(fieldValue)
                          ? fieldValue.some(
                              (fieldValueItem) =>
                                fieldValueItem !== (value as any)
                            )
                          : fieldValue !== (value as any);
                      case 'is any of':
                        return (
                          Array.isArray(value) &&
                          ((Array.isArray(fieldValue) &&
                            fieldValue.some((filterValue) =>
                              value.includes(filterValue as any)
                            )) ||
                            value.includes(fieldValue as any))
                        );
                      case 'is none of':
                        return (
                          Array.isArray(value) &&
                          ((Array.isArray(fieldValue) &&
                            fieldValue.some(
                              (fieldValueItem) =>
                                !value.includes(fieldValueItem as any)
                            )) ||
                            !value.includes(fieldValue as any))
                        );
                      case 'is empty':
                        return (
                          (Array.isArray(fieldValue) &&
                            fieldValue.length <= 0) ||
                          !fieldValue
                        );
                      case 'is not empty':
                        return (
                          (Array.isArray(fieldValue) &&
                            fieldValue.length > 0) ||
                          fieldValue
                        );
                      case 'contains':
                        return String(fieldValue)
                          .toLowerCase()
                          .match(String(value).toLowerCase());
                      case 'does not contain':
                        return !String(fieldValue)
                          .toLowerCase()
                          .match(String(value).toLowerCase());
                      case '=':
                        return fieldValue === value;
                      case '≠':
                        return fieldValue !== value;
                      case '<':
                        return value != null && fieldValue < value;
                      case '>':
                        return value != null && fieldValue > value;
                      case '≤':
                        return value != null && fieldValue <= value;
                      case '≥':
                        return value != null && fieldValue >= value;
                      default:
                        return false;
                    }
                  });
                }
              );
          });
        }
      }
      return data;
    },
    [data, filterFields]
  );

  return { filter };
};
