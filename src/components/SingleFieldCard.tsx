import {
  CardProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import clsx from 'clsx';
import { forwardRef } from 'react';

import Card from './Card';
import FieldLabel from './FieldLabel';
import LoadingTypography from './LoadingTypography';

export interface SingleFieldCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SingleFieldCardClassKey = keyof SingleFieldCardClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSingleFieldCard: SingleFieldCardProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSingleFieldCard: keyof SingleFieldCardClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSingleFieldCard?: {
      defaultProps?: ComponentsProps['MuiSingleFieldCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSingleFieldCard'];
      variants?: ComponentsVariants['MuiSingleFieldCard'];
    };
  }
}
//#endregion

export const getSingleFieldCardUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiSingleFieldCard', slot);
};

const slots: Record<SingleFieldCardClassKey, [SingleFieldCardClassKey]> = {
  root: ['root'],
};

export const singleFieldCardClasses: SingleFieldCardClasses =
  generateUtilityClasses(
    'MuiSingleFieldCard',
    Object.keys(slots) as SingleFieldCardClassKey[]
  );

export interface SingleFieldCardProps extends Partial<CardProps> {
  label: string;
  value?: string | number;
}

export const SingleFieldCard = forwardRef<HTMLDivElement, SingleFieldCardProps>(
  function SingleFieldCard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiSingleFieldCard' });
    const { className, label, value, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getSingleFieldCardUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette, breakpoints } = useTheme();

    return (
      <Card
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          borderTop: `6px solid ${palette.primary.main}`,
          ...sx,
        }}
      >
        <FieldLabel
          align="center"
          ContainerGridProps={{
            justifyContent: 'center',
          }}
        >
          {label}
        </FieldLabel>
        <LoadingTypography
          variant="body1"
          align="center"
          sx={{
            fontSize: 24,
            fontWeight: 'bold',
            [breakpoints.down('lg')]: {
              fontSize: 18,
            },
          }}
        >
          {value || '-'}
        </LoadingTypography>
      </Card>
    );
  }
);

export default SingleFieldCard;
