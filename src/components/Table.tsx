import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow, { TableRowProps } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { SxProps } from '@mui/system/styleFunctionSx';
import { format } from 'date-fns';
import {
  CSSProperties,
  FC,
  ReactNode,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../contexts/GlobalConfigurationContext';
import { formatDate } from '../utils/dates';
import { addThousandCommas } from '../utils/numbers';

export type ITableColumnEnumValue =
  | {
      id: string;
      label: string;
    }
  | string;

export interface ITableColumn {
  id: string;
  label: ReactNode;
  type?:
    | 'boolean'
    | 'checkbox'
    | 'currency'
    | 'currencyInput'
    | 'date'
    | 'dateInput'
    | 'dateTime'
    | 'dropdownInput'
    | 'enum'
    | 'id'
    | 'input'
    | 'number'
    | 'numberInput'
    | 'percentage'
    | 'percentageInput'
    | 'phoneNumber'
    | 'phonenumberInput'
    | 'rowAdder'
    | 'time'
    | 'tool';
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
  style?: CSSProperties;
  isDerivedColumn?: boolean;
  noHeaderTextAfter?: boolean;
  headerTextAfter?: ReactNode;
  enumValues?: ITableColumnEnumValue[];
  searchKeyMapper?: (displayingColumnValue: string) => any;
  columnClassName?: string;
  locked?: boolean;
  defaultValue?: ReactNode;
  postProcessor?: (
    columnValue: ReactNode,
    row: any,
    column: ITableColumn
  ) => ReactNode;
}

export interface IForEachDerivedColumnConfiguration<T> {
  key: string;
  currentEntity: T;
}

const getColumnWidthStyles = ({
  width,
  minWidth,
}: ITableColumn): { width?: number; minWidth: number; maxWidth: number } => {
  return {
    width,
    minWidth: minWidth || width || 70,
    maxWidth: width || 180,
  };
};

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

export interface ITableProps<T = any> {
  columns: Array<ITableColumn>;
  rows: T[];
  rowsPerPage?: number;
  pageIndex?: number;
  totalRowCount?: number;
  labelPlural?: string;
  lowercaseLabelPlural?: string;
  variant?: 'stripped' | 'plain';
  onClickRow?: (listItem: T, index: number) => void;
  onChangePage?: (pageIndex: number) => void;
  forEachDerivedColumn?: (
    config: IForEachDerivedColumnConfiguration<T>
  ) => ReactNode | null | undefined;
  forEachRowProps?: (currentEntity: T) => TableRowProps;
  paging?: boolean;
  showHeaderRow?: boolean;
  HeaderRowProps?: TableRowProps;
  currencyCode?: string;
  decimalPlaces?: number;
  labelTransform?: boolean;
  paginationType?: 'default' | 'classic';
  PaginationProps?: PaginationProps;
}

export const Table: FC<ITableProps> = ({
  onClickRow,
  columns: columnsProp,
  rows,
  totalRowCount,
  labelPlural = 'Records',
  lowercaseLabelPlural,
  rowsPerPage: rowsPerPageProp = 10,
  pageIndex: pageIndexProp = 0,
  onChangePage,
  forEachDerivedColumn,
  forEachRowProps,
  variant = 'plain',
  paging = true,
  showHeaderRow = true,
  HeaderRowProps = {},
  currencyCode,
  decimalPlaces,
  labelTransform,
  paginationType = 'default',
  PaginationProps = {},
}) => {
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());

  const { palette } = useTheme();
  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { currencyCode: defaultCurrencyCode } = useContext(
    GlobalConfigurationContext
  );
  currencyCode || (currencyCode = defaultCurrencyCode);

  const columns = useMemo(() => {
    return columnsProp.map((column): ITableColumn => {
      const nextColumn = { ...column };
      switch (nextColumn.type) {
        case 'date':
        case 'time':
          nextColumn.width || (nextColumn.width = 120);
          break;
        case 'enum':
          nextColumn.width || (nextColumn.width = 150);
          break;
        case 'currency':
        case 'percentage':
        case 'number':
          nextColumn.align = 'right';
          if (!nextColumn.noHeaderTextAfter) {
            switch (nextColumn.type) {
              case 'currency':
                if (currencyCode) {
                  nextColumn.headerTextAfter = ` (${currencyCode})`;
                }
                break;
              case 'percentage':
                nextColumn.headerTextAfter = ' (%)';
                break;
            }
          }
          break;
        case 'boolean':
          nextColumn.align = 'center';
          nextColumn.enumValues = ['Yes', 'No'];
          nextColumn.width || (nextColumn.width = 120);
          nextColumn.searchKeyMapper ||
            (nextColumn.searchKeyMapper = (searchValue) =>
              searchValue === 'Yes');
          break;
        case 'id':
          nextColumn.align = 'center';
          nextColumn.width || (nextColumn.width = 100);
          break;
        case 'phoneNumber':
          nextColumn.width || (nextColumn.width = 195);
          nextColumn.columnClassName = 'phone-number-column';
          break;
        case 'currencyInput':
          nextColumn.align = 'right';
          if (currencyCode) {
            nextColumn.headerTextAfter = ` (${currencyCode})`;
          }
          break;
        case 'tool':
        case 'checkbox':
          nextColumn.locked = true;
          nextColumn.align = 'center';
          break;
      }
      return nextColumn;
    });
  }, [columnsProp, currencyCode]);

  const pageRows = useMemo(() => {
    const allowedDataTypes = ['number', 'string', 'boolean'];
    const pageRows =
      totalRowCount || !paging
        ? rows
        : rows.slice(
            pageIndex * rowsPerPage,
            pageIndex * rowsPerPage + rowsPerPage
          );

    const nextFormattedRows = pageRows.map((row) => {
      return columns.reduce(
        (accumulator, column) => {
          const { type, id, defaultValue, postProcessor, isDerivedColumn } =
            column;
          let columnValue = (() => {
            if (isDerivedColumn && forEachDerivedColumn) {
              return forEachDerivedColumn({
                key: id,
                currentEntity: row,
              });
            }
            return row[id];
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
          } else if (allowedDataTypes.includes(typeof columnValue)) {
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
                // TODO: Implement this
                break;
              case 'enum':
                if (labelTransform !== false) {
                  columnValue = String(columnValue).toTitleCase(true);
                }
                break;
              case 'boolean':
                columnValue = columnValue ? 'Yes' : 'No';
                break;
            }
          } else if (!columnValue) {
            columnValue = defaultValue || <>&nbsp;</>;
          }
          if (postProcessor) {
            columnValue = postProcessor(columnValue, row, column);
          }
          accumulator[id] = columnValue;
          return accumulator;
        },
        {
          currentEntity: row,
          rowProps: (() => {
            if (forEachRowProps) {
              return forEachRowProps(row);
            }
            return {};
          })(),
        } as Record<string, TableRowProps>
      );
    });
    return nextFormattedRows;
  }, [
    columns,
    decimalPlaces,
    forEachDerivedColumn,
    forEachRowProps,
    labelTransform,
    pageIndex,
    paging,
    rows,
    rowsPerPage,
    totalRowCount,
  ]);

  useEffect(() => {
    setPageIndex(pageIndexProp);
  }, [pageIndexProp]);

  useEffect(() => {
    setRowsPerPage(rowsPerPageProp);
  }, [rowsPerPageProp]);

  const handleChangePage = (e: any, newPage: number) => {
    setPageIndex(newPage);
    onChangePage && onChangePage(newPage);
  };

  const bodyStyles: SxProps<Theme> = {
    '& tr.MuiTableRow-hover:hover': {
      backgroundColor: alpha(palette.primary.main, 0.1),
    },
  };
  switch (variant) {
    case 'plain':
      break;
    case 'stripped':
      Object.assign(bodyStyles, {
        '& tr.MuiTableRow-root:nth-of-type(even):not(:hover)': {
          backgroundColor: alpha(palette.text.primary, 0.04),
        },
        '& td.MuiTableCell-root:nth-of-type(even)': {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
      });
      break;
  }

  const tableContainerStyles: CSSProperties = {};
  if (paging && pageRows.length > 0) {
    tableContainerStyles.height = 'calc(100% - 52px)';
  }

  return (
    <>
      <TableContainer sx={tableContainerStyles}>
        <MuiTable stickyHeader aria-label="sticky table">
          {showHeaderRow ? (
            <TableHead>
              <TableRow
                {...restHeaderRowProps}
                sx={{ textTransform: 'uppercase', ...headerRowPropsSx }}
              >
                {columns.map((column) => {
                  const { id, align, style } = column;
                  let label = column.label;
                  column.headerTextAfter &&
                    (label = (
                      <>
                        {label} {column.headerTextAfter}
                      </>
                    ));
                  return (
                    <TableCell
                      key={id}
                      align={align}
                      sx={{
                        fontWeight: 'bold',
                        px: 3,
                        ...getColumnWidthStyles(column),
                        ...style,
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 'bold', fontSize: 12 }}
                        noWrap
                      >
                        {label}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
          ) : null}
          <TableBody sx={bodyStyles}>
            {(() => {
              if (pageRows.length > 0) {
                return pageRows.map((row, index) => {
                  const { sx, ...restRowProps }: TableRowProps = row.rowProps;
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      {...restRowProps}
                      tabIndex={-1}
                      key={index}
                      onClick={() => {
                        onClickRow && onClickRow(row.currentEntity, index);
                      }}
                      sx={{
                        verticalAlign: 'top',
                        cursor: onClickRow ? 'pointer' : 'default',
                        ...sx,
                      }}
                    >
                      {columns.map((column) => {
                        const { id, align = 'left', style } = column;
                        const columnValue = row[column.id];
                        return (
                          <TableCell
                            key={id}
                            align={align}
                            sx={{
                              py: 1.8,
                              px: 3,
                              ...getColumnWidthStyles(column),
                              ...style,
                            }}
                          >
                            {(() => {
                              if (isValidElement(columnValue)) {
                                return (
                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems={
                                      ({ left: 'start', right: 'end' } as any)[
                                        align
                                      ] || align
                                    }
                                  >
                                    {columnValue}
                                  </Box>
                                );
                              }
                              return columnValue;
                            })()}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                });
              }
              return (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <Typography variant="body2">
                      No {lowercaseLabelPlural} found
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {(() => {
        if (paging && pageRows.length > 0) {
          if (paginationType === 'classic') {
            return (
              <Grid
                container
                spacing={3}
                sx={{ height: 40, alignItems: 'center', pl: 3 }}
              >
                <Grid item>
                  <Typography variant="body2" sx={{ lineHeight: '40px' }}>
                    {rows.length} {labelPlural}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" sx={{ lineHeight: '40px' }}>
                    Display {rowsPerPage} {lowercaseLabelPlural} per page
                  </Typography>
                </Grid>
                <Grid item xs />
                <Grid item>
                  <Pagination
                    count={Math.ceil(
                      (totalRowCount || rows.length) / rowsPerPage
                    )}
                    page={pageIndex + 1}
                    onChange={(e, pageNumber) => {
                      handleChangePage(e, pageNumber - 1);
                    }}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    {...PaginationProps}
                  />
                </Grid>
              </Grid>
            );
          }
          return (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalRowCount || rows.length}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(+event.target.value);
              }}
              page={pageIndex}
              onPageChange={handleChangePage}
              showFirstButton
              showLastButton
            />
          );
        }
      })()}
    </>
  );
};

export default Table;
