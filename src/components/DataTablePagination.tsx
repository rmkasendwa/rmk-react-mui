import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  TablePaginationProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  inputBaseClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Grid, { GridProps } from '@mui/material/Grid';
import Pagination, { PaginationProps } from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { omit } from 'lodash';
import { Children, ReactNode, forwardRef, useEffect, useState } from 'react';
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
  postCountTools?: ReactNode | ReactNode[];
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
    postCountTools,
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

  const { typography } = useTheme();

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

  const pageCount = rowsPerPage ? Math.ceil(totalCount / rowsPerPage) : 0;

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
        pl: 3,
        pr: 2,
        py: 1,
        gap: 2,
        fontSize: typography.body2.fontSize,
        ...(() => {
          if (isSmallScreen) {
            return {
              justifyContent: 'center',
            };
          }
        })(),
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
      {(() => {
        if (postCountTools) {
          return Children.toArray(postCountTools).map((tool, index) => {
            return (
              <Grid item key={index} sx={{ minWidth: 0 }}>
                {tool}
              </Grid>
            );
          });
        }
      })()}
      {rowsPerPage != null ? (
        <Grid item>
          <Typography
            component="div"
            variant="body2"
            sx={{
              fontSize: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
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
              showRichTextValue={false}
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
      {rowsPerPage != null && page != null && pageCount > 1 ? (
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
            count={pageCount}
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
