import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Link,
  LinkProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { CountryCode } from '../interfaces/Countries';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../utils/PhoneNumberUtil';
import CountryFieldValue, { CountryFieldValueProps } from './CountryFieldValue';

export interface PhoneNumberFieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PhoneNumberFieldValueClassKey = keyof PhoneNumberFieldValueClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPhoneNumberFieldValue: PhoneNumberFieldValueProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPhoneNumberFieldValue: keyof PhoneNumberFieldValueClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPhoneNumberFieldValue?: {
      defaultProps?: ComponentsProps['MuiPhoneNumberFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPhoneNumberFieldValue'];
      variants?: ComponentsVariants['MuiPhoneNumberFieldValue'];
    };
  }
}

export interface PhoneNumberFieldValueProps
  extends Partial<Omit<CountryFieldValueProps, 'countryLabel'>> {
  phoneNumber: string;
  LinkProps?: Partial<LinkProps>;
}

export function getPhoneNumberFieldValueUtilityClass(slot: string): string {
  return generateUtilityClass('MuiPhoneNumberFieldValue', slot);
}

export const phoneNumberFieldValueClasses: PhoneNumberFieldValueClasses =
  generateUtilityClasses('MuiPhoneNumberFieldValue', ['root']);

const slots = {
  root: ['root'],
};

export const PhoneNumberFieldValue = forwardRef<
  HTMLDivElement,
  PhoneNumberFieldValueProps
>(function PhoneNumberFieldValue(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPhoneNumberFieldValue',
  });
  const {
    className,
    phoneNumber,
    countryCode,
    LinkProps = {},
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getPhoneNumberFieldValueUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: LinkPropsSx, ...LinkPropsRest } = LinkProps;

  const parsedPhoneNumber = isValidPhoneNumber(phoneNumber, countryCode);

  if (parsedPhoneNumber) {
    return (
      <Link
        underline="none"
        color="inherit"
        noWrap
        {...LinkPropsRest}
        href={`tel://${phoneNumber}`}
        sx={{ display: 'block', maxWidth: '100%', ...LinkPropsSx }}
      >
        <CountryFieldValue
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          countryCode={
            PhoneNumberUtil.getRegionCodeForCountryCode(
              parsedPhoneNumber.getCountryCode()!
            ) as CountryCode
          }
          countryLabel={systemStandardPhoneNumberFormat(
            phoneNumber,
            countryCode
          )}
        />
      </Link>
    );
  }

  return (
    <CountryFieldValue
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      countryLabel={phoneNumber}
    />
  );
});

export default PhoneNumberFieldValue;
