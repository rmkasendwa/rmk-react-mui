import {
  Table as MuiTable,
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
import { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';

export interface ITableColumn {
  id: string;
  label: string;
  type?:
    | 'date'
    | 'currency'
    | 'phoneNumber'
    | 'percentage'
    | 'dateTime'
    | 'enum';
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
  style?: CSSProperties;
  isDerivedColumn?: boolean;
}

export interface IForEachDerivedColumnConfiguration {
  key: string;
  currentEntity: any;
}

const getColumnWidthStyles = ({
  width,
  minWidth,
  type,
}: ITableColumn): { width?: number; minWidth: number; maxWidth: number } => {
  switch (type) {
    case 'date':
      width || (width = 130);
      break;
    case 'enum':
      width || (width = 180);
      break;
  }
  return {
    width: width,
    minWidth: minWidth || width || 70,
    maxWidth: width || 180,
  };
};

export interface ITableProps {
  columns: Array<ITableColumn>;
  rows: Array<any>;
  rowsPerPage?: number;
  pageIndex?: number;
  totalRowCount?: number;
  labelPlural?: string;
  variant?: 'stripped' | 'plain';
  onClickRow?: (listItem: any, index: number) => void;
  onChangePage?: (pageIndex: number) => void;
  forEachDerivedColumn?: (
    config: IForEachDerivedColumnConfiguration
  ) => ReactNode | null | undefined;
  paging?: boolean;
  showHeaderRow?: boolean;
  HeaderRowProps?: TableRowProps;
}

export const Table: FC<ITableProps> = ({
  onClickRow,
  columns,
  rows,
  totalRowCount,
  labelPlural = 'records',
  rowsPerPage: rowsPerPageProp = 10,
  pageIndex = 0,
  onChangePage,
  forEachDerivedColumn,
  variant = 'plain',
  paging = true,
  showHeaderRow = true,
  HeaderRowProps = {},
}) => {
  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setRowsPerPage(rowsPerPageProp);
  }, [rowsPerPageProp]);

  const handleChangePage = (e: any, newPage: number) => {
    onChangePage && onChangePage(newPage);
  };

  const pageRows =
    totalRowCount || !paging
      ? rows
      : rows.slice(
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
        '& tr.MuiTableRow-root:nth-child(even):not(:hover)': {
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
        },
        '& td.MuiTableCell-root:nth-child(even)': {
          backgroundColor: alpha(theme.palette.text.primary, 0.02),
        },
      });
      break;
  }

  return (
    <>
      <TableContainer sx={{ height: 'calc(100% - 52px)' }}>
        <MuiTable stickyHeader aria-label="sticky table">
          {showHeaderRow ? (
            <TableHead>
              <TableRow
                {...restHeaderRowProps}
                sx={{ textTransform: 'uppercase', ...headerRowPropsSx }}
              >
                {columns.map((column) => {
                  const { id, align, style } = column;
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
                        {column.label}
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
                      No {labelPlural.toLowerCase()} found
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {paging && pageRows.length > 0 && (
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
      )}
    </>
  );
};

export default Table;
