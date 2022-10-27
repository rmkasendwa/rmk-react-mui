import '../extensions/String';

import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil as PhoneNumberUtilConstructor,
} from 'google-libphonenumber';

import { CountryCode } from '../interfaces/Countries';

const systemStandardFormatSupportedCountries: CountryCode[] = [
  'UG',
  'DE',
  'TZ',
  'KE',
];

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
): boolean | PhoneNumber => {
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
    return false;
  }
  if (!phoneNumber.startsWith('+')) {
    return isValidPhoneNumber(
      '+' + phoneNumber,
      regionalCode,
      defaultCountryCodeIsPrecident
    );
  }
  return false;
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
    let formattedPhoneNumber = PhoneNumberUtil.format(
      phoneNumber,
      PhoneNumberFormat.INTERNATIONAL
    );
    const countryCode = phoneNumber.getCountryCode();
    if (countryCode) {
      regionalCode = PhoneNumberUtil.getRegionCodeForCountryCode(
        countryCode
      ) as CountryCode;
      if (systemStandardFormatSupportedCountries.includes(regionalCode)) {
        const formattedPhoneNumberWithoutSpaces =
          formattedPhoneNumber.replaceAll(/\s/g, '');
        if (
          regionalCode === 'UG' &&
          PhoneNumberUtil.isValidNumber(phoneNumber) &&
          formattedPhoneNumberWithoutSpaces.length === 13
        ) {
          const formattedPhoneNumberParts = (
            formattedPhoneNumberWithoutSpaces.chunk(4, 4) as string
          ).split(' ');
          formattedPhoneNumber = `${formattedPhoneNumberParts[0]} (${formattedPhoneNumberParts[1]}) ${formattedPhoneNumberParts[2]} ${formattedPhoneNumberParts[3]}`;
        } else {
          const formattedPhoneNumberParts = formattedPhoneNumber.split(' ');
          formattedPhoneNumber = `${formattedPhoneNumberParts.shift()} (${formattedPhoneNumberParts.shift()}) ${formattedPhoneNumberParts
            .join('')
            .chunk(2)}`;
        }
      }
      return formattedPhoneNumber;
    }
  }
  return phoneNumberString;
};
