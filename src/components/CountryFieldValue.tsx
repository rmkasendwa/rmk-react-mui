import 'flag-icons/css/flag-icons.min.css';

import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { CountryCode } from '../interfaces/Countries';
import FieldValue, { FieldValueProps } from './FieldValue';

export interface CountryFieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CountryFieldValueClassKey = keyof CountryFieldValueClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCountryFieldValue: CountryFieldValueProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCountryFieldValue: keyof CountryFieldValueClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCountryFieldValue?: {
      defaultProps?: ComponentsProps['MuiCountryFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCountryFieldValue'];
      variants?: ComponentsVariants['MuiCountryFieldValue'];
    };
  }
}

export interface CountryFieldValueProps
  extends Partial<Omit<FieldValueProps, 'icon' | 'children'>> {
  countryCode?: CountryCode;
  countryLabel: string;
  FlagIconProps?: Partial<BoxProps>;
}

export function getCountryFieldValueUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCountryFieldValue', slot);
}

export const countryFieldValueClasses: CountryFieldValueClasses =
  generateUtilityClasses('MuiCountryFieldValue', ['root']);

const slots = {
  root: ['root'],
};

export const CountryFieldValue = forwardRef<
  HTMLElement,
  CountryFieldValueProps
>(function CountryFieldValue(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiCountryFieldValue' });
  const {
    className,
    countryCode,
    countryLabel,
    FlagIconProps = {},
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getCountryFieldValueUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { palette } = useTheme();

  const { sx: FlagIconPropsSx, ...FlagIconPropsRest } = FlagIconProps;

  return (
    <FieldValue
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      icon={
        <Box
          {...FlagIconPropsRest}
          className={clsx(
            'fi',
            (() => {
              if (countryCode) {
                return `fi-${countryCode.toLowerCase()}`;
              }
            })()
          )}
          sx={{
            fontSize: 20,
            height: '1em',
            ...(() => {
              if (!countryCode) {
                return {
                  bgcolor: palette.divider,
                };
              }
            })(),
            ...FlagIconPropsSx,
          }}
        />
      }
      noWrap
      sx={{
        flexWrap: 'nowrap',
        alignItems: 'center',
        fontWeight: 'normal',
        whiteSpace: 'nowrap',
        color: 'inherit',
        ...sx,
      }}
    >
      {countryLabel}
    </FieldValue>
  );
});

export default CountryFieldValue;
