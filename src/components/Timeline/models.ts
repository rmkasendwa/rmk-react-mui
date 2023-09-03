import { BoxProps, TooltipProps } from '@mui/material';
import { ReactNode } from 'react';
import * as Yup from 'yup';

export const timeScaleOptions = [
  'Day',
  'Week',
  '2 week',
  'Month',
  'Quarter',
  'Year',
  '5 year',
] as const;
export type TimeScaleOption = (typeof timeScaleOptions)[number];

export const timeScaleOptionShortLabelMap: Record<TimeScaleOption, string> = {
  Day: 'D',
  Week: 'W',
  '2 week': '2W',
  Month: 'M',
  Quarter: 'Q',
  Year: 'Y',
  '5 year': '5Y',
};

export const fullMonthLabels = [
  'January',
  'Febuary',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const shortMonthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export interface TimeScaleRow extends Partial<BoxProps> {
  id: string;
  label: ReactNode;
  showLabel?: boolean;
}

export const timelineSearchParamValidationSpec = {
  timeScale: Yup.mixed<TimeScaleOption>().oneOf([...timeScaleOptions]),
  isCustomDatesSelected: Yup.boolean(),
  customDateRange: Yup.object({
    startDate: Yup.string(),
    endDate: Yup.string(),
  }),
};

export type ScrollToDateFunctionOptions = {
  /**
   * The scroll behaviour to use when scrolling to the date.
   */
  scrollBehaviour?: ScrollBehavior;

  /**
   * The alignment of the date in the timeline. This is used to anchor the date in the timeline when scrolling to it.
   *
   * @default 'center'
   */
  dateAlignment?: 'start' | 'center' | 'end';

  /**
   * The offset in pixels to apply to the scroll position when scrolling to the date.
   */
  scrollOffset?: number;
};

/**
 * A function that scrolls the timeline to the specified date.
 *
 * @param date The date to scroll to.
 * @param scrollBehaviour The scroll behaviour to use when scrolling to the date or an object containing additional options.
 */
export type ScrollToDateFunction = (
  date: Date | number | string,
  scrollBehaviour?: ScrollBehavior | ScrollToDateFunctionOptions
) => void;

export type TimeScaleConfiguration = {
  timeScaleRows: [TimeScaleRow[], TimeScaleRow[], TimeScaleRow[]];
  unitTimeScaleWidth: number;
  timeScaleWidth: number;
};

export type TimelineDataComputedProperties = {
  minDate: Date;
  maxDate: Date;
  minCalendarDate: Date;
  maxCalendarDate: Date;
  timelineYears: number[];
  totalNumberOfDays: number;
  totalNumberOfHours: number;
  timelineDifferenceInDays: number;
  timelineDifferenceInHours: number;
  centerOfGravity: Date;
  allDates: Date[];
};

export type TimelineElement = {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  label?: ReactNode;
  TooltipProps?: Partial<Omit<TooltipProps, 'ref'>>;
  percentage?: number;
  offsetPercentage?: number;
  timelineContainerWidth?: number;
  id?: string;
} & Partial<Omit<BoxProps, 'ref'>>;
