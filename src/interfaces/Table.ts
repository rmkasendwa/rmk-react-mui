import {
  TableRowProps as MuiTableRowProps,
  SxProps,
  Theme,
  TypographyProps,
} from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';
import { ReactNode } from 'react';

import { EllipsisMenuIconButtonProps } from '../components/EllipsisMenuIconButton';
import { PrimitiveDataType } from './Utils';

export type TableColumnEnumValue =
  | {
      id: string;
      label: string;
    }
  | string;

export type TableColumnType =
  | PrimitiveDataType
  | 'checkbox'
  | 'currency'
  | 'currencyInput'
  | 'dateInput'
  | 'dateTime'
  | 'dropdownInput'
  | 'id'
  | 'input'
  | 'numberInput'
  | 'percentage'
  | 'percentageInput'
  | 'phoneNumber'
  | 'phonenumberInput'
  | 'rowAdder'
  | 'time'
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

export interface TableColumn<
  RowObject = any,
  ColumnType extends TableColumnType = TableColumnType
> extends Partial<Omit<TableCellProps, 'defaultValue' | 'id'>> {
  id: keyof RowObject;
  label?: ReactNode;
  type?: ColumnType;
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
  isDerivedColumn?: boolean;
  noHeaderTextAfter?: boolean;
  headerTextAfter?: ReactNode;
  enumValues?: TableColumnEnumValue[];
  searchKeyMapper?: (displayingColumnValue: string) => any;
  columnClassName?: string;
  locked?: boolean;
  defaultColumnValue?: ReactNode;
  postProcessor?: (
    columnValue: ReactNode,
    row: RowObject,
    column: TableColumn<RowObject, ColumnType>
  ) => ReactNode;
  getColumnValue?: GetColumnValue<RowObject, ColumnType>;
  onClickColumn?: (currentEntity: RowObject) => void;
  headerSx?: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
  sortable?: boolean;
  opaque?: boolean;
}

export interface ForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type GetRowProps<T = any> = (currentEntity: T) => MuiTableRowProps;

export interface BaseTableRow {
  id: string | number;
}

export interface TableRowProps<T = any> {
  columns: Array<TableColumn<T>>;
  row: T;
  forEachDerivedColumn?: (
    config: ForEachDerivedColumnConfiguration<T>
  ) => ReactNode | null | undefined;
  generateRowData?: (currentEntity: T) => any;
  getRowProps?: GetRowProps;
  decimalPlaces?: number;
  labelTransform?: boolean;
  onClickRow?: (currentEntity: T) => void;
  defaultColumnValue?: ReactNode;
  columnTypographyProps?: Partial<TypographyProps>;
  minColumnWidth?: number;
  opaque?: boolean;
}
