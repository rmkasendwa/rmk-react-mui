import AddIcon from '@mui/icons-material/Add';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import EllipsisMenuIconButton, {
  EllipsisMenuIconButtonProps,
} from './EllipsisMenuIconButton';

export interface TableColumnToggleIconButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableColumnToggleIconButtonClassKey =
  keyof TableColumnToggleIconButtonClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableColumnToggleIconButton: TableColumnToggleIconButtonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableColumnToggleIconButton: keyof TableColumnToggleIconButtonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableColumnToggleIconButton?: {
      defaultProps?: ComponentsProps['MuiTableColumnToggleIconButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableColumnToggleIconButton'];
      variants?: ComponentsVariants['MuiTableColumnToggleIconButton'];
    };
  }
}

export interface TableColumnToggleIconButtonProps
  extends Partial<Omit<EllipsisMenuIconButtonProps, 'options'>> {}

export function getTableColumnToggleIconButtonUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiTableColumnToggleIconButton', slot);
}

export const tableColumnToggleIconButtonClasses: TableColumnToggleIconButtonClasses =
  generateUtilityClasses('MuiTableColumnToggleIconButton', ['root']);

const slots = {
  root: ['root'],
};

export const TableColumnToggleIconButton = forwardRef<
  HTMLButtonElement,
  TableColumnToggleIconButtonProps
>(function TableColumnToggleIconButton(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTableColumnToggleIconButton',
  });
  const { className, ...rest } = props;

  const classes = composeClasses(
    slots,
    getTableColumnToggleIconButtonUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <EllipsisMenuIconButton
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      options={[]}
    >
      <AddIcon />
    </EllipsisMenuIconButton>
  );
});

export default TableColumnToggleIconButton;
