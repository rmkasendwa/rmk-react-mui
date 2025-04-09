import '@infinite-debugger/rmk-js-extensions/String';

import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil as PhoneNumberUtilConstructor,
} from 'google-libphonenumber';

import { CountryCode } from '../models/Countries';

const PhoneNumberUtil = new PhoneNumberUtilConstructor();

export default PhoneNumberUtil;

export { PhoneNumber };

export const getRegionalCode = (
  formattedPhoneNumber: string
): CountryCode | undefined => {
  try {
    formattedPhoneNumber.startsWith('+') ||
      (formattedPhoneNumber = `+${formattedPhoneNumber}`);
    if (formattedPhoneNumber.startsWith('+')) {
      const countryCode =
        PhoneNumberUtil.parseAndKeepRawInput(
          formattedPhoneNumber
        ).getCountryCode();
      if (countryCode) {
        return PhoneNumberUtil.getRegionCodeForCountryCode(
          countryCode
        ) as CountryCode;
      }
    }
  } catch (err) {
    err;
  }
};

export const isValidPhoneNumber = (
  phoneNumber: string,
  regionalCode?: CountryCode,
  defaultCountryCodeIsPrecident?: boolean
): false | PhoneNumber => {
  const phoneNummberValid = (() => {
    try {
      !defaultCountryCodeIsPrecident &&
        phoneNumber.startsWith('+') &&
        (regionalCode = getRegionalCode(phoneNumber));
      const parsedPhoneNumber = PhoneNumberUtil.parseAndKeepRawInput(
        phoneNumber,
        regionalCode
      );
      if (PhoneNumberUtil.isValidNumber(parsedPhoneNumber)) {
        return parsedPhoneNumber;
      }
    } catch (err) {
      err;
    }
    return false;
  })();
  if (!phoneNummberValid && !phoneNumber.startsWith('+')) {
    return isValidPhoneNumber(
      '+' + phoneNumber,
      regionalCode,
      defaultCountryCodeIsPrecident
    );
  }
  return phoneNummberValid;
};

export const systemStandardPhoneNumberFormat = ({
  phoneNumberString,
  regionalCode,
  format = PhoneNumberFormat.INTERNATIONAL,
}: {
  phoneNumberString: string;
  regionalCode?: CountryCode;
  format?: PhoneNumberFormat;
}) => {
  const phoneNumber = isValidPhoneNumber(
    phoneNumberString,
    regionalCode
  ) as PhoneNumber;
  if (phoneNumber) {
    return PhoneNumberUtil.format(phoneNumber, format);
  }
  return phoneNumberString;
};
