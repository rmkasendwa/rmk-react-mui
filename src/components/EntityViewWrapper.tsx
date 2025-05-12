import EditIcon from '@mui/icons-material/Edit';
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

import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from './FixedHeaderContentArea';

export interface EntityViewWrapperClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EntityViewWrapperClassKey = keyof EntityViewWrapperClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiEntityViewWrapper: EntityViewWrapperProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiEntityViewWrapper: keyof EntityViewWrapperClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiEntityViewWrapper?: {
      defaultProps?: ComponentsProps['MuiEntityViewWrapper'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiEntityViewWrapper'];
      variants?: ComponentsVariants['MuiEntityViewWrapper'];
    };
  }
}
//#endregion

export const getEntityViewWrapperUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiEntityViewWrapper', slot);
};

const slots: Record<EntityViewWrapperClassKey, [EntityViewWrapperClassKey]> = {
  root: ['root'],
};

export const entityViewWrapperClasses: EntityViewWrapperClasses =
  generateUtilityClasses(
    'MuiEntityViewWrapper',
    Object.keys(slots) as EntityViewWrapperClassKey[]
  );

export interface EntityViewWrapperProps extends FixedHeaderContentAreaProps {
  pathToEdit?: string;
}

export const EntityViewWrapper = forwardRef<
  HTMLDivElement,
  EntityViewWrapperProps
>(function EntityViewWrapper(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiEntityViewWrapper' });
  const { className, children, pathToEdit, tools = [], ...rest } = props;

  const classes = composeClasses(
    slots,
    getEntityViewWrapperUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <FixedHeaderContentArea
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      tools={[
        ...((): NonNullable<typeof tools> => {
          if (pathToEdit) {
            return [
              {
                type: 'icon-button',
                icon: <EditIcon />,
                label: 'Edit',
                href: pathToEdit,
              },
            ];
          }
          return [];
        })(),
        ...tools,
      ]}
    >
      {children}
    </FixedHeaderContentArea>
  );
});

export default EntityViewWrapper;
