import { Grid, GridProps, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

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

  const gridLayoutItems = layoutRows
    .reduce((accumulator, { columns }) => {
      accumulator.push(...columns);
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
