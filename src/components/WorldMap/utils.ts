import { RawTimeZone, rawTimeZones } from '@vvo/tzdb';

/**
 * Convert time offset to user friendly string.
 * e.g.  -60 ==> "-01:00"
 * @param offsetInMinutes  offset from UTC in minutes.
 * @returns  user friendly string e.g. "-01:00"
 */
export const convertOffsetInMinutesToString = (offsetInMinutes: number) => {
  const absValue = Math.abs(offsetInMinutes);
  const hour = Math.floor(absValue / 60);
  const minute = absValue % 60;
  const plusMinus = offsetInMinutes >= 0 ? '+' : '-';

  const convertNumberToStringWithZeroPadding = (num: number) => {
    return ('0' + num).slice(-2);
  };

  return (
    plusMinus +
    convertNumberToStringWithZeroPadding(hour) +
    ':' +
    convertNumberToStringWithZeroPadding(minute)
  );
};

/**
 * Find a time zone data in @vvo/tzdb.
 * @param timeZoneName - Time zone name. Note it could be grouped in "group".
 * @return Time zone data in @vvo/tzdb if found. undefined if not found.
 */
export const findTimeZone = (timeZoneName: string) => {
  return rawTimeZones.find((timeZone) => {
    return (
      timeZoneName === timeZone.name || timeZone.group.includes(timeZoneName)
    );
  });
};

export const timeZonesGroupedByCountryCode = rawTimeZones.reduce(
  (accumulator, timeZone) => {
    const { countryCode } = timeZone;
    if (!accumulator[countryCode]) {
      accumulator[countryCode] = [];
    }
    accumulator[countryCode].push(timeZone);
    return accumulator;
  },
  {} as { [countryCode: string]: RawTimeZone[] }
);
