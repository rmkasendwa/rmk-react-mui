import { TextFieldProps } from '@mui/material';
import { ReactNode } from 'react';

import { SortOption } from '../../interfaces/Sort';
import { PrimitiveDataType } from '../../interfaces/Utils';
import { DataDropdownFieldProps } from '../InputFields/DataDropdownField';
import { DateInputFieldProps } from '../InputFields/DateInputField';
import { NumberInputFieldProps } from '../InputFields/NumberInputField';
import { BaseDataRow } from '../Table';

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
export type TextFilterOperator = typeof textFilterOperators[number];

export const enumFilterOperators = [
  'is',
  'is not',
  'is any of',
  'is none of',
] as const;
export type EnumFilterOperator = typeof enumFilterOperators[number];

export const numericFilterOperators = ['=', '≠', '<', '>', '≤', '≥'] as const;
export type NumericFilterOperator = typeof numericFilterOperators[number];

export const contentExistenceFilterOperator = [
  'is empty',
  'is not empty',
] as const;
export type ContentExistenceFilterOperator =
  typeof contentExistenceFilterOperator[number];

export const filterOperators = [
  ...enumFilterOperators,
  ...textFilterOperators,
  ...numericFilterOperators,
  ...contentExistenceFilterOperator,
] as const;
export type FilterOperator =
  | EnumFilterOperator
  | TextFilterOperator
  | NumericFilterOperator
  | ContentExistenceFilterOperator;

export const filterConjunctions = ['and', 'or'] as const;

export type Conjunction = typeof filterConjunctions[number];

export interface Condition<RecordRow extends BaseDataRow> {
  fieldId: keyof RecordRow;
  operator?: FilterOperator;
  value?: string | number | (string | number)[];
}

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
