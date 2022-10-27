import Grid, { GridProps } from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { forwardRef } from 'react';

export interface DataTablePaginationProps extends GridProps {
  filteredCount: number;
  totalCount: number;
  labelPlural: string;
  lowercaseLabelPlural?: string;
  labelSingular?: string;
  limit?: number;
  offset?: number;
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
    limit,
    offset,
    PaginationProps,
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
        fontSize: 12,
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
      {limit != null ? (
        <Grid item>
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
            Show {limit} {lowercaseLabelPlural} per page
          </Typography>
        </Grid>
      ) : null}
      <Grid item xs />
      {limit != null && offset != null ? (
        <Grid item>
          <Pagination
            count={Math.ceil(totalCount / limit)}
            page={offset + 1}
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
