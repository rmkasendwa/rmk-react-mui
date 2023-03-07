import '@infinite-debugger/rmk-js-extensions/Object';

import { ExoticDataType, PrimitiveDataType } from '../../interfaces/Utils';
import {
  BaseDataRow,
  CHECKBOX_COLUMN_ID,
  ELLIPSIS_MENU_TOOL_COLUMN_ID,
  TableColumn,
  TableColumnType,
  TableProps,
} from './models';

/**
 * Gets the table column element widths.
 *
 * @param options Table column.
 * @returns Table column element widths.
 */
export const getColumnWidthStyles = ({
  width,
  minWidth: inputMinWidth,
}: TableColumn) => {
  const minWidth = (() => {
    if (inputMinWidth) {
      if (width && width < inputMinWidth) {
        return width;
      }
      return inputMinWidth;
    }
    return 100;
  })();
  return {
    width,
    minWidth,
    maxWidth: width || (!minWidth || minWidth < 200 ? 200 : minWidth),
  };
};

export interface GetColumnPaddingStylesOptions {
  /**
   * The column index.
   */
  index: number;
  /**
   * The column count.
   */
  columnCount: number;
}

/**
 * Finds table column horizontal padding.
 *
 * @param options The configuration options.
 * @returns Column horizontal padding.
 */
export const getColumnPaddingStyles = ({
  index,
  columnCount,
}: GetColumnPaddingStylesOptions) => {
  return {
    pl: index <= 0 ? 3 : 1.5,
    pr: index >= columnCount - 1 ? 3 : 1.5,
  };
};

/**
 * Finds the table minimum width.
 *
 * @param tableColumns The table columns.
 * @returns Minimum table width.
 */
export const getTableMinWidth = (
  tableColumns: TableColumn[],
  {
    enableColumnDisplayToggle,
  }: {
    enableColumnDisplayToggle: boolean;
  }
) => {
  return expandTableColumnWidths(tableColumns, {
    enableColumnDisplayToggle,
  }).reduce((accumulator, tableColumn) => {
    const { minWidth, width } = getColumnWidthStyles(tableColumn);
    return accumulator + (width ?? minWidth);
  }, 0);
};

/**
 * Maps table column type to primitive data type.
 *
 * @param columnType The table column type.
 * @returns primitive data type.
 */
export const mapTableColumnTypeToPrimitiveDataType = (
  columnType?: TableColumnType
): PrimitiveDataType => {
  switch (columnType) {
    case 'number':
    case 'numberInput':
    case 'percentage':
    case 'percentageInput':
    case 'currency':
    case 'currencyInput':
      return 'number';
    case 'date':
    case 'time':
    case 'dateTime':
    case 'dateInput':
    case 'timestamp':
      return 'date';
    case 'boolean':
    case 'enum':
      return columnType;
  }
  return 'string';
};

/**
 * Maps table column type to exotic data type.
 *
 * @param columnType The table column type.
 * @returns Exotic data type.
 */
export const mapTableColumnTypeToExoticDataType = (
  columnType?: TableColumnType
): ExoticDataType => {
  switch (columnType) {
    case 'number':
    case 'numberInput':
      return 'number';
    case 'percentage':
    case 'percentageInput':
      return 'percentage';
    case 'currency':
    case 'currencyInput':
      return 'currency';
    default:
      return mapTableColumnTypeToPrimitiveDataType(columnType);
  }
};

/**
 * Adds default widths to table columns.
 *
 * @param tableColumns The table columns.
 * @param param1 Expansion options.
 * @returns Table columns with expanded widths.
 */
export const expandTableColumnWidths = (
  tableColumns: TableColumn[],
  {
    enableColumnDisplayToggle,
  }: {
    enableColumnDisplayToggle: boolean;
  }
) => {
  return tableColumns.map((column, index) => {
    const isLastColumn = index === tableColumns.length - 1;
    const nextColumn = { ...column } as typeof column;
    switch (nextColumn.type) {
      case 'boolean':
        nextColumn.width || (nextColumn.width = 150);
        break;
      case 'id':
        nextColumn.width || (nextColumn.width = 100);
        break;
      case 'phoneNumber':
        nextColumn.width || (nextColumn.width = 195);
        break;
    }

    const {
      showHeaderText,
      label,
      extraWidth: baseExtraWidth = 0,
    } = nextColumn;
    const extraWidth =
      (() => {
        if (
          isLastColumn &&
          enableColumnDisplayToggle &&
          showHeaderText &&
          label
        ) {
          return 44;
        }
        return 0;
      })() + baseExtraWidth;

    nextColumn.minWidth && (nextColumn.minWidth += extraWidth);
    nextColumn.width && (nextColumn.width += extraWidth);

    return nextColumn;
  });
};

export const getComputedTableProps = <DataRow extends BaseDataRow>(
  props: TableProps<DataRow>
) => {
  const fullProps: typeof props = { ...props };
  const {
    columns,
    enableCheckboxRowSelectors,
    showRowNumber,
    getEllipsisMenuToolProps,
  } = fullProps;

  const computedColumns: typeof columns = [];

  if (enableCheckboxRowSelectors) {
    computedColumns.push({
      id: CHECKBOX_COLUMN_ID as any,
      width: 60,
      sortable: false,
      sx: {
        '&,>div': {
          p: 0,
        },
      },
      holdsPriorityInformation: false,
    });
  }

  if (showRowNumber) {
    computedColumns.push({
      id: 'rowNumber' as any,
      label: 'Number',
      width: 60,
      align: 'right',
      showHeaderText: false,
      opaque: true,
      sx: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
      },
      headerSx: {
        zIndex: 5,
      },
      holdsPriorityInformation: false,
    });
  }

  computedColumns.push(...columns);

  if (getEllipsisMenuToolProps) {
    computedColumns.push({
      id: ELLIPSIS_MENU_TOOL_COLUMN_ID as any,
      label: 'Actions',
      showHeaderText: false,
      opaque: true,
      width: 42,
      defaultColumnValue: <>&nbsp;</>,
      propagateClickToParentRowClickEvent: false,
      holdsPriorityInformation: false,
      sx: {
        position: 'sticky',
        p: 0,
        right: 0,
      },
    });
  }

  fullProps.columns = computedColumns;
  fullProps.allPropsComputed = true;

  return fullProps;
};
