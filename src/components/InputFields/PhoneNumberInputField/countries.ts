import PhoneNumberUtil from '../../../utils/PhoneNumberUtil';
import flags from './flags.json';

export interface ICountry {
  regionalCode: string;
  name: string;
  countryCode: number;
}

export const countries = Object.keys(flags).map((key) => {
  const countryCode = PhoneNumberUtil.getCountryCodeForRegion(key);
  return { regionalCode: key, name: (flags as any)[key], countryCode };
});
