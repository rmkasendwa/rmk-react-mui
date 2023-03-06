import '@infinite-debugger/rmk-js-extensions/Object';

import { BoxProps } from '@mui/material/Box';
import { PaginationProps } from '@mui/material/Pagination';
import { TableProps as MuiBaseTableProps } from '@mui/material/Table';
import { TablePaginationProps } from '@mui/material/TablePagination';
import { TableRowProps as MuiTableRowProps } from '@mui/material/TableRow';
import { ReactNode } from 'react';

import { SortBy, SortOptions } from '../../interfaces/Sort';
import {
  BaseDataRow,
  GetRowProps,
  TableColumn,
  TableRowProps,
} from '../../interfaces/Table';
import { EllipsisMenuIconButtonProps } from '../EllipsisMenuIconButton';
import { RenderIfVisibleProps } from '../RenderIfVisible';
import { TableColumnToggleIconButtonProps } from './TableColumnToggleIconButton';

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
