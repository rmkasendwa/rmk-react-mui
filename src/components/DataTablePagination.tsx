import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  TablePaginationProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  inputBaseClasses,
  useThemeProps,
} from '@mui/material';
import Grid, { GridProps } from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { omit } from 'lodash';
import { forwardRef, useEffect, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import DataDropdownField from './InputFields/DataDropdownField';

export interface DataTablePaginationClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type DataTablePaginationClassKey = keyof DataTablePaginationClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDataTablePagination: DataTablePaginationProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDataTablePagination: keyof DataTablePaginationClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDataTablePagination?: {
      defaultProps?: ComponentsProps['MuiDataTablePagination'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDataTablePagination'];
      variants?: ComponentsVariants['MuiDataTablePagination'];
    };
  }
}

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

export function getDataTablePaginationUtilityClass(slot: string): string {
  return generateUtilityClass('MuiDataTablePagination', slot);
}

export const dataTablePaginationClasses: DataTablePaginationClasses =
  generateUtilityClasses('MuiDataTablePagination', ['root']);

const slots = {
  root: ['root'],
};

export const DataTablePagination = forwardRef<
  HTMLDivElement,
  DataTablePaginationProps
>(function DataTablePagination(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDataTablePagination',
  });
  const {
    className,
    filteredCount,
    totalCount,
    labelPlural,
    page,
    PaginationProps,
    rowsPerPageOptions = [10, 25, 50, 100],
    rowsPerPage,
    onRowsPerPageChange,
    sx,
    ...rest
  } = props;

  let { labelSingular, lowercaseLabelPlural } = props;

  const classes = composeClasses(
    slots,
    getDataTablePaginationUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  labelSingular ?? (labelSingular = labelPlural.replace(/s$/g, ''));
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    if (container) {
      const windowResizeEventCallback = () => {
        setIsSmallScreen(container.offsetWidth <= 960);
      };
      window.addEventListener('resize', windowResizeEventCallback);
      windowResizeEventCallback();
      return () => {
        window.removeEventListener('resize', windowResizeEventCallback);
      };
    }
  }, [container]);

  if (filteredCount <= 0) {
    return null;
  }

  return (
    <Grid
      ref={mergeRefs([
        (container: HTMLDivElement) => {
          setContainer(container);
        },
        ref,
      ])}
      className={clsx(classes.root)}
      {...omit(rest, 'labelSingular', 'lowercaseLabelPlural')}
      container
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
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
              enableLoadingState={false}
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
      {rowsPerPage != null && page != null ? (
        <Grid
          item
          sx={{
            ...(() => {
              if (!isSmallScreen) {
                return {
                  ml: 'auto',
                };
              }
            })(),
          }}
        >
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
