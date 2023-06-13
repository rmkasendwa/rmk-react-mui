import { rawTimeZones } from '@vvo/tzdb';

/**
 * Convert time offset to user friendly string.
 * e.g.  -60 ==> "-01:00"
 * @param offsetInMinutes  offset from UTC in minutes.
 * @returns  user friendly string e.g. "-01:00"
 */
export function convertOffsetInMinutesToString(
  offsetInMinutes: number
): string {
  const absValue = Math.abs(offsetInMinutes);
  const hour = Math.floor(absValue / 60);
  const minute = absValue % 60;
  const plusMinus = offsetInMinutes >= 0 ? '+' : '-';

  return (
    plusMinus +
    convertNumberToStringWithZeroPadding(hour) +
    ':' +
    convertNumberToStringWithZeroPadding(minute)
  );
}

function convertNumberToStringWithZeroPadding(num: number): string {
  return ('0' + num).slice(-2);
}

/**
 * Find a time zone data in @vvo/tzdb.
 * @param timeZoneName - Time zone name. Note it could be grouped in "group".
 * @return Time zone data in @vvo/tzdb if found. undefined if not found.
 */
export function findTimeZone(timeZoneName: string) {
  return rawTimeZones.find((timeZone) => {
    return (
      timeZoneName === timeZone.name || timeZone.group.includes(timeZoneName)
    );
  });
}
