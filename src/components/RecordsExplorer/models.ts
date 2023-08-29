import { TextFieldProps } from '@mui/material';
import { ReactNode } from 'react';
import * as Yup from 'yup';

import { SortDirection, SortOption, sortDirections } from '../../models/Sort';
import { PrimitiveDataType } from '../../models/Utils';
import { DataDropdownFieldProps } from '../InputFields/DataDropdownField';
import { DateInputFieldProps } from '../InputFields/DateInputField';
import { NumberInputFieldProps } from '../InputFields/NumberInputField';
import { BaseDataRow, TableColumn } from '../Table';
import { timelineSearchParamValidationSpec } from '../Timeline';

// Search term filter types
export type FilterBySearchTerm<RecordRow extends BaseDataRow> = (
  searchTerm: string,
  row: RecordRow
) => boolean;

export interface SearchableProperty<RecordRow extends BaseDataRow> {
  label: string;
  id: keyof RecordRow;
  getFilterValue?: (row: RecordRow) => any;
}

export interface BaseDataFilterField<RecordRow extends BaseDataRow> {
  type: PrimitiveDataType;
  /**
   * The placeholder/field label of the filter field.
   */
  label: string;
  /**
   * The title of the field tooltip.
   */
  title?: string;
  /**
   * The field id used in the query string and during data filtering.
   */
  id: keyof RecordRow;
  /**
   * The filter function to be called when the user provides input in the filter field.
   */
  getFilterValue?: (row: RecordRow) => any;
}

export interface DataMultiSelectDropdownFilterField<
  RecordRow extends BaseDataRow
> extends Omit<BaseDataFilterField<RecordRow>, 'filter'>,
    Omit<DataDropdownFieldProps, 'id' | 'label'> {
  /**
   * The type of the filter field.
   */
  type: 'enum';
  /**
   * The function called while generating each field option label.
   * Note: Only provide if you need to customize the field option labels.
   *
   * @param row - An item in the input data set
   */
  getFieldOptionLabel?: (row: RecordRow) => ReactNode;
}

export interface DataDateFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<DateInputFieldProps, 'id' | 'label'> {
  /**
   * The type of the filter field.
   */
  type: 'date';
}

export interface NumberFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<NumberInputFieldProps, 'id' | 'label'> {
  /**
   * The type of the filter field.
   */
  type: 'number';
}

export interface TextFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<TextFieldProps, 'id' | 'label'> {
  /**
   * The type of the filter field.
   */
  type: 'string';
}

export type DataFilterField<RecordRow extends BaseDataRow> =
  | DataMultiSelectDropdownFilterField<RecordRow>
  | DataDateFilterField<RecordRow>
  | NumberFilterField<RecordRow>
  | TextFilterField<RecordRow>;

export const textFilterOperators = ['contains', 'does not contain'] as const;
export type TextFilterOperator = (typeof textFilterOperators)[number];

export const enumFilterOperators = [
  'is',
  'is not',
  'is any of',
  'is none of',
] as const;
export type EnumFilterOperator = (typeof enumFilterOperators)[number];

export const numericFilterOperators = ['=', '≠', '<', '>', '≤', '≥'] as const;
export type NumericFilterOperator = (typeof numericFilterOperators)[number];

//#region Date filter operators
export const dateFilterOperators = [
  'is',
  'is within',
  'is before',
  'is after',
  'is on or before',
  'is on or after',
  'is not',
] as const;
export type DateFilterOperator = (typeof dateFilterOperators)[number];

export const dateStaticFilterOperatorValues = [
  'today',
  'tomorrow',
  'yesterday',
  'one week ago',
  'one week from now',
  'one month ago',
  'one month from now',
  'number of days ago',
  'number of days from now',
  'exact date',
] as const;
export type DateStaticFilterOperatorValue =
  (typeof dateStaticFilterOperatorValues)[number];

export const dateRangeFilterOperatorValues = [
  'the past week',
  'the past month',
  'the past year',
  'the next week',
  'the next month',
  'the next year',
  'the next number of days',
  'the past number of days',
] as const;
export type DateRangeFilterOperatorValue =
  (typeof dateRangeFilterOperatorValues)[number];

export type DateFilterOperatorValue =
  | DateStaticFilterOperatorValue
  | DateRangeFilterOperatorValue;

export const dateFilterOperatorToValueOptionsMap: Record<
  DateFilterOperator,
  typeof dateStaticFilterOperatorValues | typeof dateRangeFilterOperatorValues
