import { countries as countriesMap } from 'countries-list';

import { CountryCode } from '../../../interfaces/Countries';
import PhoneNumberUtil from '../../../utils/PhoneNumberUtil';

export interface Country {
  regionalCode: string;
  name: string;
  countryCode: number;
}

export const countries = Object.keys(countriesMap).map((key) => {
  const countryCode = PhoneNumberUtil.getCountryCodeForRegion(key);
  return {
    regionalCode: key,
    name: countriesMap[key as CountryCode].name,
    countryCode,
  };
});
