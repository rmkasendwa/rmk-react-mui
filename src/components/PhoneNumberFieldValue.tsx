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

import { CountryCode } from '../models/Countries';
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

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPhoneNumberFieldValue: PhoneNumberFieldValueProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPhoneNumberFieldValue: keyof PhoneNumberFieldValueClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPhoneNumberFieldValue?: {
      defaultProps?: ComponentsProps['MuiPhoneNumberFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPhoneNumberFieldValue'];
      variants?: ComponentsVariants['MuiPhoneNumberFieldValue'];
    };
  }
}
//#endregion

export const getPhoneNumberFieldValueUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPhoneNumberFieldValue', slot);
};

const slots: Record<
  PhoneNumberFieldValueClassKey,
  [PhoneNumberFieldValueClassKey]
> = {
  root: ['root'],
};

export const phoneNumberFieldValueClasses: PhoneNumberFieldValueClasses =
  generateUtilityClasses(
    'MuiPhoneNumberFieldValue',
    Object.keys(slots) as PhoneNumberFieldValueClassKey[]
  );

export interface PhoneNumberFieldValueProps
  extends Partial<Omit<CountryFieldValueProps, 'countryLabel'>> {
  phoneNumber: string;
  LinkProps?: Partial<LinkProps>;
}

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
        href={`tel://${phoneNumber.replace(/\s/g, '')}`}
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
