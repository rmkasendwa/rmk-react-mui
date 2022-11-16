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
import { forwardRef, useMemo } from 'react';

import { TableColumn } from '../../interfaces/Table';
import { DropdownOption } from '../../interfaces/Utils';
import EllipsisMenuIconButton, {
  EllipsisMenuIconButtonProps,
} from '../EllipsisMenuIconButton';

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
  extends Partial<Omit<EllipsisMenuIconButtonProps, 'options'>> {
  columns: TableColumn[];
}

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
  const { className, columns, PaginatedDropdownOptionListProps, ...rest } =
    props;

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

  const options = useMemo(() => {
    return columns.map(({ id, label }) => {
      return {
        value: id,
        label,
      } as DropdownOption;
    });
  }, [columns]);

  return (
    <EllipsisMenuIconButton
      ref={ref}
      {...rest}
      {...{ options }}
      className={clsx(classes.root)}
      PaginatedDropdownOptionListProps={{
        searchable: true,
        optionVariant: 'checkbox',
        ...PaginatedDropdownOptionListProps,
        multiple: true,
      }}
      closeOnSelectOption={false}
    >
      <AddIcon />
    </EllipsisMenuIconButton>
  );
});

export default TableColumnToggleIconButton;
