import { Box, Grid, GridProps, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import RenderIfVisible from '../components/RenderIfVisible';
import { useAuth } from '../contexts/AuthContext';
import { PermissionCode } from '../models/Users';

export interface GridLayoutColumn extends Partial<GridProps> {
  span: number;
  node: ReactNode;
  permission?: PermissionCode | PermissionCode[];
}

export interface GridLayoutRow {
  columns: GridLayoutColumn[];
  rowHeight?: number;
}

export interface PermissionRegulatedGridLayoutOptions
  extends Partial<GridProps> {
  layoutRows: GridLayoutRow[];
}

export const usePermissionRegulatedGridLayout = ({
  layoutRows,
  ...rest
}: PermissionRegulatedGridLayoutOptions) => {
  const { breakpoints } = useTheme();
  const isLargeScreen = useMediaQuery(breakpoints.up('md'));
  const { loggedInUserHasPermission } = useAuth();

  const gridLayoutItems = layoutRows
    .reduce<
      (GridLayoutColumn & {
        rowHeight?: number;
      })[]
    >((accumulator, { columns: baseColumns, rowHeight }) => {
      const columns = [...baseColumns]
        .filter(({ permission }) => {
          return !permission || loggedInUserHasPermission(permission);
        })
        .map((column) => {
          return {
            ...column,
            rowHeight,
          };
        });

      if (columns.length > 0) {
        const totalColumnSpan = columns.reduce(
          (accumulator, { span }) => accumulator + span,
          0
        );

        if (totalColumnSpan !== 12) {
          const evenColumnSpan = Math.floor(12 / columns.length);
          const remainderColumnSpan = 12 % columns.length;
          columns.forEach((column) => {
            column.span = evenColumnSpan;
          });
          columns[0].span += remainderColumnSpan;
        }

        accumulator.push(...columns);
      }

      return accumulator;
    }, [])
    .map(({ node, span, rowHeight, permission, ...rest }, index) => {
      permission;
      return (
        <Grid {...rest} key={index} item md={span} xs={12}>
          <Box
            sx={{
              position: 'relative',
              height: rowHeight,
            }}
          >
            <RenderIfVisible
              displayPlaceholder={false}
              unWrapChildrenIfVisible
              sx={{
                height: rowHeight || 350,
              }}
            >
              {node}
            </RenderIfVisible>
          </Box>
        </Grid>
      );
    });

  if (gridLayoutItems.length > 0) {
    return (
      <Grid {...rest} container spacing={isLargeScreen ? 3 : 2}>
        {gridLayoutItems}
      </Grid>
    );
  }
};
