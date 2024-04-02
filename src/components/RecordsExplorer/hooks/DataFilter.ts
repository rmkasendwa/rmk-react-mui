import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
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
import { useMemo, useRef } from 'react';

import { BaseDataRow } from '../../Table';
import {
  Condition,
  ConditionGroup,
  ContentExistenceFilterOperator,
  DataFilterField,
  DateFilterOperator,
  DateFilterOperatorValue,
  FilterBySearchTerm,
  SearchableProperty,
  contentExistenceFilterOperators,
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
  /**
   * Data to be filtered.
   */
  data: RecordRow[];

  /**
   * Fields to be used for filtering.
   */
  filterFields?: DataFilterField<RecordRow>[];

  /**
   * Search term to be used for filtering.
   */
  searchTerm?: string;

  /**
   * Fields to be used for searching.
   */
  searchableFields?: SearchableProperty<RecordRow>[];

  /**
   * Function to be called when user searches.
   */
  filterBySearchTerm?: FilterBySearchTerm<RecordRow>;

  /**
   * Function to be called when filtering data.
   *
   * @param data The input date to be filtered.
   * @returns The filtered data.
   */
  filter?: (data: RecordRow[]) => RecordRow[];

  /**
   * Key to control revalidation of filter.
   */
  filterRevalidationKey?: string;

  /**
   * Condition group to be used for filtering.
   */
  selectedConditionGroup?: ConditionGroup<RecordRow>;
}

export const useDataFilter = <RecordRow extends BaseDataRow>(
  inProps: DataFilterProps<RecordRow>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiDataFilter' });
  const {
    data,
    filterFields,
    searchTerm,
    searchableFields,
    filterBySearchTerm,
    filter: filterProp,
    filterRevalidationKey,
    selectedConditionGroup,
  } = props;

  //#region Refs
  const filterBySearchTermRef = useRef(filterBySearchTerm);
  filterBySearchTermRef.current = filterBySearchTerm;
  const filterFieldsRef = useRef(filterFields);
  filterFieldsRef.current = filterFields;
  const searchableFieldsRef = useRef(searchableFields);
  searchableFieldsRef.current = searchableFields;
  const filterRef = useRef(filterProp);
  filterRef.current = filterProp;
  //#endregion

  const getDateInstanceFromFilterConditionRef = useRef(
    ({ value, numberOfDays, selectedDate }: Condition<RecordRow>) => {
      switch (value as DateFilterOperatorValue) {
        case 'today':
          return new Date();
        case 'tomorrow':
          return addDays(new Date(), 1);
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
          return createDateWithoutTimezoneOffset(selectedDate);
      }
    }
  );

  const filteredData = useMemo(() => {
    filterRevalidationKey;
    const dataFilteredByFilterFields = (() => {
      if (filterFieldsRef.current) {
        if (
          selectedConditionGroup &&
          selectedConditionGroup.conditions.length > 0
        ) {
          return data.filter((row) => {
            return selectedConditionGroup.conditions
              .filter(({ operator, value, numberOfDays, selectedDate }) => {
                return (
                  operator &&
                  (contentExistenceFilterOperators.includes(
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
                  const filterField = filterFieldsRef.current!.find(
                    ({ id }) => id === fieldId
                  );
                  const filterValues: any[] = (() => {
                    const rawFieldValue = result(row, fieldId);
                    if (filterField?.getFilterValue) {
                      const filterValue = filterField.getFilterValue(row);
                      return Array.isArray(filterValue)
                        ? filterValue
                        : [filterValue];
                    }
                    return [rawFieldValue];
                  })();
                  return filterValues.some((fieldValue) => {
                    if (
                      contentExistenceFilterOperators.includes(
                        operator as ContentExistenceFilterOperator
                      )
                    ) {
                      const isFieldEmpty = Array.isArray(fieldValue)
                        ? fieldValue.length <= 0
                        : typeof fieldValue === 'number'
                        ? fieldValue === 0
                        : typeof fieldValue === 'string'
                        ? fieldValue.length <= 0
                        : fieldValue == null;
                      switch (operator as ContentExistenceFilterOperator) {
                        case 'is empty':
                          return isFieldEmpty;
                        case 'is not empty':
                          return !isFieldEmpty;
                      }
                    }
                    if (filterField?.type === 'date') {
                      const conditionValueDate =
                        getDateInstanceFromFilterConditionRef.current(
                          condition
                        );
                      const valueDate = (() => {
                        if (fieldValue != null) {
                          return createDateWithoutTimezoneOffset(fieldValue);
                        }
                      })();
                      if (
                        conditionValueDate &&
                        valueDate &&
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
    })();

    const filteredData = (() => {
      if (searchTerm && searchTerm.length > 0) {
        if (filterBySearchTermRef.current) {
          return dataFilteredByFilterFields.filter((row) =>
            filterBySearchTermRef.current!(searchTerm, row)
          );
        }
        if (searchableFieldsRef.current) {
          const lowercaseSearchTerm = searchTerm.toLowerCase();
          return dataFilteredByFilterFields.filter((row) => {
            return searchableFieldsRef.current!.some(
              ({ id, getFilterValue }) => {
                const searchValues: string[] = [];
                const rawSearchValue = result(row, id);
                if (typeof rawSearchValue === 'string') {
                  searchValues.push(rawSearchValue as any);
                } else if (Array.isArray(rawSearchValue)) {
                  searchValues.push(
                    ...rawSearchValue.filter((value) => {
                      return typeof value === 'string';
                    })
                  );
                }
                if (getFilterValue) {
                  const filterValue = getFilterValue(row);
                  if (typeof filterValue === 'string') {
                    searchValues.push(filterValue);
                  } else if (Array.isArray(filterValue)) {
                    searchValues.push(
                      ...filterValue.filter((value) => {
                        return typeof value === 'string';
                      })
                    );
                  }
                }
                return (
                  searchValues.length > 0 &&
                  searchValues.some((value) => {
                    return value
                      .toLowerCase()
                      .match(RegExp.escape(lowercaseSearchTerm));
                  })
                );
              }
            );
          });
        }
      }
      return dataFilteredByFilterFields;
    })();

    return filterRef.current ? filterRef.current(filteredData) : filteredData;
  }, [data, filterRevalidationKey, searchTerm, selectedConditionGroup]);

  return { filteredData };
};
