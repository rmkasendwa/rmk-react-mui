import { TableColumn, TableColumnType } from '../interfaces/Table';
import { ExoticDataType, PrimitiveDataType } from '../interfaces/Utils';

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
      case 'ellipsisMenuTool':
        nextColumn.width = 40;
        break;
    }

    const { showHeaderText, label } = nextColumn;
    const extraWidth = (() => {
      if (
        isLastColumn &&
        enableColumnDisplayToggle &&
        showHeaderText &&
        label
      ) {
        return 44;
      }
      return 0;
    })();

    nextColumn.minWidth && (nextColumn.minWidth += extraWidth);
    nextColumn.width && (nextColumn.width += extraWidth);

    return nextColumn;
  });
};
