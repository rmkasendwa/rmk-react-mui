import { ICountryCode } from './interfaces/Countries';

export const APP_NAME = process.env.REACT_APP_NAME || 'App';

export const DEFAULT_COUNTRY_CODE: ICountryCode =
  (process.env.REACT_APP_COUNTRY_CODE as ICountryCode) || 'UG';

export const DEFAULT_CURRENCY_CODE = 'UGX';

export const DEFAULT_DATE_FORMAT = 'dd MMM yyyy';

export const NOT_APPLICABLE = 'n/a';

export const CANCELLED_API_REQUEST_MESSAGE = 'Request Cancelled';
