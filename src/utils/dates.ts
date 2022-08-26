import { format } from 'date-fns';

const DEFAULT_DATE_FORMAT = 'dd MMM yyyy';

const DEFAULT_DATE_TIME_FORMAT = `dddd, ${DEFAULT_DATE_FORMAT} hh:mm aa`;

const DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS = `dddd, ${DEFAULT_DATE_FORMAT} hh:mm:ss aa`;

export const formatDate = (
  dateParam: string | number | Date,
  includeTime?: boolean | 'SECONDS',
  dateFormat?: string
) => {
  dateFormat ??
    (dateFormat = (() => {
      if (includeTime === true) return DEFAULT_DATE_TIME_FORMAT;
      if (includeTime === 'SECONDS')
        return DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS;
      return DEFAULT_DATE_FORMAT;
    })());
  if (dateParam instanceof Date) {
    return format(dateParam, dateFormat);
  }
  if (typeof dateParam === 'string' && dateParam.toString().match(/^-?\d+$/)) {
    dateParam = parseInt(dateParam);
  }
  if (['string', 'number'].includes(typeof dateParam)) {
    const date = new Date(dateParam);
    if (!isNaN(date.getTime())) {
      return format(date, dateFormat);
    }
  }
  return '';
};

export const isIsoDate = (str: string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  return new Date(str).toISOString() === str;
};
