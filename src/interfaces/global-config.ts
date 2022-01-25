import { ICountryCode } from './countries';

export interface IGlobalConfiguration {
  countryCode: ICountryCode;
  setCountryCode?: (countryCode: ICountryCode) => void;
}
