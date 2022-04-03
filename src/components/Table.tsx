import 'datejs';

import {
  Grid,
  Table as MuiTable,
  Pagination,
  PaginationProps,
  SxProps,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableRowProps,
  Theme,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CSSProperties,
  FC,
  ReactNode,
  isValidElement,
  useContext,
  useEffect,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../contexts';
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

export interface IForEachDerivedColumnConfiguration {
  key: string;
  currentEntity: any;
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

export interface ITableProps {
  columns: Array<ITableColumn>;
  rows: Array<any>;
  rowsPerPage?: number;
  pageIndex?: number;
  totalRowCount?: number;
  labelPlural?: string;
  lowercaseLabelPlural?: string;
  variant?: 'stripped' | 'plain';
  onClickRow?: (listItem: any, index: number) => void;
  onChangePage?: (pageIndex: number) => void;
  forEachDerivedColumn?: (
    config: IForEachDerivedColumnConfiguration
  ) => ReactNode | null | undefined;
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

  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columns, setColumns] = useState<ITableColumn[]>([]);
  const [formattedRows, setFormattedRows] = useState<Array<any>>([]);
  const { currencyCode: defaultCurrencyCode } = useContext(
    GlobalConfigurationContext
  );
  currencyCode || (currencyCode = defaultCurrencyCode);

  useEffect(() => {
    setPageIndex(pageIndexProp);
  }, [pageIndexProp]);

  useEffect(() => {
    setColumns(() => {
      const nextColumns = columnsProp.map((column) => {
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
      return nextColumns;
    });
  }, [columnsProp, currencyCode]);

  useEffect(() => {
    setFormattedRows(() => {
      const allowedDataTypes = ['number', 'string', 'boolean'];
      const nextFormattedRows = rows.map((row) => {
        const nextRow = { ...row };
        columns.forEach((column) => {
          const { type, id, defaultValue, postProcessor } = column;
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
            (isValidElement(nextRow[id]) ||
              allowedDataTypes.includes(typeof nextRow[id])) &&
            nextRow[id] !== ''
          ) {
            switch (type) {
              case 'date':
                nextRow[id] = formatDate(nextRow[id]);
                break;
              case 'dateTime':
                nextRow[id] = formatDate(nextRow[id], true);
                break;
              case 'time':
                const date = new Date(nextRow[id]);
                nextRow[id] = isNaN(date.getTime())
                  ? ''
                  : date.toString('hh:mm tt');
                break;
              case 'currency':
              case 'percentage':
                nextRow[id] = parseFloat(nextRow[id]);
                nextRow[id] = addThousandCommas(
                  nextRow[id],
                  decimalPlaces || true
                );
                break;
              case 'number':
                nextRow[id] = addThousandCommas(nextRow[id]);
                break;
              case 'phoneNumber':
                // TODO: Implement this
                break;
              case 'enum':
                if (labelTransform !== false) {
                  nextRow[id] = String(nextRow[id]).toTitleCase(true);
                }
                break;
              case 'boolean':
                nextRow[id] = nextRow[id] ? 'Yes' : 'No';
                break;
            }
          } else {
            nextRow[id] = defaultValue || <>&nbsp;</>;
          }
          if (postProcessor) {
            nextRow[id] = postProcessor(nextRow[id], row, column);
          }
        });
        return nextRow;
      });
      return nextFormattedRows;
    });
  }, [columns, decimalPlaces, labelTransform, rows]);

  useEffect(() => {
    setRowsPerPage(rowsPerPageProp);
  }, [rowsPerPageProp]);

  const handleChangePage = (e: any, newPage: number) => {
    setPageIndex(newPage);
    onChangePage && onChangePage(newPage);
  };

  const pageRows =
    totalRowCount || !paging
      ? formattedRows
      : formattedRows.slice(
          pageIndex * rowsPerPage,
          pageIndex * rowsPerPage + rowsPerPage
        );

  const theme = useTheme();

  const bodyStyles: SxProps<Theme> = {
    '& tr.MuiTableRow-hover:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  };
  switch (variant) {
    case 'plain':
      break;
    case 'stripped':
      Object.assign(bodyStyles, {
        '& tr.MuiTableRow-root:nth-of-type(even):not(:hover)': {
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
        },
        '& td.MuiTableCell-root:nth-of-type(even)': {
          backgroundColor: alpha(theme.palette.text.primary, 0.02),
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
                  const sx: CSSProperties = { verticalAlign: 'top' };
                  onClickRow && (sx.cursor = 'pointer');
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={index}
                      onClick={() => {
                        onClickRow && onClickRow(row, index);
                      }}
                      sx={sx}
                    >
                      {columns.map((column) => {
                        const { id, align, style, isDerivedColumn } = column;
                        const value = (() => {
                          if (isDerivedColumn && forEachDerivedColumn) {
                            return forEachDerivedColumn({
                              key: id,
                              currentEntity: row,
                            });
                          }
                          return row[column.id];
                        })();
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
                            {value}
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
