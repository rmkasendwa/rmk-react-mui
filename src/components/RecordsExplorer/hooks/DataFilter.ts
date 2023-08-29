import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import addWeeks from 'date-fns/addWeeks';
import addYears from 'date-fns/addYears';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import isSameDay from 'date-fns/isSameDay';
import max from 'date-fns/max';
import min from 'date-fns/min';
import { result } from 'lodash';
import { useCallback, useRef } from 'react';

import { BaseDataRow } from '../../Table';
import {
  Condition,
  ConditionGroup,
  ContentExistenceFilterOperator,
  DataFilterField,
  DateFilterOperator,
  DateFilterOperatorValue,
  contentExistenceFilterOperator,
} from '../models';

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

  const getDateInstanceFromFilterConditionRef = useRef(
    ({ value, numberOfDays, selectedDate }: Condition<RecordRow>) => {
      switch (value as DateFilterOperatorValue) {
        case 'today':
          return new Date();
        case 'tomorrow':
          return addDays(new Date(), -1);
        case 'yesterday':
          return addDays(new Date(), -1);
        case 'one week ago':
        case 'the past week':
          return addWeeks(new Date(), -1);
        case 'one week from now':
        case 'the next week':
          return addWeeks(new Date(), 1);
        case 'one month ago':
        case 'the past month':
          return addMonths(new Date(), -1);
        case 'one month from now':
        case 'the next month':
          return addMonths(new Date(), 1);
        case 'the past year':
          return addYears(new Date(), -1);
        case 'the next year':
          return addYears(new Date(), 1);
        case 'number of days ago':
        case 'the past number of days':
          return addDays(new Date(), -numberOfDays);
        case 'number of days from now':
        case 'the next number of days':
          return addDays(new Date(), numberOfDays);
        case 'exact date':
          return new Date(selectedDate);
      }
    }
  );

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
          return data.filter((row) => {
            return selectedConditionGroup.conditions
              .filter(({ operator, value, numberOfDays, selectedDate }) => {
                return (
                  operator &&
                  (contentExistenceFilterOperator.includes(
                    operator as ContentExistenceFilterOperator
                  ) ||
                    (() => {
                      switch (value as DateFilterOperatorValue) {
                        case 'number of days ago':
                        case 'the past number of days':
                        case 'number of days from now':
                        case 'the next number of days':
                          return Boolean(numberOfDays);
                        case 'exact date':
                          return Boolean(selectedDate);
                      }
                      return value != null && String(value).length > 0;
                    })())
                );
              })
              [selectedConditionGroup.conjunction === 'and' ? 'every' : 'some'](
                (condition) => {
                  const { fieldId, operator, value } = condition;
                  const filterField = filterFields.find(
                    ({ id }) => id === fieldId
                  );
                  const filterValues: any[] = (() => {
                    const rawFieldValue = result(row, fieldId);
                    if (filterField?.getFilterValue) {
                      return [filterField.getFilterValue(row)];
                    }
                    return [rawFieldValue];
                  })();
                  return filterValues.some((fieldValue) => {
                    if (filterField?.type === 'date') {
                      const conditionValueDate =
                        getDateInstanceFromFilterConditionRef.current(
                          condition
                        );
                      const valueDate = new Date(fieldValue);
                      if (
                        conditionValueDate &&
                        !isNaN(conditionValueDate.getTime()) &&
                        !isNaN(valueDate.getTime())
                      ) {
                        switch (operator as DateFilterOperator) {
                          case 'is':
                            return isSameDay(valueDate, conditionValueDate);
                          case 'is within':
                            const today = new Date();
                            const minDate = min([today, conditionValueDate]);
                            const maxDate = max([today, conditionValueDate]);
                            return (
                              isSameDay(valueDate, minDate) ||
                              (isAfter(valueDate, minDate) &&
                                isBefore(valueDate, maxDate)) ||
                              isSameDay(valueDate, maxDate)
                            );
                          case 'is before':
                            return isBefore(valueDate, conditionValueDate);
                          case 'is after':
                            return isAfter(valueDate, conditionValueDate);
                          case 'is on or before':
                            return (
                              isSameDay(valueDate, conditionValueDate) ||
                              isBefore(valueDate, conditionValueDate)
                            );
                          case 'is on or after':
                            return (
                              isSameDay(valueDate, conditionValueDate) ||
                              isAfter(valueDate, conditionValueDate)
                            );
                          case 'is not':
                            return !isSameDay(valueDate, conditionValueDate);
                        }
                      }
                      return false;
                    }
                    if (filterField?.type === 'number') {
                      switch (operator) {
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
                      }
                      return false;
                    }
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
