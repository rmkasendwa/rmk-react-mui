import { CountryCode } from './models/Countries';

export const APP_NAME = process.env.REACT_APP_NAME || 'App';

export const DEFAULT_COUNTRY_CODE: CountryCode =
  (process.env.REACT_APP_COUNTRY_CODE as CountryCode) || 'UG';

export const DEFAULT_CURRENCY_CODE = 'UGX';

export const DEFAULT_DATE_FORMAT = 'MMM dd yyyy';

export const NOT_APPLICABLE = 'n/a';

export const CANCELLED_API_REQUEST_MESSAGE = 'Request Cancelled';

export const GRAVATAR_URL = `https://secure.gravatar.com/avatar/:md5EmailHash`;
