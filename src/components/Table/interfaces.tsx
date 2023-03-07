import '@infinite-debugger/rmk-js-extensions/Object';

import { SxProps, Theme, TypographyProps } from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import { PaginationProps } from '@mui/material/Pagination';
import { TableProps as MuiBaseTableProps } from '@mui/material/Table';
import { TableCellProps } from '@mui/material/TableCell';
import { TablePaginationProps } from '@mui/material/TablePagination';
import { TableRowProps as MuiTableRowProps } from '@mui/material/TableRow';
import { ReactNode } from 'react';

import { CountryCode } from '../../interfaces/Countries';
import { SortBy, SortOptions } from '../../interfaces/Sort';
import { DropdownOption, ExoticDataType } from '../../interfaces/Utils';
import { EllipsisMenuIconButtonProps } from '../EllipsisMenuIconButton';
import { FieldValueProps } from '../FieldValue';
import { RenderIfVisibleProps } from '../RenderIfVisible';
import { TableColumnToggleIconButtonProps } from './TableColumnToggleIconButton';

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
  | 'tool';

export type GetColumnValue<
  RowObject extends Record<string, any> = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: RowObject, column: TableColumn<RowObject, ColumnType>) => ReactNode;

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
  extraWidth?: number;
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
  holdsPriorityInformation?: boolean;
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

export type TableVariant =
  | 'stripped'
  | 'stripped-rows'
  | 'stripped-columns'
  | 'plain';

export type TableBordersVariant = 'square' | 'rows' | 'columns' | 'none';

export interface TableProps<DataRow extends BaseDataRow = any>
  extends Partial<Pick<MuiBaseTableProps, 'onClick' | 'sx' | 'className'>>,
    Pick<
      TableRowProps<DataRow>,
      | 'columnTypographyProps'
      | 'columns'
      | 'decimalPlaces'
      | 'defaultColumnValue'
      | 'defaultCountryCode'
      | 'defaultDateFormat'
      | 'defaultDateTimeFormat'
      | 'editable'
      | 'generateRowData'
      | 'minColumnWidth'
      | 'noWrap'
      | 'onClickRow'
      | 'textTransform'
    >,
    Pick<
      TableColumnToggleIconButtonProps<DataRow>,
      'selectedColumnIds' | 'onChangeSelectedColumnIds'
    >,
    Partial<Pick<TablePaginationProps, 'rowsPerPageOptions'>> {
  rows?: DataRow[];
  rowStartIndex?: number;
  rowsPerPage?: number;
  pageIndex?: number;
  filterdRowCount?: number;
  totalRowCount?: number;
  labelPlural?: string;
  labelSingular?: string;
  lowercaseLabelPlural?: string;
  emptyRowsLabel?: ReactNode;
  variant?: TableVariant;
  bordersVariant?: TableBordersVariant;
  onChangePage?: (pageIndex: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  forEachRowProps?: GetRowProps<DataRow>;
  paging?: boolean;
  showHeaderRow?: boolean;
  showDataRows?: boolean;
  HeaderRowProps?: Partial<MuiTableRowProps>;
  currencyCode?: string;
  paginationType?: 'default' | 'classic';
  PaginationProps?: PaginationProps;
  stickyHeader?: boolean;
  TableBodyRowPlaceholderProps?: Partial<RenderIfVisibleProps>;
  PaginatedTableWrapperProps?: Partial<BoxProps>;
  parentBackgroundColor?: string;
  enableSmallScreenOptimization?: boolean;
  showRowNumber?: boolean;
  getDisplayingColumns?: (
    columns: TableColumn<DataRow>[]
  ) => TableColumn<DataRow>[];
  getEllipsisMenuToolProps?: (
    row: DataRow
  ) => EllipsisMenuIconButtonProps | undefined | null;

  allPropsComputed?: boolean;

  // Sort props
  sortable?: boolean;
  handleSortOperations?: boolean;
  sortBy?: SortBy<DataRow>;
  onChangeSortBy?: (sortOptions: SortOptions<DataRow>) => void;

  // Removable columns
  enableColumnDisplayToggle?: boolean;
  ColumnDisplayToggleProps?: Partial<BoxProps>;

  // Checkboxes
  enableCheckboxRowSelectors?: boolean;
  enableCheckboxAllRowSelector?: boolean;
  allRowsChecked?: boolean;
  checkedRowIds?: string[];
  onChangeCheckedRowIds?: (
    checkedRowIds: string[],
    allRowsChecked: boolean
  ) => void;
}
