import { TableRowProps } from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';
import { ReactNode } from 'react';

export type ITableColumnEnumValue =
  | {
      id: string;
      label: string;
    }
  | string;

export interface ITableColumn<T = any>
  extends Partial<Omit<TableCellProps, 'defaultValue'>> {
  id: keyof T & string;
  label: ReactNode;
  type?:
    | 'boolean'
    | 'checkbox'
    | 'currency'
    | 'currencyInput'
    | 'date'
    | 'dateInput'
    | 'dateTime'
    | 'dropdownInput'
    | 'enum'
    | 'id'
    | 'input'
    | 'number'
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
  defaultValue?: ReactNode;
  postProcessor?: (
    columnValue: ReactNode,
    row: T,
    column: ITableColumn
  ) => ReactNode;
  onClickColumn?: (currentEntity: T) => void;
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
  defaultValue?: ReactNode;
}
