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
export const getTableMinWidth = (tableColumns: TableColumn[]) => {
  return tableColumns.reduce((accumulator, tableColumn) => {
    const { minWidth, width } = getColumnWidthStyles(tableColumn);
    return accumulator + (width ?? minWidth);
  }, 0);
};

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
      return 'date';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
};

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
