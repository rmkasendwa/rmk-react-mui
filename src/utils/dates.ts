import 'datejs';

export const formatDate = (
  dateParam: string | number | Date,
  includeTime?: boolean | 'SECONDS'
) => {
  const dateFormat = (() => {
    if (includeTime === true) return 'dddd, dd MMM yyyy hh:mm tt';
    if (includeTime === 'SECONDS') return 'dddd, dd MMM yyyy hh:mm:ss tt';
    return 'dd MMM yyyy';
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
