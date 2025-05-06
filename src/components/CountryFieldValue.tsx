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
import { countries } from 'countries-list';
import { omit } from 'lodash';
import { forwardRef } from 'react';

import { CountryCode } from '../models/Countries';
import FieldValue, { FieldValueProps } from './FieldValue';

export interface CountryFieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CountryFieldValueClassKey = keyof CountryFieldValueClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCountryFieldValue: CountryFieldValueProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCountryFieldValue: keyof CountryFieldValueClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCountryFieldValue?: {
      defaultProps?: ComponentsProps['MuiCountryFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCountryFieldValue'];
      variants?: ComponentsVariants['MuiCountryFieldValue'];
    };
  }
}
//#endregion

export const getCountryFieldValueUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCountryFieldValue', slot);
};

const slots: Record<CountryFieldValueClassKey, [CountryFieldValueClassKey]> = {
  root: ['root'],
};

export const countryFieldValueClasses: CountryFieldValueClasses =
  generateUtilityClasses(
    'MuiCountryFieldValue',
    Object.keys(slots) as CountryFieldValueClassKey[]
  );

export interface CountryFieldValueProps
  extends Partial<Omit<FieldValueProps, 'icon' | 'children' | 'slotProps'>> {
  countryCode?: CountryCode;
  countryLabel?: string;
  slotProps?: {
    flagIcon?: Partial<BoxProps>;
  } & FieldValueProps['slotProps'];
}

export const CountryFieldValue = forwardRef<
  HTMLElement,
  CountryFieldValueProps
>(function CountryFieldValue(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiCountryFieldValue' });
  const { className, countryCode, slotProps, sx, ...rest } = omit(
    props,
    'countryLabel'
  );

  const { flagIcon: FlagIconProps = {} } = slotProps ?? {};
  let { countryLabel } = props;

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

  const { sx: FlagIconPropsSx, ...FlagIconPropsRest } = FlagIconProps;
  countryLabel || (countryLabel = countries[countryCode!]?.name);

  const { palette } = useTheme();

  return (
    <FieldValue
      ref={ref}
      {...rest}
      slotProps={{
        ...slotProps,
      }}
      IconContainerProps={{
        sx: {
          alignItems: 'center',
        },
      }}
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
                  height: '0.8em',
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
