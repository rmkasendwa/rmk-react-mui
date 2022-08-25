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
  extends Pick<TableCellProps, 'sx' | 'style'> {
  id: string;
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
}

export interface IForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export interface ITableRowProps<T = any> {
  columns: Array<ITableColumn<T>>;
  row: T;
  forEachDerivedColumn?: (
    config: IForEachDerivedColumnConfiguration<T>
  ) => ReactNode | null | undefined;
  forEachRowProps?: (currentEntity: T) => TableRowProps;
  decimalPlaces?: number;
  labelTransform?: boolean;
  onClickRow?: (currentEntity: T) => void;
}
