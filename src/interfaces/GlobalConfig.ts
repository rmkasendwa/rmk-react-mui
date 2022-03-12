import { ICountryCode } from './Countries';

export interface IGlobalConfiguration {
  countryCode: ICountryCode;
  setCountryCode?: (countryCode: ICountryCode) => void;
}
