import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Stack,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import TableRow, {
  TableRowProps as MuiTableRowProps,
} from '@mui/material/TableRow';
import clsx from 'clsx';
import { Fragment, useEffect, useMemo, useRef } from 'react';

import { BaseDataRow, TableRowProps } from '../../interfaces/Table';
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

export interface TableBodyRowProps<T extends Record<string, any> = any>
  extends Partial<Omit<MuiTableRowProps, 'defaultValue'>>,
    TableRowProps<T> {
  enableSmallScreenOptimization?: boolean;
}

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

export const TableBodyRow = <T extends BaseDataRow>(
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
    defaultDateFormat,
    defaultDateTimeFormat,
    defaultCountryCode: rowDefaultCountryCode,
    noWrap: rowNoWrap,
    enableSmallScreenOptimization = true,
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

  const { components, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { rowProps } = useMemo(() => {
    return {
      rowProps: (() => {
        if (getRowPropsRef.current) {
          return getRowPropsRef.current(row) || {};
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

  if (enableSmallScreenOptimization && isSmallScreenSize) {
    const [column, ...restColumns] = columns;
    const {
      id,
      sx,
      propagateClickToParentRowClickEvent = true,
      decimalPlaces = rowDecimalPlaces,
      textTransform = rowTextTransform,
      defaultColumnValue = rowDefaultColumnValue,
      editable = rowEditable,
      dateFormat = defaultDateFormat,
      dateTimeFormat = defaultDateTimeFormat,
      defaultCountryCode = rowDefaultCountryCode,
      noWrap = rowNoWrap,
    } = column;
    const ellipsisMenuToolColumn = restColumns.find(({ type }) => {
      return type === 'ellipsisMenuTool';
    });
    return (
      <Grid
        {...rest}
        className={clsx(classes.root)}
        container
        sx={{
          alignItems: 'center',
          cursor: onClickRow ? 'pointer' : 'inherit',
          p: 2,
        }}
      >
        <Grid item xs>
          <Stack
            sx={{
              gap: 1,
            }}
          >
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
                dateFormat,
                dateTimeFormat,
                defaultCountryCode,
                noWrap,
                sx,
                enableSmallScreenOptimization,
              }}
              {...column}
              onClick={() => {
                propagateClickToParentRowClickEvent &&
                  onClickRow &&
                  onClickRow(row);
              }}
              columnTypographyProps={{
                noWrap,
                sx: {
                  fontSize: 16,
                },
              }}
            />
            {(() => {
              if (restColumns.length > 0) {
                return (
                  <Grid
                    container
                    sx={{
                      gap: 1,
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {restColumns.slice(0, 3).map((column, index) => {
                      const {
                        id,
                        sx,
                        propagateClickToParentRowClickEvent = true,
                        decimalPlaces = rowDecimalPlaces,
                        textTransform = rowTextTransform,
                        defaultColumnValue = rowDefaultColumnValue,
                        editable = rowEditable,
                        dateFormat = defaultDateFormat,
                        dateTimeFormat = defaultDateTimeFormat,
                        defaultCountryCode = rowDefaultCountryCode,
                        noWrap = rowNoWrap,
                      } = column;
                      return (
                        <Fragment key={index}>
                          {index > 0 ? (
                            <Grid
                              item
                              sx={{
                                flex: 'none',
                              }}
                            >
                              &bull;
                            </Grid>
                          ) : null}
                          <Grid item>
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
                                dateFormat,
                                dateTimeFormat,
                                defaultCountryCode,
                                noWrap,
                                sx,
                                enableSmallScreenOptimization,
                              }}
                              {...column}
                              onClick={() => {
                                propagateClickToParentRowClickEvent &&
                                  onClickRow &&
                                  onClickRow(row);
                              }}
                            />
                          </Grid>
                        </Fragment>
                      );
                    })}
                  </Grid>
                );
              }
            })()}
          </Stack>
        </Grid>
        {(() => {
          if (ellipsisMenuToolColumn) {
            const {
              id,
              sx,
              propagateClickToParentRowClickEvent = true,
              decimalPlaces = rowDecimalPlaces,
              textTransform = rowTextTransform,
              defaultColumnValue = rowDefaultColumnValue,
              editable = rowEditable,
              dateFormat = defaultDateFormat,
              dateTimeFormat = defaultDateTimeFormat,
              defaultCountryCode = rowDefaultCountryCode,
              noWrap = rowNoWrap,
            } = ellipsisMenuToolColumn;
            return (
              <Grid item>
                <TableBodyColumn
                  key={String(id)}
                  {...({} as any)}
                  {...{
                    row,
                    columnTypographyProps,
                    decimalPlaces,
                    textTransform,
                    defaultColumnValue,
                    editable,
                    dateFormat,
                    dateTimeFormat,
                    defaultCountryCode,
                    noWrap,
                    sx,
                    enableSmallScreenOptimization,
                  }}
                  {...ellipsisMenuToolColumn}
                  column={ellipsisMenuToolColumn}
                  onClick={() => {
                    propagateClickToParentRowClickEvent &&
                      onClickRow &&
                      onClickRow(row);
                  }}
                />
              </Grid>
            );
          }
        })()}
      </Grid>
    );
  }

  return (
    <TableRow
      {...rowPropsRest}
      {...rest}
      className={clsx(classes.root)}
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
          dateFormat = defaultDateFormat,
          dateTimeFormat = defaultDateTimeFormat,
          defaultCountryCode = rowDefaultCountryCode,
          noWrap = rowNoWrap,
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
              dateFormat,
              dateTimeFormat,
              defaultCountryCode,
              noWrap,
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
