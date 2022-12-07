import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import TableRow, {
  TableRowProps as MuiTableRowProps,
} from '@mui/material/TableRow';
import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';

import { BaseTableRow, TableRowProps } from '../../interfaces/Table';
import {
  getColumnPaddingStyles,
  getColumnWidthStyles,
} from '../../utils/Table';
import TableBodyColumn from './TableBodyColumn';

export interface TableBodyRowClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableBodyRowClassKey = keyof TableBodyRowClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyRow: TableBodyRowProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyRow: keyof TableBodyRowClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyRow?: {
      defaultProps?: ComponentsProps['MuiTableBodyRow'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyRow'];
      variants?: ComponentsVariants['MuiTableBodyRow'];
    };
  }
}

export interface TableBodyRowProps<T = any>
  extends Partial<Omit<MuiTableRowProps, 'defaultValue'>>,
    TableRowProps<T> {}

export function getTableBodyRowUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableBodyRow', slot);
}

export const tableBodyRowClasses: TableBodyRowClasses = generateUtilityClasses(
  'MuiTableBodyRow',
  ['root']
);

const slots = {
  root: ['root'],
};

export const TableBodyRow = <T extends BaseTableRow>(
  inProps: TableBodyRowProps<T>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableBodyRow' });
  const {
    columns,
    row,
    getRowProps,
    generateRowData,
    decimalPlaces: rowDecimalPlaces,
    textTransform: rowTextTransform = false,
    editable: rowEditable,
    onClickRow,
    sx,
    defaultColumnValue: rowDefaultColumnValue,
    columnTypographyProps,
    minColumnWidth,
    className,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTableBodyRowUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  // Refs
  const columnsRef = useRef(columns);
  const getRowPropsRef = useRef(getRowProps);
  const generateRowDataRef = useRef(generateRowData);
  useEffect(() => {
    columnsRef.current = columns;
    getRowPropsRef.current = getRowProps;
    generateRowDataRef.current = generateRowData;
  }, [columns, generateRowData, getRowProps]);

  const { components } = useTheme();

  const { rowProps } = useMemo(() => {
    return {
      rowProps: (() => {
        if (getRowPropsRef.current) {
          return getRowPropsRef.current(row);
        }
        return {};
      })(),
      ...(() => {
        if (generateRowDataRef.current) {
          return Object.fromEntries(
            Object.entries(generateRowDataRef.current(row)).filter(
              ([, value]) => value != null
            )
          );
        }
        return {};
      })(),
    };
  }, [row]);

  const { sx: rowPropsSx, ...rowPropsRest } = rowProps;
  return (
    <TableRow
      {...rowPropsRest}
      {...rest}
      className={clsx(classes.root)}
      tabIndex={-1}
      hover
      sx={{
        verticalAlign: 'top',
        cursor: onClickRow ? 'pointer' : 'inherit',
        ...(components?.MuiTableBodyRow?.styleOverrides?.root as any),
        ...rowPropsSx,
        ...sx,
      }}
    >
      {columns.map((column, index) => {
        const {
          id,
          sx,
          minWidth,
          propagateClickToParentRowClickEvent = true,
          decimalPlaces = rowDecimalPlaces,
          textTransform = rowTextTransform,
          defaultColumnValue = rowDefaultColumnValue,
          editable = rowEditable,
        } = column;
        return (
          <TableBodyColumn
            key={String(id)}
            {...({} as any)}
            {...{
              column,
              row,
              columnTypographyProps,
              decimalPlaces,
              textTransform,
              defaultColumnValue,
              editable,
            }}
            {...column}
            onClick={() => {
              propagateClickToParentRowClickEvent &&
                onClickRow &&
                onClickRow(row);
            }}
            sx={{
              ...getColumnPaddingStyles({
                index,
                columnCount: columns.length,
              }),
              ...getColumnWidthStyles({
                ...column,
                minWidth: minWidth ?? minColumnWidth,
              }),
              ...sx,
            }}
          />
        );
      })}
    </TableRow>
  );
};

export default TableBodyRow;
