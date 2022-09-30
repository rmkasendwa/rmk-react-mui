import { ITableColumn } from '../interfaces/Table';

export const getColumnWidthStyles = ({
  width,
  minWidth,
}: ITableColumn): { width?: number; minWidth: number; maxWidth: number } => {
  return {
    width,
    minWidth: minWidth || width || 70,
    maxWidth: width || 180,
  };
};

export const getColumnPaddingStyles = ({
  index,
  columnCount,
}: {
  index: number;
  columnCount: number;
}) => {
  return {
    pl: index <= 0 ? 3 : 1.5,
    pr: index >= columnCount - 1 ? 3 : 1.5,
  };
};
