import { Grid, GridProps, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { PermissionCode } from '../models/Users';

export interface GridLayoutColumn {
  span: number;
  node: ReactNode;
  permission?: PermissionCode | PermissionCode[];
}

export interface GridLayoutRow {
  columns: GridLayoutColumn[];
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
    .reduce((accumulator, { columns: baseColumns }) => {
      const columns = [...baseColumns]
        .filter(({ permission }) => {
          return !permission || loggedInUserHasPermission(permission);
        })
        .map((column) => {
          return {
            ...column,
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
    }, [] as GridLayoutColumn[])
    .map(({ node, span }, index) => {
      return (
        <Grid key={index} item md={span} xs={12}>
          {node}
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
