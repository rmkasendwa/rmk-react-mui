import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TableGroupCollapseToolClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableGroupCollapseToolClassKey =
  keyof TableGroupCollapseToolClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableGroupCollapseTool: TableGroupCollapseToolProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableGroupCollapseTool: keyof TableGroupCollapseToolClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableGroupCollapseTool?: {
      defaultProps?: ComponentsProps['MuiTableGroupCollapseTool'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableGroupCollapseTool'];
      variants?: ComponentsVariants['MuiTableGroupCollapseTool'];
    };
  }
}
//#endregion

export const getTableGroupCollapseToolUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTableGroupCollapseTool', slot);
};

const slots: Record<
  TableGroupCollapseToolClassKey,
  [TableGroupCollapseToolClassKey]
> = {
  root: ['root'],
};

export const tableGroupCollapseToolClasses: TableGroupCollapseToolClasses =
  generateUtilityClasses(
    'MuiTableGroupCollapseTool',
    Object.keys(slots) as TableGroupCollapseToolClassKey[]
  );

export interface TableGroupCollapseToolProps extends Partial<BoxProps> {
  groupCollapsed: boolean;
  onChangeGroupCollapsed?: (groupCollapsed: boolean) => void;
}

export const TableGroupCollapseTool = forwardRef<
  HTMLDivElement,
  TableGroupCollapseToolProps
>(function TableGroupCollapseTool(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTableGroupCollapseTool',
  });
  const { className, groupCollapsed, onChangeGroupCollapsed, sx, ...rest } =
    props;

  const classes = composeClasses(
    slots,
    getTableGroupCollapseToolUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <Box
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        display: 'inline-flex',
        ...sx,
      }}
    >
      {groupCollapsed ? (
        <KeyboardArrowRightIcon
          onClick={() => {
            onChangeGroupCollapsed && onChangeGroupCollapsed(false);
          }}
          sx={{
            cursor: 'pointer',
          }}
        />
      ) : (
        <KeyboardArrowDownIcon
          onClick={() => {
            onChangeGroupCollapsed && onChangeGroupCollapsed(true);
          }}
          sx={{
            cursor: 'pointer',
          }}
        />
      )}
    </Box>
  );
});

export default TableGroupCollapseTool;
