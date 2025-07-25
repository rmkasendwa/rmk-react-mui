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

import { PhoneNumberFormat } from 'google-libphonenumber';
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
  extends Partial<Omit<CountryFieldValueProps, 'countryLabel' | 'slotProps'>> {
  phoneNumber: string;
  slotProps?: {
    link?: Partial<LinkProps>;
  } & CountryFieldValueProps['slotProps'];

  /**
   * The format to use when formatting the phone number.
   *
   * @default PhoneNumberFormat.INTERNATIONAL
   */
  format?: PhoneNumberFormat;

  /**
   * If true, the phone number will be rendered as a clickable link.
   * If false, it will be rendered as plain text.
   *
   * @default true
   */
  isLink?: boolean;
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
    slotProps,
    format = PhoneNumberFormat.INTERNATIONAL,
    isLink = true,
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

  const { sx: LinkPropsSx, ...LinkPropsRest } = slotProps?.link || {};

  const parsedPhoneNumber = isValidPhoneNumber(phoneNumber, countryCode);

  if (parsedPhoneNumber) {
    const fieldValueElement = (
      <CountryFieldValue
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        slotProps={slotProps}
        countryCode={
          PhoneNumberUtil.getRegionCodeForCountryCode(
            parsedPhoneNumber.getCountryCode()!
          ) as CountryCode
        }
        countryLabel={systemStandardPhoneNumberFormat({
          phoneNumberString: phoneNumber,
          regionalCode: countryCode,
          format,
        })}
      />
    );

    if (!isLink) {
      return fieldValueElement;
    }

    return (
      <Link
        underline="none"
        color="inherit"
        noWrap
        {...LinkPropsRest}
        href={`tel://${phoneNumber.replace(/\s/g, '')}`}
        sx={{ display: 'block', maxWidth: '100%', ...LinkPropsSx }}
      >
        {fieldValueElement}
      </Link>
    );
  }

  return (
    <CountryFieldValue
      ref={ref}
      {...rest}
      slotProps={slotProps}
      className={clsx(classes.root)}
      countryLabel={phoneNumber}
    />
  );
});

export default PhoneNumberFieldValue;