> = {
  is: dateStaticFilterOperatorValues,
  'is within': dateRangeFilterOperatorValues,
  'is before': dateStaticFilterOperatorValues,
  'is after': dateStaticFilterOperatorValues,
  'is on or before': dateStaticFilterOperatorValues,
  'is on or after': dateStaticFilterOperatorValues,
  'is not': dateStaticFilterOperatorValues,
};
//#endregion

export const contentExistenceFilterOperator = [
  'is empty',
  'is not empty',
] as const;
export type ContentExistenceFilterOperator =
  (typeof contentExistenceFilterOperator)[number];

export const filterOperators = [
  ...enumFilterOperators,
  ...textFilterOperators,
  ...numericFilterOperators,
  ...dateFilterOperators,
  ...contentExistenceFilterOperator,
] as const;
export type FilterOperator =
  | EnumFilterOperator
  | TextFilterOperator
  | NumericFilterOperator
  | DateFilterOperator
  | ContentExistenceFilterOperator;

export const filterConjunctions = ['and', 'or'] as const;

export type Conjunction = (typeof filterConjunctions)[number];

export type Condition<RecordRow extends BaseDataRow> = {
  fieldId: keyof RecordRow;
  operator?: FilterOperator;
  value?: string | number | (string | number)[];
} & Record<string, any>;

export interface ConditionGroup<RecordRow extends BaseDataRow> {
  conjunction: Conjunction;
  conditions: Condition<RecordRow>[];
}

export type BaseDataGroup<RecordRow> = {
  groupName?: string;
  label?: ReactNode;
  childrenCount: number;
} & RecordRow;

export type DataGroup<RecordRow extends BaseDataRow = any> =
  BaseDataGroup<RecordRow> & {
    children: RecordRow[];
  };

export type NestedDataGroup<RecordRow extends BaseDataRow = any> =
  BaseDataGroup<RecordRow> & {
    children: NestedDataGroup<RecordRow>[] | RecordRow[];
  };

export type GroupableField<RecordRow extends BaseDataRow> =
  SortOption<RecordRow> & {
    getGroupLabel?: (row: DataGroup<RecordRow>) => ReactNode;
  };

export type RecordsExplorerRowField<RecordRow extends BaseDataRow = any> =
  TableColumn<RecordRow> &
    Pick<SearchableProperty<RecordRow>, 'getFilterValue'> &
    Pick<SortOption<RecordRow>, 'sortLabels' | 'getSortValue'> &
    Pick<GroupableField<RecordRow>, 'getGroupLabel'> &
    Partial<
      Pick<
        DataMultiSelectDropdownFilterField<RecordRow>,
        'getFieldOptionLabel' | 'options' | 'sortOptions'
      >
    > & {
      searchable?: boolean;
      sortable?: boolean;
      groupable?: boolean;
    };

export const recordsExplorerSearchParamValidationSpec = {
  ...timelineSearchParamValidationSpec,
  view: Yup.string(),
  groupBy: Yup.array().of(
    Yup.object({
      id: Yup.mixed().required(),
      sortDirection: Yup.mixed<SortDirection>()
        .required()
        .oneOf([...sortDirections]),
    })
  ),
  expandedGroups: Yup.mixed<'All' | 'None' | string[]>(),
  expandedGroupsInverted: Yup.boolean(),
  sortBy: Yup.array().of(
    Yup.object({
      id: Yup.mixed().required(),
      sortDirection: Yup.mixed<SortDirection>()
        .required()
        .oneOf([...sortDirections]),
    })
  ),
  filterBy: Yup.object({
    conjunction: Yup.mixed<Conjunction>().oneOf([...filterConjunctions]),
    conditions: Yup.array()
      .of(
        Yup.object({
          fieldId: Yup.mixed().required(),
          operator: Yup.mixed<FilterOperator>().oneOf([...filterOperators]),
          value: Yup.mixed<string | number | (string | number)[]>(),
        })
      )
      .required(),
  }).default(undefined),
  search: Yup.string(),
  selectedColumns: Yup.array().of(Yup.string().required()),
  modifiedKeys: Yup.array().of(Yup.string().required()),
  createNewRecord: Yup.boolean(),
  selectedRecord: Yup.string(),
  editRecord: Yup.boolean(),
  selectedDataPreset: Yup.mixed<string | number>(),
};
