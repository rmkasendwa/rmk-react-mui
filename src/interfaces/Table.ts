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
  | 'id'
  | 'input'
  | 'numberInput'
  | 'percentageInput'
  | 'phonenumberInput'
  | 'rowAdder'
  | 'tool'
  | 'ellipsisMenuTool';

export type GetColumnValue<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> = (
  row: RowObject,
  column: TableColumn<RowObject, ColumnType>
) => ColumnType extends 'ellipsisMenuTool'
  ? EllipsisMenuIconButtonProps
  : ReactNode;

export type GetEditField<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: RowObject, column: TableColumn<RowObject, ColumnType>) => ReactNode;

export type GetEditableColumnValue<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> = (
  row: RowObject,
  column: TableColumn<RowObject, ColumnType>
) => string | number | boolean | (string | number | boolean)[] | undefined;

export type FieldValueEditor<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType,
  UpdatedValue extends ReactNode = ReactNode
> = (
  row: RowObject,
  updatedValue: UpdatedValue,
  column: TableColumn<RowObject, ColumnType>
) => any;

export type OnClickColumn<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: RowObject, column: TableColumn<RowObject, ColumnType>) => void;

export interface TableColumn<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> extends Partial<Omit<TableCellProps, 'defaultValue' | 'id'>>,
    Partial<Pick<DropdownOption, 'label' | 'searchableLabel' | 'description'>>,
    Partial<
      Pick<
        FieldValueProps,
        | 'onFieldValueUpdated'
        | 'editField'
        | 'editMode'
        | 'editable'
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
  decimalPlaces?: number;
  textTransform?: boolean;
  showHeaderText?: boolean;
  dateFormat?: string;
  dateTimeFormat?: string;
}

export interface ForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type GetRowProps<T = any> = (
  currentEntity: T
) => Partial<MuiTableRowProps> | undefined;

export interface BaseTableRow {
  id: string | number;
}

export interface TableRowProps<RowObject = any>
  extends Pick<
    TableColumn<RowObject>,
    | 'decimalPlaces'
    | 'columnTypographyProps'
    | 'editable'
    | 'opaque'
    | 'textTransform'
    | 'defaultColumnValue'
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
