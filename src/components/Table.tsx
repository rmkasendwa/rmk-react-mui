import { Tooltip } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer, {
  TableContainerProps,
} from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow, {
  TableRowProps,
  tableRowClasses,
} from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { SxProps } from '@mui/system/styleFunctionSx';
import {
  CSSProperties,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../contexts/GlobalConfigurationContext';
import {
  ITableColumn,
  ITableRowProps,
  TGetRowProps,
} from '../interfaces/Table';
import { getColumnWidthStyles } from '../utils/Table';
import RenderIfVisible from './RenderIfVisible';
import TableBodyRow from './TableBodyRow';

export type {
  IForEachDerivedColumnConfiguration,
  ITableColumn,
  ITableColumnEnumValue,
} from '../interfaces/Table';

export interface ITableProps<T = any>
  extends Partial<Omit<BoxProps, 'ref'>>,
    Pick<
      ITableRowProps<T>,
      | 'columns'
      | 'forEachDerivedColumn'
      | 'generateRowData'
      | 'decimalPlaces'
      | 'labelTransform'
      | 'onClickRow'
    > {
  rows: T[];
  rowStartIndex?: number;
  rowsPerPage?: number;
  pageIndex?: number;
  totalRowCount?: number;
  labelPlural?: string;
  lowercaseLabelPlural?: string;
  variant?: 'stripped' | 'plain';
  onChangePage?: (pageIndex: number) => void;
  forEachRowProps?: TGetRowProps;
  paging?: boolean;
  showHeaderRow?: boolean;
  showDataRows?: boolean;
  HeaderRowProps?: TableRowProps;
  currencyCode?: string;
  TableContainerProps?: Partial<TableContainerProps>;
  paginationType?: 'default' | 'classic';
  PaginationProps?: PaginationProps;
  stickyHeader?: boolean;
}

export const Table = forwardRef<HTMLDivElement, ITableProps>(function Table(
  {
    onClickRow,
    columns: columnsProp,
    rows,
    totalRowCount,
    rowStartIndex = 0,
    labelPlural = 'Records',
    lowercaseLabelPlural,
    rowsPerPage: rowsPerPageProp = 10,
    pageIndex: pageIndexProp = 0,
    onChangePage,
    forEachDerivedColumn,
    forEachRowProps,
    generateRowData,
    variant = 'plain',
    paging = true,
    showHeaderRow = true,
    showDataRows = true,
    HeaderRowProps = {},
    currencyCode,
    decimalPlaces,
    labelTransform,
    TableContainerProps = {},
    paginationType = 'default',
    PaginationProps = {},
    stickyHeader = false,
    ...rest
  },
  ref
) {
  const { sx: tableContainerPropsSx, ...tableContainerPropsRest } =
    TableContainerProps;
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());

  const { palette } = useTheme();
  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { currencyCode: defaultCurrencyCode } = useContext(
    GlobalConfigurationContext
  );
  currencyCode || (currencyCode = defaultCurrencyCode);

  // Setting default column properties
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
    return totalRowCount || !paging
      ? rows
      : rows.slice(
          pageIndex * rowsPerPage,
          pageIndex * rowsPerPage + rowsPerPage
        );
  }, [pageIndex, paging, rows, rowsPerPage, totalRowCount]);

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
        [`& tr.${tableRowClasses.root}.even:not(:hover)`]: {
          backgroundColor: alpha(palette.text.primary, 0.04),
        },
        [`& td.${tableCellClasses.root}:nth-of-type(even)`]: {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
      });
      break;
  }

  return (
    <Box ref={ref} {...rest}>
      <TableContainer
        {...tableContainerPropsRest}
        sx={{
          height: '100%',
          ...(() => {
            const tableContainerStyles: CSSProperties = {};
            if (paging && pageRows.length > 0) {
              tableContainerStyles.height = 'calc(100% - 52px)';
            }
            return tableContainerStyles;
          })(),
          ...tableContainerPropsSx,
        }}
      >
        <MuiTable stickyHeader={stickyHeader}>
          {showHeaderRow ? (
            <TableHead>
              <TableRow {...restHeaderRowProps} sx={{ ...headerRowPropsSx }}>
                {columns.map((column) => {
                  const { id, align, style, sx } = column;
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
                        ...sx,
                      }}
                    >
                      <Tooltip title={<>{label}</>}>
                        <Typography
                          sx={{ fontWeight: 'bold', fontSize: 12 }}
                          noWrap
                        >
                          {label}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
          ) : null}
          {showDataRows ? (
            <TableBody sx={bodyStyles}>
              {(() => {
                if (pageRows.length > 0) {
                  return pageRows.map((row, index) => {
                    const classNames = [];
                    const rowNumber = rowStartIndex + 1 + index;
                    if (rowNumber % 2 === 0) {
                      classNames.push('even');
                    } else {
                      classNames.push('odd');
                    }
                    return (
                      <RenderIfVisible
                        key={
                          row.currentEntity?.key ??
                          row.currentEntity?.id ??
                          index
                        }
                        component="tr"
                        displayPlaceholder={false}
                        unWrapChildrenIfVisible
                        sx={{
                          height: 50,
                        }}
                      >
                        <TableBodyRow
                          {...{
                            columns,
                            row,
                            forEachDerivedColumn,
                            decimalPlaces,
                            labelTransform,
                            onClickRow,
                            generateRowData,
                          }}
                          getRowProps={forEachRowProps}
                          className={classNames.join(' ')}
                        />
                      </RenderIfVisible>
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
          ) : null}
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
    </Box>
  );
});

export default Table;
