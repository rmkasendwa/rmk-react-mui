import {
  TableRowProps as MuiTableRowProps,
  SxProps,
  Theme,
  TypographyProps,
} from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';
import { ReactNode } from 'react';

import { EllipsisMenuIconButtonProps } from '../components/EllipsisMenuIconButton';
import { FieldValueProps } from '../components/FieldValue';
import { CountryCode } from './Countries';
import { DropdownOption, ExoticDataType } from './Utils';

export type TableColumnEnumValue =
  | {
      id: string;
      label: string;
    }
  | string;

export type TableColumnType =
  | ExoticDataType
  | 'currencyInput'
  | 'dateInput'
  | 'dropdownInput'
  | 'ellipsisMenuTool'
  | 'id'
  | 'input'
  | 'numberInput'
  | 'percentageInput'
  | 'phonenumberInput'
  | 'rowAdder'
  | 'tool';

export type GetColumnValue<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> = (
  row: RowObject,
  column: TableColumn<RowObject, ColumnType>
) => ColumnType extends 'ellipsisMenuTool'
  ? EllipsisMenuIconButtonProps
  : ReactNode;

export type GetEditField<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: RowObject, column: TableColumn<RowObject, ColumnType>) => ReactNode;

export type GetEditableColumnValue<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> = (
  row: RowObject,
  column: TableColumn<RowObject, ColumnType>
) => string | number | boolean | (string | number | boolean)[] | undefined;

export type FieldValueEditor<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType,
  UpdatedValue extends ReactNode = ReactNode
> = (
  row: RowObject,
  updatedValue: UpdatedValue,
  column: TableColumn<RowObject, ColumnType>
) => any;

export type OnClickColumn<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: RowObject, column: TableColumn<RowObject, ColumnType>) => void;

export interface TableColumn<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> extends Partial<Omit<TableCellProps, 'defaultValue' | 'id'>>,
    Partial<Pick<DropdownOption, 'label' | 'searchableLabel' | 'description'>>,
    Partial<
      Pick<
        FieldValueProps,
        | 'editField'
        | 'editMode'
        | 'editable'
        | 'noWrap'
        | 'onFieldValueUpdated'
        | 'validationRules'
      >
    > {
  id: keyof RowObject;
  type?: ColumnType;
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
  noHeaderTextSuffix?: boolean;
  headerTextSuffix?: ReactNode;
  enumValues?: TableColumnEnumValue[];
  searchKeyMapper?: (displayingColumnValue: string) => any;
  columnClassName?: string;
  locked?: boolean;
  defaultColumnValue?: ReactNode;
  getColumnValue?: GetColumnValue<RowObject, ColumnType>;
  getEditableColumnValue?: GetEditableColumnValue<RowObject, ColumnType>;
  getEditField?: GetEditField<RowObject, ColumnType>;
  fieldValueEditor?: FieldValueEditor<RowObject, ColumnType>;
  onClickColumn?: OnClickColumn<RowObject, ColumnType>;
  headerSx?: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
  sortable?: boolean;
  opaque?: boolean;
  propagateClickToParentRowClickEvent?: boolean;
  columnTypographyProps?: Partial<TypographyProps>;
  getColumnTypographyProps?: (row: RowObject) => Partial<TypographyProps>;
  decimalPlaces?: number;
  textTransform?: boolean;
  showHeaderText?: boolean;
  dateFormat?: string;
  dateTimeFormat?: string;
  defaultCountryCode?: CountryCode;
}

export interface ForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type GetRowProps<T = any> = (
  currentEntity: T
) => Partial<MuiTableRowProps> | undefined;

export interface BaseDataRow {
  id: string;
}

export interface TableRowProps<RowObject extends Record<string, any> = any>
  extends Pick<
    TableColumn<RowObject>,
    | 'columnTypographyProps'
    | 'decimalPlaces'
    | 'defaultColumnValue'
    | 'defaultCountryCode'
    | 'editable'
    | 'noWrap'
    | 'opaque'
    | 'textTransform'
  > {
  columns: Array<TableColumn<RowObject>>;
  row: RowObject;
  generateRowData?: (currentEntity: RowObject) => any;
  getRowProps?: GetRowProps;
  onClickRow?: (currentEntity: RowObject) => void;
  minColumnWidth?: number;
  defaultDateFormat?: string;
  defaultDateTimeFormat?: string;
}
