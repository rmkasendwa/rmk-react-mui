import { SxProps, TableRowProps, Theme, TypographyProps } from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';
import { ReactNode } from 'react';

import { PrimitiveDataType } from './Utils';

export type ITableColumnEnumValue =
  | {
      id: string;
      label: string;
    }
  | string;

export interface ITableColumn<T = any>
  extends Partial<Omit<TableCellProps, 'defaultValue' | 'id'>> {
  id: keyof T;
  label?: ReactNode;
  type?:
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
    | 'tool';
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
  isDerivedColumn?: boolean;
  noHeaderTextAfter?: boolean;
  headerTextAfter?: ReactNode;
  enumValues?: ITableColumnEnumValue[];
  searchKeyMapper?: (displayingColumnValue: string) => any;
  columnClassName?: string;
  locked?: boolean;
  defaultColumnValue?: ReactNode;
  postProcessor?: (
    columnValue: ReactNode,
    row: T,
    column: ITableColumn
  ) => ReactNode;
  getColumnValue?: (row: T, column: ITableColumn) => ReactNode;
  onClickColumn?: (currentEntity: T) => void;
  headerSx?: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
  sortable?: boolean;
}

export interface IForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type TGetRowProps<T = any> = (currentEntity: T) => TableRowProps;

export interface IBaseTableRow {
  id: string | number;
}

export interface ITableRowProps<T = any> {
  columns: Array<ITableColumn<T>>;
  row: T;
  forEachDerivedColumn?: (
    config: IForEachDerivedColumnConfiguration<T>
  ) => ReactNode | null | undefined;
  generateRowData?: (currentEntity: T) => any;
  getRowProps?: TGetRowProps;
  decimalPlaces?: number;
  labelTransform?: boolean;
  onClickRow?: (currentEntity: T) => void;
  defaultColumnValue?: ReactNode;
  columnTypographyProps?: Partial<TypographyProps>;
  minColumnWidth?: number;
}
