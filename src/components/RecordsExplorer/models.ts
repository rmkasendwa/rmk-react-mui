import { TextFieldProps } from '@mui/material';
import { ReactNode } from 'react';

import { SortOption } from '../../models/Sort';
import { PrimitiveDataType } from '../../models/Utils';
import { DataDropdownFieldProps } from '../InputFields/DataDropdownField';
import { DateInputFieldProps } from '../InputFields/DateInputField';
import { NumberInputFieldProps } from '../InputFields/NumberInputField';
import {
  BaseDataRow,
  TableColumn,
  TableColumnType,
  TableProps,
} from '../Table';
import { TimelineProps } from '../Timeline';

// Search term filter types
export type FilterBySearchTerm<RecordRow extends BaseDataRow> = (
  searchTerm: string,
  row: RecordRow
) => boolean;

export interface SearchableProperty<RecordRow extends BaseDataRow> {
  id: keyof RecordRow;
  label: ReactNode;
  searchableLabel?: string;
  getFilterValue?: (row: RecordRow) => any;
}

export interface BaseDataFilterField<RecordRow extends BaseDataRow> {
  /**
   * The field id used in the query string and during data filtering.
   */
  id: keyof RecordRow;

  type: PrimitiveDataType;

  /**
   * The placeholder/field label of the filter field.
   */
  label: ReactNode;
  searchableLabel?: string;

  /**
   * The title of the field tooltip.
   */
  title?: string;

  /**
   * The filter function to be called when the user provides input in the filter field.
   */
  getFilterValue?: (row: RecordRow) => any;
}

export interface DataMultiSelectDropdownFilterField<
  RecordRow extends BaseDataRow
> extends Omit<BaseDataFilterField<RecordRow>, 'filter'>,
    Omit<DataDropdownFieldProps, 'id' | 'label' | 'searchableLabel'> {
  /**
   * The type of the filter field.
   */
  type: 'enum';
  /**
   * The function called while generating each field option label.
   * Note: Only provide if you need to customize the field option labels.
   *
   * @param row - An item in the input data set
   * @param fieldOptionLabel - The default field option label
   */
  getFieldOptionLabel?: (
    row: RecordRow,
    fieldOptionLabel: ReactNode
  ) => ReactNode;
}

export interface DataDateFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<DateInputFieldProps, 'id' | 'label' | 'searchableLabel'> {
  /**
   * The type of the filter field.
   */
  type: 'date';
}

export interface NumberFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<NumberInputFieldProps, 'id' | 'label' | 'searchableLabel'> {
  /**
   * The type of the filter field.
   */
  type: 'number';
}

export interface BooleanFilterField<RecordRow extends BaseDataRow>
  extends Omit<BaseDataFilterField<RecordRow>, 'filter'>,
    Omit<DataDropdownFieldProps, 'id' | 'label' | 'searchableLabel'> {
  /**
   * The type of the filter field.
   */
  type: 'boolean';

  /**
   * The function called while generating each field option label.
   * Note: Only provide if you need to customize the field option labels.
   *
   * @param row - An item in the input data set
   */
  getFieldOptionLabel?: (row: RecordRow) => ReactNode;
}

export interface TextFilterField<RecordRow extends BaseDataRow>
  extends BaseDataFilterField<RecordRow>,
    Omit<TextFieldProps, 'id' | 'label' | 'searchableLabel'> {
  /**
   * The type of the filter field.
   */
  type: 'string';
}

export type DataFilterField<RecordRow extends BaseDataRow> =
  | DataMultiSelectDropdownFilterField<RecordRow>
  | DataDateFilterField<RecordRow>
  | NumberFilterField<RecordRow>
  | BooleanFilterField<RecordRow>
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

//#region Boolean filter operators
export const booleanFilterOperators = ['is'] as const;
export type BooleanFilterOperator = (typeof booleanFilterOperators)[number];

export const contentExistenceFilterOperators = [
  'is empty',
  'is not empty',
] as const;
export type ContentExistenceFilterOperator =
  (typeof contentExistenceFilterOperators)[number];

export const filterOperators = [
  ...enumFilterOperators,
  ...textFilterOperators,
  ...numericFilterOperators,
  ...dateFilterOperators,
  ...booleanFilterOperators,
  ...contentExistenceFilterOperators,
] as const;
export type FilterOperator =
  | EnumFilterOperator
  | TextFilterOperator
  | NumericFilterOperator
  | DateFilterOperator
  | BooleanFilterOperator
  | ContentExistenceFilterOperator;

export const filterConjunctions = ['and', 'or'] as const;

export type Conjunction = (typeof filterConjunctions)[number];

export type Condition<RecordRow extends BaseDataRow> = {
  fieldId: keyof RecordRow;
  operator?: FilterOperator;
  value?: string | number | boolean | (string | number)[];
} & Record<string, any>;

export interface ConditionGroup<RecordRow extends BaseDataRow> {
  conjunction: Conjunction;
  conditions: Condition<RecordRow>[];
}

export type BaseDataGroup<RecordRow> = {
  groupName?: string;
  label?: ReactNode;
  searchableLabel?: string;
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
    Pick<SortOption<RecordRow>, 'sortLabels' | 'getSortValue' | 'sort'> &
    Pick<GroupableField<RecordRow>, 'getGroupLabel'> &
    Partial<
      Pick<
        DataMultiSelectDropdownFilterField<RecordRow>,
        'getFieldOptionLabel' | 'options' | 'sortOptions'
      >
    > & {
      searchable?: boolean;
      filterType?: PrimitiveDataType;
      sortable?: boolean;
      sortType?: PrimitiveDataType;
      groupable?: boolean;
      groupType?: PrimitiveDataType;
    };

export const viewOptionTypes = ['Timeline', 'Grid', 'List'] as const;

export type ViewOptionType<ViewType extends string = string> =
  | (typeof viewOptionTypes)[number]
  | ViewType;

export interface BaseDataView {
  type: ViewOptionType;
  minWidth?: number;
  mergeTools?: boolean;
  renderView?: boolean;
}

export interface ListView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Partial<Omit<TableProps<RecordRow>, 'rows' | 'columns' | 'minWidth'>> {
  type: 'List';
  columns: RecordsExplorerRowField<RecordRow>[];
}

export interface TimelineView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Partial<Omit<TimelineProps<RecordRow>, 'rows'>> {
  type: 'Timeline';
}

export type DataView<RecordRow extends BaseDataRow> =
  | ListView<RecordRow>
  | TimelineView<RecordRow>;

export const ENUM_TABLE_COLUMN_TYPES: TableColumnType[] = ['enum'];
