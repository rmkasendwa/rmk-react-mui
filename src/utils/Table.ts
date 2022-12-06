import { TableColumn, TableColumnType } from '../interfaces/Table';
import { PrimitiveDataType } from '../interfaces/Utils';

/**
 * Gets the table column element widths.
 *
 * @param options Table column.
 * @returns Table column element widths.
 */
export const getColumnWidthStyles = ({ width, minWidth }: TableColumn) => {
  return {
    width,
    minWidth: (() => {
      if (minWidth) {
        if (width && width < minWidth) {
          return width;
        }
        return minWidth;
      }
      return 100;
    })(),
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
    return accumulator + getColumnWidthStyles(tableColumn).minWidth;
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
