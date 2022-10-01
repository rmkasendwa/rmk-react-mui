import { Stack } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import { PaginationProps } from '@mui/material/Pagination';
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
  ReactElement,
  Ref,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../contexts/GlobalConfigurationContext';
import {
  IBaseTableRow,
  ITableColumn,
  ITableRowProps,
  TGetRowProps,
} from '../interfaces/Table';
import { getColumnWidthStyles, getTableMinWidth } from '../utils/Table';
import DataTablePagination from './DataTablePagination';
import RenderIfVisible, { IRenderIfVisibleProps } from './RenderIfVisible';
import TableBodyRow from './TableBodyRow';

export type {
  IForEachDerivedColumnConfiguration,
  ITableColumn,
  ITableColumnEnumValue,
} from '../interfaces/Table';

export type TTableVariant =
  | 'stripped'
  | 'stripped-rows'
  | 'stripped-columns'
  | 'plain';

export interface ITableProps<T = any>
  extends Partial<Pick<BoxProps, 'sx'>>,
    Pick<
      ITableRowProps<T>,
      | 'columns'
      | 'forEachDerivedColumn'
      | 'generateRowData'
      | 'decimalPlaces'
      | 'labelTransform'
      | 'onClickRow'
      | 'defaultValue'
    > {
  rows: T[];
  rowStartIndex?: number;
  rowsPerPage?: number;
  pageIndex?: number;
  totalRowCount?: number;
  labelPlural?: string;
  labelSingular?: string;
  lowercaseLabelPlural?: string;
  variant?: TTableVariant;
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
  TableBodyRowPlaceholderProps?: Partial<IRenderIfVisibleProps>;
}

const BaseTable = <T extends IBaseTableRow>(
  {
    onClickRow,
    columns: columnsProp,
    rows,
    totalRowCount,
    rowStartIndex = 0,
    labelPlural = 'Records',
    labelSingular,
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
    TableBodyRowPlaceholderProps = {},
    defaultValue,
    sx,
    ...rest
  }: ITableProps<T>,
  ref: Ref<HTMLDivElement>
) => {
  const { sx: tableContainerPropsSx, ...tableContainerPropsRest } =
    TableContainerProps;
  const {
    sx: tableBodyRowPlaceholderPropsSx,
    ...tableBodyRowPlaceholderPropsRest
  } = TableBodyRowPlaceholderProps;
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

  const minWidth = useMemo(() => {
    return getTableMinWidth(columns);
  }, [columns]);

  const pageRows: typeof rows = useMemo(() => {
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
        [`& tr.${tableRowClasses.root}.odd:not(:hover)`]: {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
        [`& td.${tableCellClasses.root}:nth-of-type(odd)`]: {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
      });
      break;
    case 'stripped-rows':
      Object.assign(bodyStyles, {
        [`& tr.${tableRowClasses.root}.odd:not(:hover)`]: {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
      });
      break;
    case 'stripped-columns':
      Object.assign(bodyStyles, {
        [`& td.${tableCellClasses.root}:nth-of-type(odd)`]: {
          backgroundColor: alpha(palette.text.primary, 0.02),
        },
      });
      break;
  }

  return (
    <Box ref={ref} {...rest} sx={{ minWidth, ...sx }}>
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
        <MuiTable
          stickyHeader={stickyHeader}
          sx={{
            tableLayout: 'fixed',
          }}
        >
          {showHeaderRow ? (
            <TableHead>
              <TableRow {...restHeaderRowProps} sx={{ ...headerRowPropsSx }}>
                {columns.map((column, index) => {
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
                        pl: align === 'center' || index <= 0 ? 3 : 1.5,
                        pr: 3,
                        py: 1.5,
                        ...getColumnWidthStyles(column),
                        ...style,
                        ...sx,
                        position: stickyHeader ? 'sticky' : 'relative',
                      }}
                    >
                      {label ? (
                        <>
                          <Typography
                            component="div"
                            variant="body2"
                            sx={{ fontWeight: 'bold' }}
                            noWrap
                          >
                            {label}
                          </Typography>
                          <Stack
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              height: '100%',
                              fontSize: 10,
                              lineHeight: 1,
                            }}
                          >
                            <Box
                              sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'end',
                                px: 0.8,
                                color: alpha(palette.text.primary, 0.1),
                              }}
                            >
                              <span>&#9650;</span>
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'start',
                                px: 0.8,
                                color: alpha(palette.text.primary, 0.1),
                              }}
                            >
                              <span>&#9660;</span>
                            </Box>
                          </Stack>
                        </>
                      ) : null}
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
                        {...tableBodyRowPlaceholderPropsRest}
                        key={row.id}
                        component="tr"
                        displayPlaceholder={false}
                        unWrapChildrenIfVisible
                        sx={{
                          height: 50,
                          ...tableBodyRowPlaceholderPropsSx,
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
                            defaultValue,
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
              <DataTablePagination
                {...{
                  labelPlural,
                  labelSingular,
                  lowercaseLabelPlural,
                }}
                filteredCount={rows.length}
                totalCount={rows.length}
                limit={rowsPerPage}
                offset={pageIndex}
                PaginationProps={{
                  ...PaginationProps,
                  onChange: (e, pageNumber) => {
                    handleChangePage(e, pageNumber - 1);
                  },
                }}
              />
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
};

export const Table = forwardRef(BaseTable) as <T>(
  p: ITableProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;
export default Table;
