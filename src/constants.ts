export const APP_NAME = process.env.REACT_APP_NAME || 'App';

//#region Date Formats
export const DEFAULT_SHORT_DATE_FORMAT = 'MMM dd';
export const DEFAULT_DATE_FORMAT = `${DEFAULT_SHORT_DATE_FORMAT}, yyyy`;
export const DEFAULT_TIME_FORMAT = 'hh:mm aa';
export const DEFAULT_DATE_TIME_FORMAT = `${DEFAULT_DATE_FORMAT} ${DEFAULT_TIME_FORMAT}`;
//#endregion

export const NOT_APPLICABLE = 'n/a';

export const CANCELLED_API_REQUEST_MESSAGES = [
  'Request Cancelled',
  'Aborted',
  'Canceled',
  'Cancelled',
];

export const GRAVATAR_URL = `https://secure.gravatar.com/avatar/:md5EmailHash`;
