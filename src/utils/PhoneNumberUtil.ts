import '../extensions/String';

import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil as PhoneNumberUtilConstructor,
} from 'google-libphonenumber';

import { CountryCode } from '../interfaces/Countries';

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
  } catch (exception) {
    // TODO: Log the error
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
    } catch (exception) {
      // TODO: Log the error
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

export const systemStandardPhoneNumberFormat = (
  phoneNumberString: string,
  regionalCode?: CountryCode
): string => {
  const phoneNumber = isValidPhoneNumber(
    phoneNumberString,
    regionalCode
  ) as PhoneNumber;
  if (phoneNumber) {
    const formattedPhoneNumber = PhoneNumberUtil.format(
      phoneNumber,
      PhoneNumberFormat.INTERNATIONAL
    );
    return formattedPhoneNumber;
  }
  return phoneNumberString;
};
