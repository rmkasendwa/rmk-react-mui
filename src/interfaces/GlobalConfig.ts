import { CountryCode } from './Countries';

export interface GlobalConfiguration {
  countryCode: CountryCode;
  setCountryCode?: (countryCode: CountryCode) => void;
}
