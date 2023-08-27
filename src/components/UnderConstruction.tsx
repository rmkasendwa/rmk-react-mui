import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SvgIconProps,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { FC, ReactNode, forwardRef } from 'react';

import TrafficConeIcon from './Icons/TrafficConeIcon';

export interface UnderConstructionClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type UnderConstructionClassKey = keyof UnderConstructionClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiUnderConstruction: UnderConstructionProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiUnderConstruction: keyof UnderConstructionClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiUnderConstruction?: {
      defaultProps?: ComponentsProps['MuiUnderConstruction'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiUnderConstruction'];
      variants?: ComponentsVariants['MuiUnderConstruction'];
    };
  }
}
//#endregion

export const getUnderConstructionUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiUnderConstruction', slot);
};

const slots: Record<UnderConstructionClassKey, [UnderConstructionClassKey]> = {
  root: ['root'],
};

export const underConstructionClasses: UnderConstructionClasses =
  generateUtilityClasses(
    'MuiUnderConstruction',
    Object.keys(slots) as UnderConstructionClassKey[]
  );

export interface UnderConstructionProps extends Partial<BoxProps> {
  label?: ReactNode;
  showLabel?: boolean;
  IconProps?: Partial<SvgIconProps>;
  Icon?: FC<any>;
}

export const UnderConstruction = forwardRef<
  HTMLDivElement,
  UnderConstructionProps
>(function UnderConstruction(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiUnderConstruction' });
  const {
    className,
    IconProps = {},
    label = 'This feature is still under development.',
    showLabel = true,
    Icon = TrafficConeIcon,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getUnderConstructionUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: IconPropsSx, ...IconPropsRest } = IconProps;

  const { palette } = useTheme();

  return (
    <Box
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        p: 3,
        ...sx,
      }}
    >
      <Icon
        {...IconPropsRest}
        sx={{
          color: alpha(palette.text.primary, 0.15),
          fontSize: 128,
          ...IconPropsSx,
        }}
      />
      {showLabel ? (
        <Typography
          component="div"
          sx={{
            color: alpha(palette.text.primary, 0.7),
            fontSize: 14,
            mt: 2,
          }}
        >
          {label}
        </Typography>
      ) : null}
    </Box>
  );
});

export default UnderConstruction;
