import { formatDate } from '@infinite-debugger/rmk-utils/dates';
import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Link,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow, {
  TableRowProps as MuiTableRowProps,
} from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import { isValidElement, useEffect, useMemo, useRef } from 'react';
import * as yup from 'yup';

import { CountryCode } from '../interfaces/Countries';
import { BaseTableRow, TableRowProps } from '../interfaces/Table';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../utils/PhoneNumberUtil';
import { getColumnPaddingStyles, getColumnWidthStyles } from '../utils/Table';
import CountryFieldValue from './CountryFieldValue';
import EllipsisMenuIconButton, {
  EllipsisMenuIconButtonProps,
} from './EllipsisMenuIconButton';

const allowedDataTypes = ['number', 'string', 'boolean'];

const toolTypes = [
  'tool',
  'input',
  'currencyInput',
  'selectInput',
  'dateInput',
  'phoneInput',
  'rowAdder',
  'percentageInput',
  'numberInput',
  'fragment',
  'checkbox',
];

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
    decimalPlaces,
    textTransform = false,
    onClickRow,
    sx,
    defaultColumnValue: baseDefaultColumnValue,
    columnTypographyProps = {},
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

  const { palette, components } = useTheme();

  const formattedRow: any & {
    currentEntity: T;
    rowProps: any;
  } = useMemo(() => {
    return {
      ...columns.reduce(
        (accumulator, column) => {
          const {
            type,
            id,
            defaultColumnValue,
            getColumnValue,
            textTransform: columnTextTransform = false,
          } = column;
          let columnValue = (() => {
            if (getColumnValue) {
              if (type === 'ellipsisMenuTool') {
                const { options, ...rest } =
                  (getColumnValue(
                    row,
                    column
                  ) as EllipsisMenuIconButtonProps) || {};
                if (options && options.length > 0) {
                  return (
                    <Box>
                      <EllipsisMenuIconButton options={options} {...rest} />
                    </Box>
                  );
                }
                return defaultColumnValue;
              }
              return getColumnValue(row, column);
            }
            return (row as any)[id];
          })();
          if (type && toolTypes.includes(type)) {
            switch (type) {
              case 'input':
                // TODO: Implment this
                break;
              case 'currencyInput':
                // TODO: Implment this
                break;
              case 'percentageInput':
                // TODO: Implment this
                break;
              case 'numberInput':
                // TODO: Implment this
                break;
              case 'dropdownInput':
                // TODO: Implment this
                break;
              case 'dateInput':
                // TODO: Implment this
                break;
              case 'phonenumberInput':
                // TODO: Implment this
                break;
              case 'rowAdder':
                // TODO: Implment this
                break;
              case 'checkbox':
                // TODO: Implment this
                break;
            }
          } else if (
            columnValue != null &&
            allowedDataTypes.includes(typeof columnValue)
          ) {
            switch (type) {
              case 'date':
                columnValue = formatDate(columnValue);
                break;
              case 'dateTime':
                columnValue = formatDate(columnValue, true);
                break;
              case 'time':
                const date = new Date(columnValue);
                columnValue = isNaN(date.getTime())
                  ? ''
                  : format(date, 'hh:mm aa');
                break;
              case 'currency':
              case 'percentage':
                columnValue = parseFloat(columnValue);
                columnValue = addThousandCommas(
                  columnValue,
                  decimalPlaces || true
                );
                break;
              case 'number':
                columnValue = addThousandCommas(columnValue);
                break;
              case 'phoneNumber':
                if (typeof columnValue === 'string') {
                  const phoneNumber = isValidPhoneNumber(columnValue);
                  if (phoneNumber) {
                    columnValue = (
                      <Link
                        href={`tel://${columnValue}`}
                        underline="none"
                        color="inherit"
                        noWrap
                        sx={{ display: 'block', maxWidth: '100%' }}
                      >
                        <CountryFieldValue
                          countryCode={
                            PhoneNumberUtil.getRegionCodeForCountryCode(
                              phoneNumber.getCountryCode()!
                            ) as CountryCode
                          }
                          countryLabel={systemStandardPhoneNumberFormat(
                            columnValue
                          )}
                          FieldValueProps={{
                            noWrap: true,
                            sx: {
                              fontWeight: 'normal',
                              whiteSpace: 'nowrap',
                              color: 'inherit',
                            },
                          }}
                        />
                      </Link>
                    );
                  }
                }
                break;
              case 'email':
                if (
                  typeof columnValue === 'string' &&
                  yup.string().email().isValidSync(columnValue)
                ) {
                  columnValue = (
                    <Link
                      href={`mailto:${columnValue}`}
                      underline="hover"
                      color="inherit"
                      noWrap
                      sx={{ display: 'block', maxWidth: '100%' }}
                    >
                      {columnValue}
                    </Link>
                  );
                }
                break;
              case 'enum':
                if (textTransform || columnTextTransform) {
                  columnValue = String(columnValue).toTitleCase(true);
                }
                break;
              case 'boolean':
                columnValue = columnValue ? 'Yes' : 'No';
                break;
            }
          }
          if (columnValue == null) {
            columnValue = defaultColumnValue ?? baseDefaultColumnValue ?? (
              <>&nbsp;</>
            );
          }
          accumulator[id] = columnValue;
          return accumulator;
        },
        {
          currentEntity: row,
          rowProps: (() => {
            if (getRowPropsRef.current) {
              return getRowPropsRef.current(row);
            }
            return {};
          })(),
        } as Record<keyof T, MuiTableRowProps>
      ),
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
  }, [columns, row, decimalPlaces, textTransform, baseDefaultColumnValue]);

  const { sx: rowPropsSx, ...restRowProps }: any = formattedRow.rowProps;
  return (
    <TableRow
      {...restRowProps}
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
          align = 'left',
          sx,
          style,
          onClick,
          onClickColumn,
          bodySx,
          minWidth,
          type,
          className,
          propagateClickToParentRowClickEvent = true,
        } = column;
        const columnValue = formattedRow[column.id];
        return (
          <TableCell
            key={String(id)}
            {...{ style, className }}
            onClick={(event) => {
              onClickColumn && onClickColumn(formattedRow.currentEntity);
              propagateClickToParentRowClickEvent &&
                onClickRow &&
                onClickRow(formattedRow.currentEntity);
              onClick && onClick(event);
            }}
            align={align}
            sx={{
              py: 1,
              px: 3,
              cursor: onClickColumn ? 'pointer' : 'inherit',
              position: 'relative',
              overflow: 'hidden',
              ['&:before']: {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: `calc(100% + 1px)`,
                pointerEvents: 'none',
              },
              ...getColumnPaddingStyles({
                index,
                columnCount: columns.length,
              }),
              ...getColumnWidthStyles({
                ...column,
                minWidth: minWidth ?? minColumnWidth,
              }),
              ...(() => {
                if (type === 'ellipsisMenuTool') {
                  return {
                    bgcolor: palette.background.paper,
                  };
                }
              })(),
              ...sx,
              ...(bodySx as any),
            }}
          >
            {(() => {
              if (isValidElement(columnValue)) {
                return (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems={
                      ({ left: 'start', right: 'end' } as any)[align] || align
                    }
                  >
                    {columnValue}
                  </Box>
                );
              }
              return (
                <Typography
                  component={'div' as any}
                  variant="body2"
                  {...columnTypographyProps}
                >
                  {columnValue}
                </Typography>
              );
            })()}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default TableBodyRow;
