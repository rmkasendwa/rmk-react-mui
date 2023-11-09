import '@infinite-debugger/rmk-js-extensions/Object';

import { TableHeadProps, Typography } from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import { TableProps as MuiBaseTableProps } from '@mui/material/Table';
import { TableCellProps } from '@mui/material/TableCell';
import { TableRowProps as MuiTableRowProps } from '@mui/material/TableRow';
import { ReactElement, ReactNode, RefObject } from 'react';
import * as Yup from 'yup';

import { CountryCode } from '../../models/Countries';
import { SortBy, SortOptions } from '../../models/Sort';
import { DropdownOption, ExoticDataType } from '../../models/Utils';
import { EllipsisMenuIconButtonProps } from '../EllipsisMenuIconButton';
import { FieldValueProps } from '../FieldValue';
import { RenderIfVisibleProps } from '../RenderIfVisible';
import { TableColumnToggleIconButtonProps } from './TableColumnToggleIconButton';

export const CHECKBOX_COLUMN_ID = 'checkbox';
export const ROW_NUMBER_COLUMN_ID = 'rowNumber';
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

export type GetToolTipWrappedColumnNodeFunction<DataRow> = (
  tableColumnNode: ReactElement,
  row: DataRow
) => ReactElement;

export type ShowColumnBodyContentFunction<
  DataRow extends BaseDataRow = any,
  ColumnType extends TableColumnType = TableColumnType
> = (row: DataRow, column: TableColumn<DataRow, ColumnType>) => boolean;

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
  /**
   * The id of the column. This is used to identify the column in the table.
   * It is also used as the key of the column in the table. If `getColumnValue`
   * is not provided, the column id is used to get the value of the column from
   * the row object.
   */
  id: keyof DataRow;

  /**
   * The label of the column. This is used as the secondary row header text of the column.
   */
  secondaryHeaderRowContent?: ReactNode;

  /**
   * The type of the column. This is used to determine how to render the column. If not provided,
   * the column will be a text column. The column type also doubles as the column data type in most
   * cases.
   */
  type?: ColumnType;

  /**
   * The alignment of the body content of the column. This does not affect the alignment of the
   * header text of the column.
   */
  align?: 'left' | 'center' | 'right';
  setDefaultWidth?: boolean;
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
  getFilterValue?: (row: DataRow) => any | undefined;
  getEditableColumnValue?: GetEditableColumnValue<DataRow, ColumnType>;
  getEditField?: GetEditField<DataRow, ColumnType>;
  fieldValueEditor?: FieldValueEditor<DataRow, ColumnType>;
  onClickColumn?: OnClickColumn<DataRow, ColumnType>;
  headerClassName?: string;
  headerSx?: TableCellProps['sx'];
  primaryHeaderSx?: TableCellProps['sx'];
  secondaryHeaderSx?: TableCellProps['sx'];
  bodySx?: TableCellProps['sx'];
  sortable?: boolean;
  opaque?: boolean;
  propagateClickToParentRowClickEvent?: boolean | ((row: DataRow) => boolean);
  columnTypographyProps?: Partial<FieldValueProps>;
  getColumnTypographyProps?: (row: DataRow) => Partial<FieldValueProps>;
  wrapColumnContentInFieldValue?: boolean;
  decimalPlaces?: number;
  textTransform?: boolean;

  /**
   * Whether to show the header text of the column.
   */
  showHeaderText?: boolean;

  /**
   * Whether to show the body content of the column.
   */
  showBodyContent?:
    | boolean
    | ShowColumnBodyContentFunction<DataRow, ColumnType>;
  dateFormat?: string;
  dateTimeFormat?: string;
  defaultCountryCode?: CountryCode;
  holdsPriorityInformation?: boolean;
  isGroupHeaderColumn?: boolean;
  getToolTipWrappedColumnNode?: GetToolTipWrappedColumnNodeFunction<DataRow>;
}

export interface ForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

export type GetRowProps<T = any> = (currentEntity: T) =>
  | Partial<
      MuiTableRowProps & {
        isClickable?: boolean;
        opaque?: boolean;
      }
    >
  | undefined;

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
    | 'getToolTipWrappedColumnNode'
  > {
  columns: Array<TableColumn<DataRow>>;
  row: DataRow;
  getRowProps?: GetRowProps;
  onClickRow?: (currentEntity: DataRow) => void;
  minColumnWidth?: number;
  defaultDateFormat?: string;
  defaultDateTimeFormat?: string;
  controlZIndex?: boolean;

  /**
   * If true, the table row will be memoized
   */
  optimizeRendering?: boolean;
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
      | 'minColumnWidth'
      | 'noWrap'
      | 'onClickRow'
      | 'textTransform'
      | 'getToolTipWrappedColumnNode'
      | 'controlZIndex'
    >,
    Partial<
      Pick<
        TableColumnToggleIconButtonProps<DataRow>,
        'selectedColumnIds' | 'onChangeSelectedColumnIds'
      >
    > {
  rows?: DataRow[];
  rowStartIndex?: number;
  labelPlural?: string;
  labelSingular?: string;
  lowercaseLabelPlural?: string;
  emptyRowsLabel?: ReactNode;
  variant?: TableVariant;
  bordersVariant?: TableBordersVariant;
  forEachRowProps?: GetRowProps<DataRow>;
  showHeaderRow?: boolean;
  showDataRows?: boolean;
  HeaderRowProps?: Partial<MuiTableRowProps>;
  SecondaryHeaderRowProps?: Partial<MuiTableRowProps>;
  currencyCode?: string;
  stickyHeader?: boolean;
  TableBodyRowPlaceholderProps?: Partial<RenderIfVisibleProps>;
  TableHeadProps?: Partial<TableHeadProps>;
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
  scrollableElementRef?: RefObject<HTMLElement | null>;

  //#region Sort props
  sortable?: boolean;
  handleSortOperations?: boolean;
  sortBy?: SortBy<DataRow>;
  onChangeSortBy?: (sortOptions: SortOptions<DataRow>) => void;
  //#endregion

  //#region Removable columns
  enableColumnDisplayToggle?: boolean;
  ColumnDisplayToggleProps?: Partial<BoxProps>;
  //#endregion

  //#region Checkboxes
  enableCheckboxRowSelectors?: boolean;
  enableCheckboxAllRowSelector?: boolean;
  allRowsChecked?: boolean;
  checkedRowIds?: string[];
  onChangeCheckedRowIds?: (
    checkedRowIds: string[],
    allRowsChecked: boolean
  ) => void;
  //#endregion

  //#region Sticky columns
  startStickyColumnIndex?: number;
  showStartStickyColumnDivider?: boolean;
  endStickyColumnIndex?: number;
  showEndStickyColumnDivider?: boolean;
  //#endregion

  staticRows?: DataRow[];
  onChangeMinWidth?: (minWidth?: number) => void;

  lazyRows?: boolean;
  highlightRowOnHover?: boolean;

  tableBodyRowHeight?: number;

  /** An optional ID for the table component. */
  id?: string;

  /** A boolean indicating whether to clear the search state when the component unmounts. */
  clearSearchStateOnUnmount?: boolean;

  /**
   * If true, the table rows will be memoized
   */
  optimizeRendering?: boolean;
}

export const tableSearchParamValidationSpec = {
  selectedColumns: Yup.array().of(Yup.string().required()),
};
