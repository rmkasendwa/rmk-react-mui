import '@infinite-debugger/rmk-js-extensions/Object';

import { SxProps, Theme, Typography, TypographyProps } from '@mui/material';
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

export const CHECKBOX_COLUMN_ID = 'checkbox';
export const ELLIPSIS_MENU_TOOL_COLUMN_ID = 'ellipsisMenuTool';
export const DEFAULT_GROUP_LABEL = (
  <Typography
    variant="body2"
    sx={{
      opacity: 0.3,
    }}
  >
    (Empty)
  </Typography>
);

export type BaseRecordsGroupProps = {
  parentGroupId?: string;
  groupCollapsed: boolean;
};

export type RecordsGroupHeaderProps = BaseRecordsGroupProps & {
  isGroupHeader: true;
  groupId: string;
  groupLabel?: ReactNode;
  indentLevel: number;
  onChangeGroupCollapsed?: (groupCollapsed: boolean) => void;
  childrenCount: number;
};

export type RecordsGroupMemberProps = Required<BaseRecordsGroupProps> & {
  parentGroupIndentLevel: number;
};

export type RecordsGroupProps =
  | RecordsGroupHeaderProps
  | RecordsGroupMemberProps;

export type BaseDataRow = Record<string, any> & {
  id: string;
  GroupingProps?: RecordsGroupProps;
};

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
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: DataRow, column: TableColumn<DataRow, ColumnType>) => ReactNode;

export type GetEditField<
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: DataRow, column: TableColumn<DataRow, ColumnType>) => ReactNode;

export type GetEditableColumnValue<
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType
> = (
  row: DataRow,
  column: TableColumn<DataRow, ColumnType>
) => string | number | boolean | (string | number | boolean)[] | undefined;

export type FieldValueEditor<
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType,
  UpdatedValue extends ReactNode = ReactNode
> = (
  row: DataRow,
  updatedValue: UpdatedValue,
  column: TableColumn<DataRow, ColumnType>
) => any;

export type OnClickColumn<
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: DataRow, column: TableColumn<DataRow, ColumnType>) => void;

export interface TableColumn<
  DataRow extends BaseDataRow = any,
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
  id: keyof DataRow;
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
  getColumnValue?: GetColumnValue<DataRow, ColumnType>;
  getFilterValue?: (row: DataRow) => string;
  getEditableColumnValue?: GetEditableColumnValue<DataRow, ColumnType>;
  getEditField?: GetEditField<DataRow, ColumnType>;
  fieldValueEditor?: FieldValueEditor<DataRow, ColumnType>;
  onClickColumn?: OnClickColumn<DataRow, ColumnType>;
  headerSx?: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
  sortable?: boolean;
  opaque?: boolean;
  propagateClickToParentRowClickEvent?: boolean;
  columnTypographyProps?: Partial<TypographyProps>;
  getColumnTypographyProps?: (row: DataRow) => Partial<TypographyProps>;
  decimalPlaces?: number;
  textTransform?: boolean;
  showHeaderText?: boolean;
  showBodyContent?: boolean;
  dateFormat?: string;
  dateTimeFormat?: string;
  defaultCountryCode?: CountryCode;
  holdsPriorityInformation?: boolean;
  isGroupHeaderColumn?: boolean;
}

export interface ForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type GetRowProps<T = any> = (
  currentEntity: T
) => Partial<MuiTableRowProps> | undefined;

export interface TableRowProps<DataRow extends BaseDataRow = any>
  extends Pick<
    TableColumn<DataRow>,
    | 'columnTypographyProps'
    | 'decimalPlaces'
    | 'defaultColumnValue'
    | 'defaultCountryCode'
    | 'editable'
    | 'noWrap'
    | 'opaque'
    | 'textTransform'
  > {
  columns: Array<TableColumn<DataRow>>;
  row: DataRow;
  generateRowData?: (currentEntity: DataRow) => any;
  getRowProps?: GetRowProps;
  onClickRow?: (currentEntity: DataRow) => void;
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

export interface TableGroupingProps {
  allGroupsCollapsed: boolean;
  onChangeAllGroupsCollapsed?: (allGroupsCollapsed: boolean) => void;
}

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
    Partial<
      Pick<
        TableColumnToggleIconButtonProps<DataRow>,
        'selectedColumnIds' | 'onChangeSelectedColumnIds'
      >
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
  isGroupedTable?: boolean;
  TableGroupingProps?: TableGroupingProps;
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
