import { TablePaginationProps, inputBaseClasses } from '@mui/material';
import Grid, { GridProps } from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { forwardRef } from 'react';

import DataDropdownField from './InputFields/DataDropdownField';

export interface DataTablePaginationProps
  extends GridProps,
    Pick<TablePaginationProps, 'rowsPerPageOptions' | 'onRowsPerPageChange'> {
  filteredCount: number;
  totalCount: number;
  page?: number;
  rowsPerPage?: number;
  labelPlural: string;
  lowercaseLabelPlural?: string;
  labelSingular?: string;
  PaginationProps?: Partial<PaginationProps>;
}

export const DataTablePagination = forwardRef<
  HTMLDivElement,
  DataTablePaginationProps
>(function DataTablePagination(
  {
    filteredCount,
    totalCount,
    labelPlural,
    lowercaseLabelPlural,
    labelSingular,
    page,
    PaginationProps,
    rowsPerPageOptions = [10, 25, 50, 100],
    rowsPerPage,
    onRowsPerPageChange,
    sx,
    ...rest
  },
  ref
) {
  labelSingular ?? (labelSingular = labelPlural.replace(/s$/g, ''));
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());

  if (filteredCount <= 0) {
    return null;
  }

  return (
    <Grid
      ref={ref}
      {...rest}
      container
      sx={{
        alignItems: 'center',
        pl: 3,
        pr: 2,
        py: 1,
        gap: 3,
        ...sx,
      }}
    >
      <Grid item>
        {filteredCount === totalCount ? (
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
            {filteredCount} {filteredCount === 1 ? labelSingular : labelPlural}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
            Filtering {filteredCount} out of {totalCount} {labelPlural}
          </Typography>
        )}
      </Grid>
      {rowsPerPage != null ? (
        <Grid item>
          <Typography
            component="div"
            variant="body2"
            sx={{ fontSize: 'inherit' }}
          >
            Show{' '}
            <DataDropdownField
              value={String(rowsPerPage)}
              options={rowsPerPageOptions.map((value) => {
                return {
                  value: String(value),
                  label: String(value),
                };
              })}
              onChange={onRowsPerPageChange}
              WrapperProps={{
                sx: {
                  width: 64,
                  display: 'inline-flex',
                },
              }}
              showClearButton={false}
              searchable={false}
              variant="outlined"
              sx={{
                [`.${inputBaseClasses.root}`]: {
                  py: 0,
                  px: 1,
                },
                [`.${inputBaseClasses.input}`]: {
                  p: 0,
                },
              }}
            />{' '}
            {lowercaseLabelPlural} per page
          </Typography>
        </Grid>
      ) : null}
      <Grid item xs />
      {rowsPerPage != null && page != null ? (
        <Grid item>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page + 1}
            shape="rounded"
            showFirstButton
            showLastButton
            {...PaginationProps}
          />
        </Grid>
      ) : null}
    </Grid>
  );
});

export default DataTablePagination;
