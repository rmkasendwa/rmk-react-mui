import {
  Box,
  BoxProps,
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

import PaddedContentArea, { PaddedContentAreaProps } from './PaddedContentArea';

export interface FixedHeaderContentAreaClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FixedHeaderContentAreaClassKey =
  keyof FixedHeaderContentAreaClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFixedHeaderContentArea: FixedHeaderContentAreaProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFixedHeaderContentArea: keyof FixedHeaderContentAreaClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFixedHeaderContentArea?: {
      defaultProps?: ComponentsProps['MuiFixedHeaderContentArea'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFixedHeaderContentArea'];
      variants?: ComponentsVariants['MuiFixedHeaderContentArea'];
    };
  }
}
//#endregion

export const getFixedHeaderContentAreaUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFixedHeaderContentArea', slot);
};

const slots: Record<
  FixedHeaderContentAreaClassKey,
  [FixedHeaderContentAreaClassKey]
> = {
  root: ['root'],
};

export const fixedHeaderContentAreaClasses: FixedHeaderContentAreaClasses =
  generateUtilityClasses(
    'MuiFixedHeaderContentArea',
    Object.keys(slots) as FixedHeaderContentAreaClassKey[]
  );

export interface FixedHeaderContentAreaProps extends PaddedContentAreaProps {
  BodyProps?: Partial<BoxProps>;
}

export const FixedHeaderContentArea = forwardRef<
  HTMLDivElement,
  FixedHeaderContentAreaProps
>(function FixedHeaderContentArea(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFixedHeaderContentArea',
  });
  const { className, title, children, sx, BodyProps = {}, ...rest } = props;

  const classes = composeClasses(
    slots,
    getFixedHeaderContentAreaUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: BodyPropsSx, ...BodyPropsRest } = BodyProps;

  return (
    <PaddedContentArea
      title={title}
      {...rest}
      ref={ref}
      className={clsx(classes.root)}
      sx={{
        pb: `0 !important`,
        position: 'absolute',
        width: '100%',
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box
        {...BodyPropsRest}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          ...BodyPropsSx,
        }}
      >
        {children}
      </Box>
    </PaddedContentArea>
  );
});

export default FixedHeaderContentArea;
