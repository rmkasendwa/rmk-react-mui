import 'datejs';

const DEFAULT_DATE_FORMAT =
  process.env.DEFAULT_DATE_FORMAT ||
  process.env.REACT_DEFAULT_DATE_FORMAT ||
  'dd MMM yyyy';

const DEFAULT_DATE_TIME_FORMAT =
  process.env.DEFAULT_DATE_TIME_FORMAT ||
  process.env.REACT_DEFAULT_DATE_TIME_FORMAT ||
  `dddd, ${DEFAULT_DATE_FORMAT} hh:mm tt`;

const DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS =
  process.env.DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS ||
  process.env.REACT_DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS ||
  `dddd, ${DEFAULT_DATE_FORMAT} hh:mm:ss tt`;

export const formatDate = (
  dateParam: string | number | Date,
  includeTime?: boolean | 'SECONDS'
) => {
  const dateFormat = (() => {
    if (includeTime === true) return DEFAULT_DATE_TIME_FORMAT;
    if (includeTime === 'SECONDS') return DEFAULT_DATE_TIME_FORMAT_WITH_SECONDS;
    return DEFAULT_DATE_FORMAT;
  })();
  if (dateParam instanceof Date) return dateParam.toString(dateFormat);
  if (typeof dateParam === 'string' && dateParam.toString().match(/^-?\d+$/))
    dateParam = parseInt(dateParam);
  if (['string', 'number'].includes(typeof dateParam)) {
    const date = new Date(dateParam);
    if (!isNaN(date.getTime())) return date.toString(dateFormat);
  }
  return dateParam;
};
