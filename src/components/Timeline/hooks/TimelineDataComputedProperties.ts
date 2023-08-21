import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
import addDays from 'date-fns/addDays';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours';
import { result } from 'lodash';
import { useMemo, useRef } from 'react';

import { BaseDataRow } from '../../Table';
import { TimelineDataComputedProperties } from '../models';

export interface TimelineDataComputedPropertiesProps<
  RecordRow extends BaseDataRow = any
> {
  /** An array of rows to be displayed in the timeline. */
  rows: RecordRow[];

  /** The property from each row to be used as the start date for each timeline element. */
  startDateProperty?: keyof RecordRow;

  /** The property from each row to be used as the end date for each timeline element. */
  endDateProperty?: keyof RecordRow;

  /** The minimum date allowed in the timeline. */
  minDate?: string | number | Date;

  /** The maximum date allowed in the timeline. */
  maxDate?: string | number | Date;

  /** A function to get an array of timeline dates from the rows. */
  getTimelineDates?: (rows: RecordRow[]) => (string | number | Date)[];
}
export const useTimelineDataComputedProperties = ({
  rows,
  endDateProperty,
  startDateProperty,
  minDate: minDateProp,
  maxDate: maxDateProp,
  getTimelineDates,
}: TimelineDataComputedPropertiesProps) => {
  const getTimelineDatesRef = useRef(getTimelineDates);
  getTimelineDatesRef.current = getTimelineDates;

  return useMemo(() => {
    // A function to get all dates from the timeline data using the getTimelineDatesRef.current function.
    const allDates = (() => {
      if (getTimelineDatesRef.current) {
        const dates = getTimelineDatesRef.current(rows);
        // Converting each date to the format without timezone offset.
        return dates.map((date) => {
          return createDateWithoutTimezoneOffset(date);
        });
      }
      // If getTimelineDatesRef.current is not provided, manually extract dates from the rows.
      return rows.flatMap((row) => {
        const dates: Date[] = [];
        const startDateValue = (() => {
          // Extracting the start date from each row based on the startDateProperty.
          if (startDateProperty) {
            return result(row, startDateProperty);
          }
        })();
        if (startDateValue) {
          // Handling different date formats for the start date and adding to the dates array.
          if (startDateValue instanceof Date) {
            dates.push(startDateValue);
          } else {
            const parsedStartDateValue = createDateWithoutTimezoneOffset(
              startDateValue as any
            );
            if (!isNaN(parsedStartDateValue.getTime())) {
              dates.push(parsedStartDateValue);
            }
          }
        }
        const endDateValue = (() => {
          // Extracting the end date from each row based on the endDateProperty.
          if (endDateProperty) {
            return result(row, endDateProperty);
          }
        })();
        if (endDateValue) {
          // Handling different date formats for the end date and adding to the dates array.
          if (endDateValue instanceof Date) {
            dates.push(endDateValue);
          } else {
            const parsedEndDateValue = createDateWithoutTimezoneOffset(
              endDateValue as any
            );
            if (!isNaN(parsedEndDateValue.getTime())) {
              dates.push(parsedEndDateValue);
            }
          }
        }
        return dates;
      });
    })().sort((a, b) => a.getTime() - b.getTime());

    // Calculate the minimum and maximum dates and calendar dates based on the extracted dates.
    const { maxDate, minDate, maxCalendarDate, minCalendarDate } = (() => {
      if (allDates.length > 0) {
        const minDate = minDateProp
          ? createDateWithoutTimezoneOffset(minDateProp)
          : allDates[0];
        const minCalendarDate = new Date(minDate.getFullYear(), 0, 1, 0, 0);

        const maxDate = maxDateProp
          ? createDateWithoutTimezoneOffset(maxDateProp)
          : allDates[allDates.length - 1];
        const maxCalendarDate = new Date(maxDate.getFullYear(), 11, 31, 23, 59);

        return {
          minDate,
          maxDate,
          minCalendarDate,
          maxCalendarDate,
        };
      }
      // If no dates are extracted, set the minimum and maximum dates to the current year.
      const thisYear = new Date().getFullYear();
      const minDate = new Date(thisYear, 0, 1, 0, 0);
      const maxDate = new Date(thisYear, 11, 31, 23, 59);
      return {
        minDate,
        maxDate,
        minCalendarDate: minDate,
        maxCalendarDate: maxDate,
      };
    })();

    // Calculate the years represented in the timeline data and add them to the timelineYears array.
    const minDateYear = minCalendarDate.getFullYear();
    const maxDateYear = maxCalendarDate.getFullYear();
    const timelineYears: number[] = [];
    for (let year = minDateYear; year <= maxDateYear; year++) {
      timelineYears.push(year);
    }

    // Calculate totalNumberOfDays and totalNumberOfHours covered by the timeline.
    const totalNumberOfDays =
      differenceInDays(maxCalendarDate, minCalendarDate) + 1;
    const totalNumberOfHours =
      differenceInHours(maxCalendarDate, minCalendarDate) + 1;

    // Calculate timelineDifferenceInDays and timelineDifferenceInHours.
    const timelineDifferenceInDays = differenceInDays(maxDate, minDate);
    const timelineDifferenceInHours = differenceInHours(maxDate, minDate);

    // Calculate centerOfGravity based on the extracted dates.
    const centerOfGravity =
      allDates.length > 0
        ? addDays(minDate, Math.floor(timelineDifferenceInDays / 2))
        : new Date();

    // Return all the calculated values as an object.
    return {
      minDate,
      maxDate,
      minCalendarDate, // The minimum date in the calendar based on the timeline data.
      maxCalendarDate, // The maximum date in the calendar based on the timeline data.
      timelineYears, // An array of years represented in the timeline data.
      totalNumberOfDays, // The total number of days covered by the timeline.
      totalNumberOfHours, // The total number of hours covered by the timeline.
      timelineDifferenceInDays, // The difference in days between the maximum and minimum dates in the timeline data.
      timelineDifferenceInHours, // The difference in hours between the maximum and minimum dates in the timeline data.
      centerOfGravity, // The calculated center of gravity date based on the timeline data.
      allDates, // An array containing all the dates extracted from the timeline data.
    } as TimelineDataComputedProperties;
  }, [endDateProperty, maxDateProp, minDateProp, rows, startDateProperty]);
};
