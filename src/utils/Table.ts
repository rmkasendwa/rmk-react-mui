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
