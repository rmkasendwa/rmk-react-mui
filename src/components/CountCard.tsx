import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
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
import { omit } from 'lodash';
import { forwardRef } from 'react';

import { useRecord } from '../hooks/Utils';
import Card, { CardProps } from './Card';
import LoadingTypography from './LoadingTypography';

export interface CountCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CountCardClassKey = keyof CountCardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCountCard: CountCardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCountCard: keyof CountCardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCountCard?: {
      defaultProps?: ComponentsProps['MuiCountCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCountCard'];
      variants?: ComponentsVariants['MuiCountCard'];
    };
  }
}

export interface CountCardProps extends Partial<CardProps> {
  countFinder: () => Promise<number>;
  labelPlural?: string;
  labelSingular?: string;
}

export function getCountCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCountCard', slot);
}

export const countCardClasses: CountCardClasses = generateUtilityClasses(
  'MuiCountCard',
  ['root']
);

const slots = {
  root: ['root'],
};

export const CountCard = forwardRef<HTMLDivElement, CountCardProps>(
  function CountCard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCountCard' });
    const {
      countFinder,
      title,
      className,
      CardBodyProps = {},
      sx,
      ...rest
    } = omit(props, 'labelPlural', 'labelSingular');

    let { labelPlural, labelSingular } = props;

    const classes = composeClasses(
      slots,
      getCountCardUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: CardBodyPropsSx, ...CardBodyPropsRest } = CardBodyProps;

    if (!labelPlural) {
      if (typeof title === 'string') {
        labelPlural = title;
      } else {
        labelPlural = 'Records';
      }
    }
    if (!labelSingular && labelPlural) {
      labelSingular = labelPlural.replace(/s$/, '');
    }

    const {
      record: count,
      load,
      loading,
      errorMessage,
    } = useRecord(countFinder);

    return (
      <Card
        ref={ref}
        {...rest}
        {...{ title, load, loading, errorMessage }}
        className={clsx(classes.root)}
        sx={{
          ...sx,
          display: 'flex',
          flexDirection: 'column',
        }}
        CardBodyProps={{
          ...CardBodyPropsRest,
          sx: {
            ...CardBodyPropsSx,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          },
        }}
      >
        <LoadingTypography
          noWrap
          align="center"
          sx={{
            fontSize: 100,
            lineHeight: 1.2,
          }}
        >
          {addThousandCommas(count ?? 0)}
        </LoadingTypography>
        <LoadingTypography
          noWrap
          align="center"
          sx={{
            fontSize: 32,
          }}
        >
          {(() => {
            if (count === 1) {
              return labelSingular;
            }
            return labelPlural;
          })()}
        </LoadingTypography>
      </Card>
    );
  }
);

export default CountCard;
