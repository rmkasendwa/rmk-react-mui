import {
  createDateWithoutTimezoneOffset,
  dateStringHasTimeComponent,
} from '@infinite-debugger/rmk-utils/dates';
import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Typography,
  TypographyProps,
  alpha,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  lighten,
  tableBodyClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours';
import formatDate from 'date-fns/format';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import { omit, result, uniqueId } from 'lodash';
import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import * as Yup from 'yup';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import { DragToScrollProps, useDragToScroll } from '../../hooks/Scrolling';
import { BaseDataRow, Table, TableColumn, TableProps } from '../Table';
import Tooltip, { TooltipProps } from '../Tooltip';
import {
  ScrollTimelineToolsProps,
  SelectCustomDatesTimeScaleCallbackFunction,
  SelectTimeScaleCallbackFunction,
  TimeScaleToolProps,
  useScrollTimelineTools,
  useTimeScaleTool,
} from './hooks';
import {
  ScrollToDateFunction,
  TimeScaleConfiguration,
  TimeScaleOption,
  TimeScaleRow,
  fullMonthLabels,
  quarterLabels,
  shortMonthLabels,
  timeScaleOptions,
  timelineSearchParamValidationSpec,
} from './models';
import TimeScaleMeter, {
  TimeScaleMeterProps,
  timeScaleMeterClasses,
} from './TimeScaleMeter';

export interface TimelineClasses {
  /** Styles applied to the root element. */
  root: string;
  timelineMeterContainer: string;
  rowLabelColumn: string;
  todayMarker: string;
  dateAtCursorMarker: string;
  dateAtCursorMarkerLabel: string;
  emptyTimelineRowPlaceholder: string;
}

export type TimelineClassKey = keyof TimelineClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeline: TimelineProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeline: keyof TimelineClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeline?: {
      defaultProps?: ComponentsProps['MuiTimeline'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeline'];
      variants?: ComponentsVariants['MuiTimeline'];
    };
  }
}

export interface TimelineElement extends Partial<BoxProps> {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  label?: ReactNode;
  TooltipProps?: Partial<TooltipProps>;
}

/**
 * Interface for the Timeline component props.
 * @template RecordRow - The type of each row in the timeline (extends BaseDataRow by default).
 */
export interface TimelineProps<RecordRow extends BaseDataRow = any>
  extends Partial<
    Pick<
      TableProps,
      | 'className'
      | 'sx'
      | 'parentBackgroundColor'
      | 'onClickRow'
      | 'forEachRowProps'
      | 'onChangeMinWidth'
    >
  > {
  /** The property from each row to be used as the label in the timeline. */
  rowLabelProperty?: keyof RecordRow;

  /** A function to get the label for each row in the timeline. */
  getRowLabel?: (row: RecordRow) => ReactNode;

  /** An array of rows to be displayed in the timeline. */
  rows: RecordRow[];

  /** An array of row IDs for the rows that are expanded in the timeline. */
  expandedRows?: string[];

  /** A boolean indicating whether all rows should be expanded in the timeline. */
  allRowsExpanded?: boolean;

  /** A function to be called when the expanded rows in the timeline change. */
  onChangeExpanded?: (expandedRows: string[]) => void;

  /** The property from each row to be used as the label for each timeline element. */
  timelineElementLabelProperty?: keyof RecordRow;

  /** A function to get the label for each timeline element. */
  getTimelineElementLabel?: (timelineElement: RecordRow) => ReactNode;

  /** A function to get custom tooltip props for each timeline element. */
  getTimelineElementTooltipProps?: (
    timelineElement: RecordRow
  ) => Partial<TooltipProps>;

  /** A function to get custom props for each timeline element. */
  getTimelineElementProps?: (timelineElement: RecordRow) => BoxProps;

  /** The property from each row to be used as the start date for each timeline element. */
  startDateProperty?: keyof RecordRow;

  /** The property from each row to be used as the end date for each timeline element. */
  endDateProperty?: keyof RecordRow;

  /** A boolean indicating whether to show the row labels column in the timeline. */
  showRowLabelsColumn?: boolean;

  /** The header content for the row labels column. */
  rowLabelsColumnHeader?: ReactNode;

  /** A function to get an array of timeline elements for each row. */
  getTimelineElements?: (row: RecordRow) => TimelineElement[];

  /** An optional ID for the timeline component. */
  id?: string;

  /** The minimum date allowed in the timeline. */
  minDate?: string | number | Date;

  /** The maximum date allowed in the timeline. */
  maxDate?: string | number | Date;

  /** A function to get an array of timeline dates from the rows. */
  getTimelineDates?: (rows: RecordRow[]) => (string | number | Date)[];

  /** The selected time scale option for the timeline. */
  selectedTimeScale?: TimeScaleOption;

  /** A boolean indicating whether to clear the search state when the component unmounts. */
  clearSearchStateOnUnmount?: boolean;

  /** A function to get the default view reset function. */
  getDefaultViewResetFunction?: (resetToDefaultView: () => void) => void;

  /** The width of the row labels column. */
  rowLabelsColumnWidth?: number;

  /** A boolean indicating whether to show the toolbar in the timeline. */
  showToolBar?: boolean;

  /** An array of supported time scale options. */
  supportedTimeScales?: TimeScaleOption[];

  /** The variant for the "Today" marker in the timeline. */
  todayMarkerVariant?: 'default' | 'foregroundFullSpan';

  /** Custom props for the TimeScaleMeter component. */
  TimeScaleMeterProps?: Partial<
    Omit<
      TimeScaleMeterProps,
      | 'timeScaleRows'
      | 'timeScaleWidth'
      | 'scrollingElement'
      | 'leftOffset'
      | 'ref'
    >
  >;

  /** Custom props for the TimeScaleTool component. */
  TimeScaleToolProps?: Partial<TimeScaleToolProps>;

  /** Custom props for the ScrollTimelineTools component. */
  ScrollTimelineToolsProps?: Partial<ScrollTimelineToolsProps>;

  /** A function to be called when the selected time scale option changes. */
  onChangeSelectedTimeScale?: (selectedTimeScale: TimeScaleOption) => void;

  /** A function to be called when the selected custom dates time scale option changes. */
  onChangeSelectedCustomDatesTimeScale?: SelectCustomDatesTimeScaleCallbackFunction;

  /** A function to be called when the timeline date bounds change. */
  onChangeTimelineDateBounds?: (dateBounds: {
    minDate: Date;
    maxDate: Date;
  }) => void;

  /** A function to be called when the current date at the center of the timeline changes. */
  onChangeCurrentDateAtCenter?: (currentDateAtCenter: Date) => void;

  /** A function to get the scroll-to-date function for the timeline. */
  getScrollToDateFunction?: (scrollToDate: ScrollToDateFunction) => void;

  /** A function to get the select-time-scale function for the timeline. */
  getSelectTimeScaleFunction?: (
    selectTimeScale: SelectTimeScaleCallbackFunction
  ) => void;

  /** A function to get the select-custom-dates-time-scale function for the timeline. */
  getSelectCustomDatesTimeScaleFunction?: (
    selectCustomDatesTimeScale: SelectCustomDatesTimeScaleCallbackFunction
  ) => void;

  /** A function to get the jump-to-optimal-time-scale function for the timeline. */
  getJumpToOptimalTimeScaleFunction?: (
    jumpToOptimalTimeScale: () => void
  ) => void;

  /** A function to get the jump-to-previous-unit-time-scale function for the timeline. */
  getJumpToPreviousUnitTimeScaleFunction?: (
    jumpToPreviousUnitTimeScale: () => void
  ) => void;

  /** A function to get the jump-to-next-unit-time-scale function for the timeline. */
  getJumpToNextUnitTimeScaleFunction?: (
    jumpToNextUnitTimeScale: () => void
  ) => void;

  /** The default center for the timeline: either the center of the data set or the current date ("now"). */
  defaultTimelineCenter?: 'centerOfDataSet' | 'now';

  /** Custom props for the TodayIndicator component. */
  TodayIndicatorProps?: Partial<BoxProps>;

  /** An array of static rows with additional data, like timeline elements and label. */
  staticRows?: (BaseDataRow & {
    timelineElements: TimelineElement[];
    label?: ReactNode;
  })[];

  /** The HTMLElement or null that is the ancestor of the scrolling element. */
  scrollingAncenstorElement?: HTMLElement | null;

  /** The date format to be used in the timeline. */
  dateFormat?: string;

  /** Custom props for the DateAtCursorMarker component. */
  DateAtCursorMarkerProps?: Partial<BoxProps>;

  /** Custom props for the DateAtCursorMarkerLabel component. */
  DateAtCursorMarkerLabelProps?: Partial<Omit<TypographyProps, 'ref'>>;

  /** Custom props for the useDragToScroll hook. */
  DragToScrollProps?: Partial<Pick<DragToScrollProps, 'enableDragToScroll'>>;
}

export function getTimelineUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeline', slot);
}

export const timelineClasses: TimelineClasses = generateUtilityClasses(
  'MuiTimeline',
  [
    'root',
    'timelineMeterContainer',
    'rowLabelColumn',
    'todayMarker',
    'dateAtCursorMarker',
    'dateAtCursorMarkerLabel',
    'emptyTimelineRowPlaceholder',
  ]
);

const slots = {
  root: ['root'],
  timelineMeterContainer: ['timelineMeterContainer'],
  rowLabelColumn: ['rowLabelColumn'],
  todayMarker: ['todayMarker'],
  dateAtCursorMarker: ['dateAtCursorMarker'],
  dateAtCursorMarkerLabel: ['dateAtCursorMarkerLabel'],
  emptyTimelineRowPlaceholder: ['emptyTimelineRowPlaceholder'],
};

export const BaseTimeline = <RecordRow extends BaseDataRow>(
  inProps: TimelineProps<RecordRow>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTimeline' });
  const {
    className,
    rows,
    rowLabelProperty,
    getRowLabel,
    startDateProperty,
    endDateProperty,
    timelineElementLabelProperty,
    getTimelineElementLabel,
    getTimelineElementTooltipProps,
    getTimelineElementProps,
    getTimelineElements,
    showRowLabelsColumn = true,
    rowLabelsColumnHeader,
    id,
    minDate: minDateProp,
    maxDate: maxDateProp,
    selectedTimeScale: selectedTimeScaleProp,
    clearSearchStateOnUnmount = false,
    getDefaultViewResetFunction,
    rowLabelsColumnWidth = 256,
    getTimelineDates,
    showToolBar = true,
    supportedTimeScales = [...timeScaleOptions],
    TimeScaleMeterProps = {},
    ScrollTimelineToolsProps = {},
    onChangeSelectedTimeScale,
    onChangeSelectedCustomDatesTimeScale,
    getJumpToNextUnitTimeScaleFunction,
    getJumpToOptimalTimeScaleFunction,
    getJumpToPreviousUnitTimeScaleFunction,
    getScrollToDateFunction,
    getSelectTimeScaleFunction,
    getSelectCustomDatesTimeScaleFunction,
    todayMarkerVariant = 'default',
    TimeScaleToolProps,
    onChangeTimelineDateBounds,
    onChangeCurrentDateAtCenter,
    defaultTimelineCenter,
    TodayIndicatorProps = {},
    staticRows,
    dateFormat = 'MMM dd, yyyy hh:mm aa',
    DateAtCursorMarkerLabelProps = {},
    DateAtCursorMarkerProps = {},
    DragToScrollProps = {},
    sx,
    ...rest
  } = omit(props, 'parentBackgroundColor', 'scrollingAncenstorElement');

  let { parentBackgroundColor, scrollingAncenstorElement } = props;

  const classes = composeClasses(
    slots,
    getTimelineUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  //#region Sub component props
  const {
    variant: TimeScaleMeterPropsVariant = 'default',
    sx: TimeScaleMeterPropsSx,
    ...TimeScaleMeterPropsRest
  } = TimeScaleMeterProps;
  const { sx: TodayIndicatorPropsSx, ...TodayIndicatorPropsRest } =
    TodayIndicatorProps;
  const { sx: DateAtCursorMarkerPropsSx, ...DateAtCursorMarkerPropsRest } =
    DateAtCursorMarkerProps;
  const {
    sx: DateAtCursorMarkerLabelPropsSx,
    ...DateAtCursorMarkerLabelPropsRest
  } = DateAtCursorMarkerLabelProps;
  const { ...DragToScrollPropsRest } = DragToScrollProps;
  //#endregion

  //#region Refs
  const isInitialMountRef = useRef(true);
  const isScrollingToTimelineCenterRef = useRef(false);
  const isTimelineScrolledRef = useRef(false);
  const currentDateAtCenterRef = useRef<Date | null>(null);
  const currentDateAtCenterPositionLeftOffsetRef = useRef<number | null>(null);
  const lastDateAtCenterRef = useRef<Date | null>(null);
  const [timelineContainerElement, setTimelineContainerElement] =
    useState<HTMLTableElement | null>(null);
  if (!scrollingAncenstorElement && timelineContainerElement) {
    scrollingAncenstorElement = timelineContainerElement?.parentElement;
  }

  const todayMarkerRef = useRef<HTMLDivElement>(null);

  const getDefaultViewResetFunctionRef = useRef(getDefaultViewResetFunction);
  getDefaultViewResetFunctionRef.current = getDefaultViewResetFunction;

  const getTimelineDatesRef = useRef(getTimelineDates);
  getTimelineDatesRef.current = getTimelineDates;

  const onChangeSelectedTimeScaleRef = useRef(onChangeSelectedTimeScale);
  onChangeSelectedTimeScaleRef.current = onChangeSelectedTimeScale;

  const onChangeSelectedCustomDatesTimeScaleRef = useRef(
    onChangeSelectedCustomDatesTimeScale
  );
  onChangeSelectedCustomDatesTimeScaleRef.current =
    onChangeSelectedCustomDatesTimeScale;

  const onChangeTimelineDateBoundsRef = useRef(onChangeTimelineDateBounds);
  onChangeTimelineDateBoundsRef.current = onChangeTimelineDateBounds;

  const onChangeCurrentDateAtCenterRef = useRef(onChangeCurrentDateAtCenter);
  onChangeCurrentDateAtCenterRef.current = onChangeCurrentDateAtCenter;

  const getScrollToDateFunctionRef = useRef(getScrollToDateFunction);
  getScrollToDateFunctionRef.current = getScrollToDateFunction;

  const getSelectTimeScaleFunctionRef = useRef(getSelectTimeScaleFunction);
  getSelectTimeScaleFunctionRef.current = getSelectTimeScaleFunction;

  const getSelectCustomDatesTimeScaleFunctionRef = useRef(
    getSelectCustomDatesTimeScaleFunction
  );
  getSelectCustomDatesTimeScaleFunctionRef.current =
    getSelectCustomDatesTimeScaleFunction;

  const getJumpToOptimalTimeScaleFunctionRef = useRef(
    getJumpToOptimalTimeScaleFunction
  );
  getJumpToOptimalTimeScaleFunctionRef.current =
    getJumpToOptimalTimeScaleFunction;

  const getJumpToPreviousUnitTimeScaleFunctionRef = useRef(
    getJumpToPreviousUnitTimeScaleFunction
  );
  getJumpToPreviousUnitTimeScaleFunctionRef.current =
    getJumpToPreviousUnitTimeScaleFunction;

  const getJumpToNextUnitTimeScaleFunctionRef = useRef(
    getJumpToNextUnitTimeScaleFunction
  );
  getJumpToNextUnitTimeScaleFunctionRef.current =
    getJumpToNextUnitTimeScaleFunction;

  const supportedTimeScalesRef = useRef(supportedTimeScales);
  supportedTimeScalesRef.current = supportedTimeScales;
  //#endregion

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));
  const baseSpacingUnits = isSmallScreenSize ? 16 : 24;

  parentBackgroundColor || (parentBackgroundColor = palette.background.paper);

  const shouldShowRowLabelsColumn = (() => {
    return !isSmallScreenSize && showRowLabelsColumn;
  })();

  const {
    searchParams: {
      timeScale: searchParamsSelectedTimeScale,
      isCustomDatesSelected,
      customDateRange,
    },
    setSearchParams,
  } = useReactRouterDOMSearchParams({
    mode: 'json',
    spec: {
      ...timelineSearchParamValidationSpec,
      timeScale: Yup.mixed<TimeScaleOption>().oneOf([...supportedTimeScales]),
    },
    id,
    clearSearchStateOnUnmount,
  });

  useDragToScroll({
    targetElement: timelineContainerElement,
    scrollableElement: scrollingAncenstorElement,
    ...DragToScrollPropsRest,
  });

  /**
   * Memoized calculation of various timeline-related values and properties.
   */
  const {
    minCalendarDate, // The minimum date in the calendar (without time) based on the timeline data.
    maxCalendarDate, // The maximum date in the calendar (without time) based on the timeline data.
    timelineYears, // An array of years represented in the timeline data.
    totalNumberOfDays, // The total number of days covered by the timeline.
    totalNumberOfHours, // The total number of hours covered by the timeline.
    centerOfGravity, // The calculated center of gravity date based on the timeline data.
    allDates, // An array containing all the dates extracted from the timeline data.
    timelineDifferenceInDays, // The difference in days between the maximum and minimum dates in the timeline data.
    timelineDifferenceInHours, // The difference in hours between the maximum and minimum dates in the timeline data.
  } = useMemo(() => {
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
      minCalendarDate,
      maxCalendarDate,
      timelineYears,
      totalNumberOfDays,
      totalNumberOfHours,
      timelineDifferenceInDays,
      timelineDifferenceInHours,
      centerOfGravity,
      allDates,
    };
  }, [endDateProperty, maxDateProp, minDateProp, rows, startDateProperty]);

  useEffect(() => {
    onChangeTimelineDateBoundsRef.current?.({
      minDate: minCalendarDate,
      maxDate: maxCalendarDate,
    });
  }, [maxCalendarDate, minCalendarDate]);

  /**
   * Calculates the ideal optimal time scale for the timeline based on the timeline's data and viewport width.
   */
  const idealOptimalTimeScale = ((): TimeScaleOption => {
    // If there is only one date, the optimal time scale is set to 'Year'.
    if (allDates.length <= 1) {
      return 'Year';
    }

    // Calculate the width of the timeline viewport.
    const timelineViewPortWidth =
      (scrollingAncenstorElement?.offsetWidth || window.innerWidth) -
      (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0);

    // Determine the ideal optimal time scale based on the timeline's data and viewport width.
    if (
      timelineDifferenceInHours <= 24 &&
      timelineDifferenceInHours * 64 <= timelineViewPortWidth
    ) {
      return 'Day';
    }
    if (
      timelineDifferenceInDays <= 7 &&
      timelineDifferenceInDays * 200 <= timelineViewPortWidth
    ) {
      return 'Week';
    }
    if (
      timelineDifferenceInDays <= 14 &&
      timelineDifferenceInDays * 100 <= timelineViewPortWidth
    ) {
      return '2 week';
    }
    if (
      timelineDifferenceInDays <= 30 &&
      timelineDifferenceInDays * 60 <= timelineViewPortWidth
    ) {
      return 'Month';
    }
    if (timelineDifferenceInDays <= 90) {
      return 'Quarter';
    }
    if (timelineDifferenceInDays <= 365) {
      return 'Year';
    }
    return '5 year'; // If none of the conditions match, the ideal optimal time scale is set to '5 year'.
  })();

  /**
   * Calculates the final optimal time scale for the timeline based on the ideal optimal time scale and supported time scales.
   */
  const optimalTimeScale = (() => {
    // If the ideal optimal time scale is not supported, choose the nearest supported time scale.
    if (!supportedTimeScalesRef.current.includes(idealOptimalTimeScale)) {
      const lastSupportedTimeScale =
        supportedTimeScalesRef.current[
          supportedTimeScalesRef.current.length - 1
        ];
      if (
        timeScaleOptions.indexOf(idealOptimalTimeScale) >
        timeScaleOptions.indexOf(lastSupportedTimeScale)
      ) {
        return lastSupportedTimeScale;
      }
      return supportedTimeScalesRef.current[0];
    }
    return idealOptimalTimeScale; // If the ideal optimal time scale is supported, use it as the final optimal time scale.
  })();

  /**
   * Function to scroll the timeline to a specific date.
   *
   * @param date - The date to which the timeline should be scrolled.
   * @param scrollBehaviour - Optional. The scroll behavior to be used, defaults to 'smooth'.
   */
  const scrollToDate: ScrollToDateFunction = useCallback(
    (date, scrollBehaviour: ScrollBehavior = 'smooth') => {
      // Get the container element for the timeline meter container
      const timelineMeterContainerContainer =
        scrollingAncenstorElement?.querySelector(
          `.${classes.timelineMeterContainer}`
        ) as HTMLElement;

      // Check if the necessary elements are available and the date is within the valid range
      if (
        scrollingAncenstorElement &&
        timelineMeterContainerContainer &&
        isAfter(date, minCalendarDate) &&
        isBefore(date, maxCalendarDate)
      ) {
        // Calculate the percentage offset of the date within the timeline
        const offsetPercentage =
          differenceInHours(date, minCalendarDate) / totalNumberOfHours;

        // Get the width of the scrolling ancestor element and the timeline meter container
        const { offsetWidth: scrollingAncenstorElementOffsetWidth } =
          scrollingAncenstorElement;
        const { offsetWidth } = timelineMeterContainerContainer;

        // Scroll to the appropriate position within the timeline
        scrollingAncenstorElement.scrollTo({
          left:
            Math.round((offsetWidth - baseSpacingUnits) * offsetPercentage) +
            baseSpacingUnits -
            Math.round(
              (scrollingAncenstorElementOffsetWidth -
                (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0)) /
                2
            ),
          behavior: scrollBehaviour,
        });
      }
    },
    // Dependencies for the callback function
    [
      baseSpacingUnits,
      classes.timelineMeterContainer,
      maxCalendarDate,
      minCalendarDate,
      rowLabelsColumnWidth,
      scrollingAncenstorElement,
      shouldShowRowLabelsColumn,
      totalNumberOfHours,
    ]
  );
  const scrollToDateRef = useRef(scrollToDate);
  scrollToDateRef.current = scrollToDate;

  useEffect(() => {
    getScrollToDateFunctionRef.current?.(scrollToDate);
  }, [scrollToDate]);

  const selectedTimeScale = ((): TimeScaleOption => {
    if (searchParamsSelectedTimeScale) {
      return searchParamsSelectedTimeScale;
    }
    if (selectedTimeScaleProp) {
      return selectedTimeScaleProp;
    }
    return optimalTimeScale;
  })();

  /**
   * A function to adjust the visual elements related to the date cursor.
   *
   * @param timelineContainerElement - The timeline container element to calibrate the date cursor elements.
   */
  const caliberateDateCursorElements = (
    timelineContainerElement: HTMLDivElement
  ) => {
    // Get the today marker element from the timeline container
    const todayMarkerElement = timelineContainerElement.querySelector(
      `.${classes.todayMarker}`
    ) as HTMLElement;

    // If the today marker element is present, perform calibration
    if (todayMarkerElement) {
      // Get the height of the root container of the timeline
      const rootContainerHeight = timelineContainerElement.offsetHeight;

      // Get the timeline meter container element from the timeline container
      const timelineMeterContainer = timelineContainerElement.querySelector(
        `.${classes.timelineMeterContainer}`
      ) as HTMLElement;

      // Get the height of the timeline meter container
      const timelineContainerHeight = timelineMeterContainer?.offsetHeight;

      // Calculate the height and set it to the today marker element based on the todayMarkerVariant
      const height = (() => {
        if (todayMarkerVariant === 'foregroundFullSpan') {
          return rootContainerHeight;
        }
        if (rootContainerHeight != null && timelineContainerHeight != null) {
          return rootContainerHeight - timelineContainerHeight;
        }
      })();
      todayMarkerElement.style.height = height ? `${height}px` : '';

      // Calculate the top position and set it to the today marker element based on the todayMarkerVariant
      const top = (() => {
        if (
          todayMarkerVariant === 'foregroundFullSpan' &&
          timelineContainerHeight != null
        ) {
          return (
            -timelineContainerHeight +
            ((timelineMeterContainer.firstChild as HTMLElement).offsetHeight ||
              0)
          );
        }
      })();
      todayMarkerElement.style.top = top ? `${top}px` : '';
    }

    // Get the date at cursor marker element from the timeline container
    const dateAtCursorMarkerElement = timelineContainerElement.querySelector(
      `.${classes.dateAtCursorMarker}`
    ) as HTMLElement;

    // If the date at cursor marker element is present, perform calibration
    if (dateAtCursorMarkerElement) {
      // Get the height of the timeline meter container
      const timelineContainerHeight = (
        timelineContainerElement.querySelector(
          `.${classes.timelineMeterContainer}`
        ) as HTMLElement
      )?.offsetHeight;

      // Set the height of the date at cursor marker element to match the timeline meter container height
      if (timelineContainerHeight) {
        dateAtCursorMarkerElement.style.height = `${timelineContainerHeight}px`;
      }
    }

    if (currentDateAtCenterPositionLeftOffsetRef.current) {
      timelineContainerElement
        .querySelectorAll(`.${classes.emptyTimelineRowPlaceholder}`)
        .forEach((placeholderElement) => {
          (placeholderElement as HTMLDivElement).style.left = `calc(${
            currentDateAtCenterPositionLeftOffsetRef.current! * 100
          }% - 40px)`;
        });
    }
  };
  const caliberateDateCursorElementsRef = useRef(caliberateDateCursorElements);
  caliberateDateCursorElementsRef.current = caliberateDateCursorElements;

  useEffect(() => {
    onChangeSelectedTimeScaleRef.current?.(selectedTimeScale);
  }, [selectedTimeScale]);

  useEffect(() => {
    onChangeSelectedCustomDatesTimeScaleRef.current?.(
      isCustomDatesSelected,
      customDateRange
    );
  }, [customDateRange, isCustomDatesSelected]);

  const { timeScaleRows, unitTimeScaleWidth, timeScaleWidth } = useMemo(() => {
    const {
      timeScaleRows,
      unitTimeScaleWidth: baseUnitTimeScaleWidth,
      timeScaleWidth,
    } = ((): TimeScaleConfiguration => {
      const getDailyTickTimeScale = ({
        dayWidth,
        unitTimeScale,
        dayOfWeekFormat,
      }: {
        dayWidth: number;
        unitTimeScale: number;
        dayOfWeekFormat: string;
      }): TimeScaleConfiguration => {
        return {
          timeScaleRows: [
            timelineYears.flatMap((year) => {
              return fullMonthLabels.map((monthLabel) => {
                return {
                  id: uniqueId(),
                  label: `${monthLabel} ${year}`,
                };
              });
            }),
            (() => {
              if (TimeScaleMeterPropsVariant === 'compact') {
                return timelineYears.flatMap((year) => {
                  return fullMonthLabels.flatMap((_, index) => {
                    const unitTickDate = new Date(year, index, 1);
                    const daysInMonth = getDaysInMonth(unitTickDate);
                    return Array.from({ length: daysInMonth }).map(
                      (_, dayOfMonthIndex) => {
                        const tickDate = addDays(unitTickDate, dayOfMonthIndex);
                        const dayOfWeekIndex = tickDate.getDay();
                        return {
                          id: uniqueId(),
                          label: formatDate(
                            tickDate,
                            dayOfMonthIndex === 0 ? 'MMM d, yyyy' : 'EEE, MMM d'
                          ),
                          showLabel:
                            dayOfMonthIndex === 0 ||
                            (dayOfWeekIndex === 1 &&
                              dayOfMonthIndex >= 2 &&
                              daysInMonth - dayOfMonthIndex >= 2),
                          color: alpha(palette.text.primary, 0.3),
                          ...(() => {
                            if (dayOfMonthIndex === 0) {
                              return {
                                color: palette.text.primary,
                              };
                            }
                          })(),
                        } as TimeScaleRow;
                      }
                    );
                  });
                });
              }
              return timelineYears.flatMap((year) => {
                return fullMonthLabels.flatMap((_, index) => {
                  const unitTickDate = new Date(year, index, 1);
                  const daysInMonth = getDaysInMonth(unitTickDate);
                  return Array.from({ length: daysInMonth }).map((_, index) => {
                    const tickDate = addDays(unitTickDate, index);
                    return {
                      id: uniqueId(),
                      label: formatDate(tickDate, dayOfWeekFormat),
                    };
                  });
                });
              });
            })(),
            timelineYears.flatMap((year) => {
              return fullMonthLabels.flatMap((_, index) => {
                const unitTickDate = new Date(year, index, 1);
                const daysInMonth = getDaysInMonth(unitTickDate);
                return Array.from({ length: daysInMonth }).map(
                  (_, dayOfMonthIndex) => {
                    const tickDate = addDays(unitTickDate, dayOfMonthIndex);
                    const dayOfWeekIndex = tickDate.getDay();
                    return {
                      id: uniqueId(),
                      label: formatDate(tickDate, 'd'),
                      ...(() => {
                        if (TimeScaleMeterPropsVariant === 'compact') {
                          return {
                            sx: {
                              ...(() => {
                                if (dayOfWeekIndex === 1) {
                                  return {
                                    borderLeftColor: '#f00',
                                  };
                                }
                              })(),
                              ...(() => {
                                if (dayOfMonthIndex === 0) {
                                  return {
                                    borderLeftColor: palette.text.primary,
                                  };
                                }
                              })(),
                            },
                          };
                        }
                      })(),
                    };
                  }
                );
              });
            }),
          ],
          unitTimeScaleWidth: dayWidth * unitTimeScale,
          timeScaleWidth: totalNumberOfDays * dayWidth,
        };
      };

      const getMonthlyTickTimeScale = ({
        monthSplit,
        unitTimeScaleWidth,
        timeScaleWidth,
      }: {
        monthSplit: number;
        unitTimeScaleWidth: number;
        timeScaleWidth: number;
      }): TimeScaleConfiguration => {
        const totalTimeScaleRegions = timelineYears.length * 12 * monthSplit;
        return {
          timeScaleRows: [
            timelineYears.flatMap((year) => {
              return quarterLabels.map((quarter) => {
                const label = `${quarter} ${year}`;
                return {
                  id: uniqueId(),
                  label,
                };
              });
            }),
            (() => {
              if (TimeScaleMeterPropsVariant === 'compact') {
                return timelineYears.flatMap((year) => {
                  return fullMonthLabels.map((label, monthIndex) => {
                    return {
                      id: uniqueId(),
                      label: (() => {
                        if (
                          selectedTimeScale === 'Quarter' ||
                          monthIndex === 0
                        ) {
                          if (
                            selectedTimeScale === 'Quarter' &&
                            monthIndex % 3 === 0
                          ) {
                            return `Q${
                              Math.floor(monthIndex / 3) + 1
                            } ${label.slice(0, 3)} ${year}`;
                          }
                          return `${label.slice(0, 3)} ${year}`;
                        }
                        return label.slice(0, 3);
                      })(),
                      sx: {
                        color: alpha(palette.text.primary, 0.3),
                        ...(() => {
                          if (
                            (selectedTimeScale === 'Quarter' &&
                              monthIndex % 3 === 0) ||
                            monthIndex === 0
                          ) {
                            return {
                              color: palette.text.primary,
                            };
                          }
                        })(),
                      },
                    } as TimeScaleRow;
                  });
                });
              }
              return timelineYears.flatMap(() => {
                return fullMonthLabels.map((label) => {
                  return {
                    id: uniqueId(),
                    label,
                  };
                });
              });
            })(),
            timelineYears.flatMap((_, yearIndex) => {
              return Array.from({ length: 12 }).flatMap((_, monthIndex) => {
                return Array.from({ length: monthSplit }).map(
                  (_, periodIndex) => {
                    const unitTickDate = addDays(
                      minCalendarDate,
                      Math.round(
                        totalNumberOfDays *
                          (((yearIndex * 12 + monthIndex) * monthSplit +
                            periodIndex) /
                            totalTimeScaleRegions)
                      )
                    );
                    return {
                      id: uniqueId(),
                      label: unitTickDate.getDate(),
                      sx: {
                        ...(() => {
                          if (
                            (selectedTimeScale === 'Quarter' &&
                              monthIndex % 3 === 0 &&
                              periodIndex === 0) ||
                            (monthIndex === 0 && periodIndex === 0)
                          ) {
                            return {
                              borderLeftColor: palette.text.primary,
                            };
                          }
                        })(),
                      },
                    };
                  }
                );
              });
            }),
          ],
          unitTimeScaleWidth,
          timeScaleWidth,
        };
      };

      switch (selectedTimeScale) {
        case 'Day':
          const hourWidth = 64;
          return {
            timeScaleRows: [
              timelineYears.flatMap((year) => {
                return fullMonthLabels.flatMap((_, monthIndex) => {
                  return Array.from({
                    length: getDaysInMonth(new Date(year, monthIndex, 1)),
                  }).map((_, dayIndex) => {
                    return {
                      id: uniqueId(),
                      label: formatDate(
                        new Date(year, monthIndex, dayIndex + 1),
                        'MMMM d, yyyy'
                      ),
                    };
                  });
                });
              }),
              timelineYears.flatMap((year) => {
                return fullMonthLabels.flatMap((_, monthIndex) => {
                  return Array.from({
                    length: getDaysInMonth(new Date(year, monthIndex, 1)),
                  }).map((_, dayIndex) => {
                    return {
                      id: uniqueId(),
                      label: formatDate(
                        new Date(year, monthIndex, dayIndex + 1),
                        'EEEE'
                      ),
                    };
                  });
                });
              }),
              timelineYears.flatMap((year) => {
                return fullMonthLabels.flatMap((_, monthIndex) => {
                  return Array.from({
                    length: getDaysInMonth(new Date(year, monthIndex, 1)),
                  }).flatMap((_, dayIndex) => {
                    const tickDate = new Date(year, monthIndex, dayIndex + 1);
                    return Array.from({ length: 24 }).map((_, hourIndex) => {
                      return {
                        id: uniqueId(),
                        label: formatDate(addHours(tickDate, hourIndex), 'h a'),
                      };
                    });
                  });
                });
              }),
            ],
            unitTimeScaleWidth: 24 * hourWidth,
            timeScaleWidth: totalNumberOfHours * hourWidth,
          };
        case 'Week':
          return getDailyTickTimeScale({
            dayOfWeekFormat: 'EEEE',
            dayWidth: 200,
            unitTimeScale: 7,
          });
        case '2 week':
          return getDailyTickTimeScale({
            dayOfWeekFormat: 'EEE',
            dayWidth: 100,
            unitTimeScale: 15,
          });
        case 'Month':
          return getDailyTickTimeScale({
            dayOfWeekFormat: 'EEEEE',
            dayWidth: 60,
            unitTimeScale: 30,
          });
        case 'Quarter':
          return getMonthlyTickTimeScale({
            monthSplit: 4,
            unitTimeScaleWidth: 480 * 3,
            timeScaleWidth: 480 * 12 * timelineYears.length,
          });
        case 'Year':
          return getMonthlyTickTimeScale({
            monthSplit: (() => {
              if (TimeScaleMeterPropsVariant === 'compact') {
                return 1;
              }
              return 3;
            })(),
            unitTimeScaleWidth: 120 * 12,
            timeScaleWidth: 120 * 12 * timelineYears.length,
          });
        case '5 year': {
          const yearWidth = 360;
          const unitTimeScaleWidth = yearWidth * 5;
          return {
            timeScaleRows: [
              timelineYears.flatMap((year) => {
                return {
                  id: uniqueId(),
                  label: String(year),
                };
              }),
              timelineYears.flatMap(() => {
                return quarterLabels.map((quarter) => {
                  return {
                    id: uniqueId(),
                    label: quarter,
                  };
                });
              }),
              timelineYears.flatMap(() => {
                return shortMonthLabels.map((label) => {
                  return {
                    id: uniqueId(),
                    label,
                  };
                });
              }),
            ],
            unitTimeScaleWidth,
            timeScaleWidth: yearWidth * timelineYears.length,
          };
        }
      }
    })();

    const unitTimeScaleWidth = (() => {
      if (
        isCustomDatesSelected &&
        customDateRange?.startDate &&
        customDateRange?.endDate
      ) {
        const timeScaleHourWidth = (() => {
          switch (selectedTimeScale) {
            case 'Day':
              return baseUnitTimeScaleWidth / 24;
            case 'Week':
              return baseUnitTimeScaleWidth / (7 * 24);
            case '2 week':
              return baseUnitTimeScaleWidth / (2 * 7 * 24);
            case 'Month':
              return baseUnitTimeScaleWidth / (30 * 24);
            case 'Quarter':
              return baseUnitTimeScaleWidth / (3 * 30 * 24);
            case 'Year':
              return baseUnitTimeScaleWidth / (365 * 24);
            case '5 year':
              return baseUnitTimeScaleWidth / (5 * 365 * 24);
          }
        })();
        return (
          timeScaleHourWidth *
          differenceInHours(
            createDateWithoutTimezoneOffset(customDateRange.endDate),
            createDateWithoutTimezoneOffset(customDateRange.startDate)
          )
        );
      }
      return baseUnitTimeScaleWidth;
    })();

    return {
      timeScaleRows,
      unitTimeScaleWidth,
      timeScaleWidth,
    };
  }, [
    TimeScaleMeterPropsVariant,
    customDateRange?.endDate,
    customDateRange?.startDate,
    isCustomDatesSelected,
    minCalendarDate,
    palette.text.primary,
    selectedTimeScale,
    timelineYears,
    totalNumberOfDays,
    totalNumberOfHours,
  ]);

  //#region Unit time scaling
  const [timelineWidthScaleFactor, setTimelineWidthScaleFactor] = useState(
    () => {
      if (scrollingAncenstorElement) {
        return (
          (scrollingAncenstorElement.clientWidth -
            (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0)) /
          unitTimeScaleWidth
        );
      }
      return 1;
    }
  );

  useEffect(() => {
    if (scrollingAncenstorElement) {
      const resizeObserver = new ResizeObserver(() => {
        setTimelineWidthScaleFactor(() => {
          if (scrollingAncenstorElement) {
            return (
              (scrollingAncenstorElement.clientWidth -
                (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0)) /
              unitTimeScaleWidth
            );
          }
          return 1;
        });
      });
      resizeObserver.observe(scrollingAncenstorElement);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [
    rowLabelsColumnWidth,
    scrollingAncenstorElement,
    shouldShowRowLabelsColumn,
    unitTimeScaleWidth,
  ]);

  const { scaledUnitTimeScaleWidth, scaledTimeScaleWidth } = useMemo(() => {
    return {
      scaledUnitTimeScaleWidth: unitTimeScaleWidth * timelineWidthScaleFactor,
      scaledTimeScaleWidth: timeScaleWidth * timelineWidthScaleFactor,
    };
  }, [timeScaleWidth, timelineWidthScaleFactor, unitTimeScaleWidth]);
  //#endregion

  const resetToDefaultView = useRef(() => {
    setSearchParams(
      {
        timeScale: null,
      },
      {
        replace: true,
      }
    );
  });

  useEffect(() => {
    if (getDefaultViewResetFunctionRef.current) {
      getDefaultViewResetFunctionRef.current(resetToDefaultView.current);
    }
  }, []);

  /**
   * useEffect hook to add a scroll event listener to the scrolling ancestor element.
   * This hook calculates and updates the date at the start and center of the timeline,
   * and updates the current date at the center reference accordingly.
   */
  useEffect(() => {
    const parentElement = scrollingAncenstorElement;
    const timelineMeterContainer = scrollingAncenstorElement?.querySelector(
      `.${classes.timelineMeterContainer}`
    ) as HTMLElement;

    // Check if the required elements are present before attaching the scroll event listener.
    if (parentElement && timelineMeterContainer) {
      const scrollEventCallback = () => {
        if (!isScrollingToTimelineCenterRef.current) {
          isTimelineScrolledRef.current = true;
        }
        isScrollingToTimelineCenterRef.current = false;
        const { scrollLeft, offsetWidth: parentElementOffsetWidth } =
          parentElement;
        const { offsetWidth } = timelineMeterContainer;

        // Calculate the date at the start of the timeline based on the current scroll position.
        const dateAtStart = addHours(
          minCalendarDate,
          totalNumberOfHours *
            ((scrollLeft - baseSpacingUnits) / (offsetWidth - baseSpacingUnits))
        );

        // Hide or show the "today" markder based on whether it is before or after the date at the beginning of the timeline viewport.
        if (todayMarkerRef.current) {
          if (isBefore(new Date(), dateAtStart)) {
            todayMarkerRef.current.style.display = 'none';
          } else {
            todayMarkerRef.current.style.display = '';
          }
        }

        const leftOffset =
          (scrollLeft -
            baseSpacingUnits +
            Math.round(
              (parentElementOffsetWidth -
                (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0)) /
                2
            )) /
          (offsetWidth - baseSpacingUnits);

        // Calculate the date at the center of the timeline based on the current scroll position.
        const dateAtCenter = addHours(
          minCalendarDate,
          totalNumberOfHours * leftOffset
        );

        // Update the mutable ref with the current date at the center position left offset.
        currentDateAtCenterPositionLeftOffsetRef.current = leftOffset;

        // Update the mutable ref with the current date at the center.
        currentDateAtCenterRef.current = dateAtCenter;

        // Call the provided callback function to notify about the updated date at the center.
        onChangeCurrentDateAtCenterRef.current?.(dateAtCenter);

        // Calibrate date cursor elements in the timeline container if available.
        if (timelineContainerElement) {
          caliberateDateCursorElementsRef.current(timelineContainerElement);
        }
      };

      // Attach the scroll event listener to the parentElement.
      parentElement.addEventListener('scroll', scrollEventCallback);

      // Remove the scroll event listener when the component is unmounted.
      return () => {
        return parentElement.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [
    baseSpacingUnits,
    classes.timelineMeterContainer,
    minCalendarDate,
    rowLabelsColumnWidth,
    scrollingAncenstorElement,
    shouldShowRowLabelsColumn,
    timelineContainerElement,
    totalNumberOfHours,
  ]);

  /**
   * Generates a timeline element node based on the provided start and end dates, label, and other props.
   * @param TimelineElement - Object containing the properties for the timeline element.
   * @returns ReactNode - The generated timeline element node.
   */
  const getTimelineElementNode = ({
    startDate: startDateValue,
    endDate: endDateValue,
    label,
    TooltipProps = {},
    sx,
    ...rest
  }: TimelineElement) => {
    if (startDateValue) {
      const startDate = createDateWithoutTimezoneOffset(startDateValue as any);

      // Check if the provided start date is a valid date.
      if (!isNaN(startDate.getTime())) {
        const endDate = (() => {
          if (endDateValue) {
            const endDate = createDateWithoutTimezoneOffset(
              endDateValue as any
            );

            // Check if the provided end date is a valid date.
            if (!isNaN(endDate.getTime())) {
              // If the end date is provided as a string without a time component, set the time to 23:59:59.999.
              if (
                typeof endDateValue === 'string' &&
                !dateStringHasTimeComponent(endDateValue)
              ) {
                endDate.setHours(23, 59, 59, 999);
              }
              return endDate;
            }
          }
          // If no valid end date is provided, use the maximum calendar date as the end date.
          return maxCalendarDate;
        })();

        // Check if the end date is after the start date.
        if (isAfter(endDate, startDate)) {
          const numberOfHours = differenceInHours(endDate, startDate);
          const offsetPercentage =
            differenceInHours(startDate, minCalendarDate) / totalNumberOfHours;
          const percentage = numberOfHours / totalNumberOfHours;

          // Create the base label for the timeline element using the start and end dates.
          const baseTimelineElementLabel = `${formatDate(
            startDate,
            'MMM dd, yyyy'
          )} - ${formatDate(endDate, 'MMM dd, yyyy')}`;

          // Determine the final timeline element label to be displayed.
          const timelineElementLabel = (() => {
            if (label) {
              return label;
            }
            return baseTimelineElementLabel;
          })();

          const {
            PopperProps: TooltipPropsPopperProps = {},
            ...TooltipPropsRest
          } = TooltipProps;

          return (
            // Render the timeline element wrapped with a tooltip.
            <Tooltip
              title={baseTimelineElementLabel}
              enterDelay={1000}
              enterNextDelay={500}
              disableInteractive
              {...TooltipPropsRest}
              PopperProps={{
                ...TooltipPropsPopperProps,
                sx: {
                  zIndex: 9999,
                  ...TooltipPropsPopperProps.sx,
                },
              }}
            >
              <Box
                {...rest}
                sx={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  bgcolor: palette.primary.main,
                  color: palette.getContrastText(palette.primary.main),
                  border: `1px solid ${palette.divider}`,
                  borderRadius: 1,
                  height: 42,
                  '&:hover': {
                    zIndex: 1,
                  },
                  ...sx,
                  width: `${percentage * 100}%`,
                  position: 'absolute',
                  top: 0,
                  left: `${offsetPercentage * 100}%`,
                }}
              >
                <Typography
                  component="div"
                  variant="body2"
                  noWrap
                  sx={{
                    width: '100%',
                  }}
                >
                  {timelineElementLabel}
                </Typography>
              </Box>
            </Tooltip>
          );
        }
      }
    }
  };

  useEffect(() => {
    if (timelineContainerElement) {
      const observer = new ResizeObserver(() => {
        if (!isTimelineScrolledRef.current) {
          isScrollingToTimelineCenterRef.current = true;
          switch (defaultTimelineCenter) {
            case 'now':
              scrollToDateRef.current(new Date(), 'auto');
              break;
            case 'centerOfDataSet':
            default:
              scrollToDateRef.current(centerOfGravity, 'auto');
              break;
          }
        }
      });
      observer.observe(timelineContainerElement);
      return () => {
        observer.disconnect();
      };
    }
  }, [centerOfGravity, defaultTimelineCenter, timelineContainerElement]);

  useEffect(() => {
    if (
      selectedTimeScale &&
      lastDateAtCenterRef.current &&
      scrollingAncenstorElement
    ) {
      scrollToDateRef.current(lastDateAtCenterRef.current, 'auto');
      lastDateAtCenterRef.current = null;
    }
  }, [scrollingAncenstorElement, selectedTimeScale]);

  useEffect(() => {
    const timelineMeterContainerElement =
      timelineContainerElement?.querySelector(
        `.${classes.timelineMeterContainer}`
      ) as HTMLElement;
    const dateAtCursorMarkerElement = timelineContainerElement?.querySelector(
      `.${classes.dateAtCursorMarker}`
    ) as HTMLElement;
    const dateAtCursorMarkerLabelElement =
      dateAtCursorMarkerElement?.querySelector(
        `.${classes.dateAtCursorMarkerLabel}`
      ) as HTMLElement;
    if (
      timelineMeterContainerElement &&
      scrollingAncenstorElement &&
      timelineContainerElement &&
      dateAtCursorMarkerElement &&
      dateAtCursorMarkerLabelElement
    ) {
      const mouseMoveEventCallback = (event: MouseEvent) => {
        const { offsetWidth } = timelineMeterContainerElement;
        const { left } = scrollingAncenstorElement!.getBoundingClientRect();
        const { clientX } = event;
        const localX = clientX - left;
        const timelineX =
          localX -
          (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0) -
          baseSpacingUnits +
          scrollingAncenstorElement!.scrollLeft;
        if (timelineX >= 0) {
          const percentageAtMousePosition =
            timelineX / (offsetWidth - baseSpacingUnits);
          const dateAtMousePosition = addHours(
            minCalendarDate,
            totalNumberOfHours * percentageAtMousePosition
          );
          dateAtCursorMarkerElement.style.left = `${timelineX}px`;
          dateAtCursorMarkerLabelElement.innerText = formatDate(
            dateAtMousePosition,
            dateFormat
          );
        }
      };
      scrollingAncenstorElement.addEventListener(
        'mousemove',
        mouseMoveEventCallback
      );
      return () => {
        return scrollingAncenstorElement?.removeEventListener(
          'mousemove',
          mouseMoveEventCallback
        );
      };
    }
  }, [
    baseSpacingUnits,
    classes.dateAtCursorMarker,
    classes.dateAtCursorMarkerLabel,
    classes.timelineMeterContainer,
    dateFormat,
    minCalendarDate,
    rowLabelsColumnWidth,
    scrollingAncenstorElement,
    shouldShowRowLabelsColumn,
    timelineContainerElement,
    totalNumberOfHours,
  ]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  //#region TimeScale Tool
  const onSelectTimeScale: SelectTimeScaleCallbackFunction = useCallback(
    (timeScale) => {
      lastDateAtCenterRef.current = currentDateAtCenterRef.current;
      setSearchParams(
        {
          timeScale,
        },
        {
          replace: true,
        }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    getSelectTimeScaleFunctionRef.current?.(onSelectTimeScale);
  }, [onSelectTimeScale]);

  const onSelectCustomDatesTimeScale: SelectCustomDatesTimeScaleCallbackFunction =
    useCallback(
      (isCustomDatesTimeScaleSelected, selectedCustomDates) => {
        if (isCustomDatesTimeScaleSelected) {
          setSearchParams(
            {
              isCustomDatesSelected: true,
              customDateRange: (() => {
                if (selectedCustomDates) {
                  return {
                    ...selectedCustomDates,
                    endDate: selectedCustomDates.endDate || undefined,
                  };
                }
                return null;
              })(),
            },
            {
              replace: true,
            }
          );
        } else {
          setSearchParams(
            {
              isCustomDatesSelected: null,
            },
            {
              replace: true,
            }
          );
        }
      },
      [setSearchParams]
    );

  useEffect(() => {
    getSelectCustomDatesTimeScaleFunctionRef.current?.(
      onSelectCustomDatesTimeScale
    );
  }, [onSelectCustomDatesTimeScale]);

  const { element: timeScaleToolElement } = useTimeScaleTool({
    ...TimeScaleToolProps,
    selectedTimeScale,
    supportedTimeScales,
    onSelectTimeScale,
    onSelectCustomDatesTimeScale,
    isCustomDatesTimeScaleSelected: isCustomDatesSelected,
    selectedCustomDates: customDateRange,
  });
  //#endregion

  //#region Scroll Timeline Tools
  const jumpToOptimalTimeScale = useCallback(() => {
    lastDateAtCenterRef.current = centerOfGravity;
    if (selectedTimeScale !== optimalTimeScale) {
      setSearchParams(
        {
          timeScale: optimalTimeScale,
        },
        {
          replace: true,
        }
      );
    } else {
      scrollToDate(centerOfGravity);
    }
  }, [
    centerOfGravity,
    optimalTimeScale,
    scrollToDate,
    selectedTimeScale,
    setSearchParams,
  ]);

  useEffect(() => {
    getJumpToOptimalTimeScaleFunctionRef.current?.(jumpToOptimalTimeScale);
  }, [jumpToOptimalTimeScale]);

  const jumpToPreviousUnitTimeScale = useCallback(() => {
    scrollingAncenstorElement?.scrollBy({
      left: -scaledUnitTimeScaleWidth,
      behavior: 'smooth',
    });
  }, [scrollingAncenstorElement, scaledUnitTimeScaleWidth]);

  useEffect(() => {
    getJumpToPreviousUnitTimeScaleFunctionRef.current?.(
      jumpToPreviousUnitTimeScale
    );
  }, [jumpToPreviousUnitTimeScale]);

  const jumpToNextUnitTimeScale = useCallback(() => {
    scrollingAncenstorElement?.scrollBy({
      left: scaledUnitTimeScaleWidth,
      behavior: 'smooth',
    });
  }, [scrollingAncenstorElement, scaledUnitTimeScaleWidth]);

  useEffect(() => {
    getJumpToNextUnitTimeScaleFunctionRef.current?.(jumpToNextUnitTimeScale);
  }, [jumpToNextUnitTimeScale]);

  const { element: scrollTimelineToolsElement } = useScrollTimelineTools({
    ...ScrollTimelineToolsProps,
    JumpToDateToolProps: {
      minDate: minCalendarDate,
      maxDate: maxCalendarDate,
      selectedDate: currentDateAtCenterRef.current,
    },
    scrollToDate,
    jumpToOptimalTimeScale,
    jumpToPreviousUnitTimeScale,
    jumpToNextUnitTimeScale,
  });
  //#endregion

  const columns: TableColumn<RecordRow>[] = [
    {
      id: 'timelineElements',
      label: (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
          }}
        >
          <TimeScaleMeter
            {...TimeScaleMeterPropsRest}
            timeScaleRows={timeScaleRows}
            timeScaleWidth={scaledTimeScaleWidth}
            scrollingElement={scrollingAncenstorElement}
            leftOffset={
              (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0) +
              baseSpacingUnits
            }
            variant={TimeScaleMeterPropsVariant}
            sx={{
              ...TimeScaleMeterPropsSx,
              [`.${timeScaleMeterClasses.timeScaleLevel1Tick}`]: {
                left:
                  (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0) +
                  (() => {
                    if (shouldShowRowLabelsColumn) {
                      return 16;
                    }
                    return baseSpacingUnits;
                  })(),
              },
            }}
          />
          {(() => {
            const today = new Date();
            if (
              isAfter(today, minCalendarDate) &&
              isBefore(today, maxCalendarDate)
            ) {
              const offsetPercentage =
                differenceInHours(today, minCalendarDate) / totalNumberOfHours;
              return (
                <Box
                  ref={todayMarkerRef}
                  {...TodayIndicatorPropsRest}
                  className={clsx(
                    classes.todayMarker,
                    TodayIndicatorPropsRest.className
                  )}
                  sx={{
                    width: 2,
                    bgcolor: palette.primary.main,
                    top: '100%',
                    ...TodayIndicatorPropsSx,
                    position: 'absolute',
                    left: `${offsetPercentage * 100}%`,
                    pointerEvents: 'none',
                  }}
                />
              );
            }
          })()}
          {(() => {
            const bgcolor = (palette.mode === 'light' ? lighten : darken)(
              palette.text.primary,
              0.5
            );
            return (
              <Box
                className={clsx(classes.dateAtCursorMarker)}
                {...DateAtCursorMarkerPropsRest}
                sx={{
                  width: '1px',
                  bgcolor,
                  ...DateAtCursorMarkerPropsSx,
                  bottom: 0,
                  position: 'absolute',
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  {...DateAtCursorMarkerLabelPropsRest}
                  className={clsx(classes.dateAtCursorMarkerLabel)}
                  noWrap
                  sx={{
                    py: 0.5,
                    px: 1,
                    bgcolor,
                    color: palette.background.paper,
                    borderBottomRightRadius: '4px',
                    fontSize: 12,
                    top: 0,
                    left: '100%',
                    ...DateAtCursorMarkerLabelPropsSx,
                    position: 'absolute',
                  }}
                ></Typography>
              </Box>
            );
          })()}
        </Box>
      ),
      getColumnValue: (row) => {
        const timelineElements = (() => {
          if (row.isTimelineStaticRow) {
            return row.timelineElements as TimelineElement[];
          }
          if (getTimelineElements) {
            return getTimelineElements(row);
          }
        })();
        if (timelineElements && timelineElements.length > 0) {
          return (
            <>
              {timelineElements
                .sort(
                  ({ startDate: aStartDate }, { startDate: bStartDate }) => {
                    if (aStartDate && bStartDate) {
                      return (
                        createDateWithoutTimezoneOffset(aStartDate).getTime() -
                        createDateWithoutTimezoneOffset(bStartDate).getTime()
                      );
                    }
                    return 0;
                  }
                )
                .map((timelineElement, index) => {
                  return (
                    <Fragment key={index}>
                      {getTimelineElementNode(timelineElement)}
                    </Fragment>
                  );
                })}
            </>
          );
        }
        if (startDateProperty && endDateProperty) {
          const timelineElementNode = getTimelineElementNode({
            startDate: result(row, startDateProperty),
            endDate: result(row, endDateProperty),
            label: ((): ReactNode => {
              if (getTimelineElementLabel) {
                return getTimelineElementLabel(row);
              }
              if (timelineElementLabelProperty) {
                return result(row, timelineElementLabelProperty);
              }
            })(),
            TooltipProps: (() => {
              if (getTimelineElementTooltipProps) {
                return getTimelineElementTooltipProps(row);
              }
            })(),
            ...(() => {
              if (getTimelineElementProps) {
                return getTimelineElementProps(row);
              }
            })(),
          });
          if (timelineElementNode) {
            return timelineElementNode;
          }
        }
        return (
          <Box
            className={clsx(classes.emptyTimelineRowPlaceholder)}
            sx={{
              width: 80,
              height: 2,
              position: 'absolute',
              bgcolor: palette.divider,
              top: `calc(50% - 1px)`,
              ...(() => {
                if (currentDateAtCenterPositionLeftOffsetRef.current) {
                  return {
                    left: `calc(${
                      currentDateAtCenterPositionLeftOffsetRef.current * 100
                    }% - 40px)`,
                  };
                }
              })(),
            }}
          />
        );
      },
      width: scaledTimeScaleWidth + baseSpacingUnits,
      wrapColumnContentInFieldValue: false,
      headerClassName: classes.timelineMeterContainer,
      headerSx: {
        cursor: 'move',
        '&>div': {
          py: 0,
          pl: `${baseSpacingUnits}px`,
          pr: 0,
        },
      },
      bodySx: {
        pl: `${baseSpacingUnits}px`,
        pr: 0,
        py: 0.5,
        '&>div': {
          height: 42,
        },
      },
    },
  ];

  if (shouldShowRowLabelsColumn) {
    columns.unshift({
      id: 'label',
      label: rowLabelsColumnHeader,
      width: rowLabelsColumnWidth,
      showHeaderText: Boolean(rowLabelsColumnHeader),
      getColumnValue: (row) => {
        if (row.isTimelineStaticRow) {
          return result(row, 'label');
        }
        if (getRowLabel) {
          return getRowLabel(row);
        }
        if (rowLabelProperty) {
          return result(row, rowLabelProperty);
        }
      },
      headerClassName: classes.rowLabelColumn,
      headerSx: {
        ...(() => {
          if (todayMarkerVariant === 'foregroundFullSpan') {
            return {
              zIndex: 3,
            };
          }
        })(),
        ...(() => {
          if (!rowLabelsColumnHeader) {
            return {
              borderRight: 'none !important',
              zIndex: 1,
              '&>div': {
                py: 0,
                pl: `${baseSpacingUnits}px`,
                pr: 0,
              },
            };
          }
        })(),
      },
      bodySx: {
        zIndex: 2,
        ...(() => {
          if (todayMarkerVariant === 'foregroundFullSpan') {
            return {
              zIndex: 3,
            };
          }
        })(),
      },
    });
    columns.push({
      id: 'gutter',
      label: 'Gutter',
      showHeaderText: false,
      headerSx: {
        '&>div': {
          p: 0,
        },
      },
      sx: {
        '&:last-of-type': {
          borderLeft: 'none !important',
        },
      },
    });
  }

  return (
    <>
      {showToolBar ? (
        <Box
          sx={{
            height: 0,
            zIndex: 5,
            position: 'sticky',
            top: 0,
            left: 0,
            display: 'flex',
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Grid
            container
            sx={{
              pr: `${baseSpacingUnits}px`,
              pl: 1,
              py: 1,
              position: 'sticky',
              right: 0,
              display: 'inline-flex',
              gap: isSmallScreenSize ? 0.5 : 2,
              bgcolor: parentBackgroundColor,
              height: 56,
              width: 'auto',
            }}
          >
            <Grid item>{timeScaleToolElement}</Grid>
            <Grid item>{scrollTimelineToolsElement}</Grid>
          </Grid>
        </Box>
      ) : null}
      <Table
        ref={mergeRefs([
          (rootElement: HTMLTableElement | null) => {
            if (rootElement) {
              caliberateDateCursorElements(rootElement);
              setTimelineContainerElement(rootElement);
            }
          },
          ref,
        ])}
        className={clsx(className, classes.root)}
        {...rest}
        parentBackgroundColor={parentBackgroundColor}
        columns={columns}
        rows={rows}
        paging={false}
        bordersVariant="square"
        {...(() => {
          if (!isSmallScreenSize) {
            return {
              startStickyColumnIndex: 0,
            };
          }
        })()}
        stickyHeader
        enableSmallScreenOptimization={false}
        HeaderRowProps={{
          sx: {
            position: 'relative',
            zIndex: 3,
            verticalAlign: 'bottom',
          },
        }}
        TableBodyRowPlaceholderProps={{
          sx: {
            height: 51,
          },
        }}
        staticRows={(() => {
          if (staticRows) {
            return staticRows.map((staticRow) => {
              return {
                ...staticRow,
                isTimelineStaticRow: true,
              } as any;
            });
          }
        })()}
        sx={{
          ...sx,
          [`.${tableBodyClasses.root} tr`]: {
            verticalAlign: 'middle',
          },
          [`.${classes.dateAtCursorMarker}`]: {
            display: 'none',
          },
          [`&:hover .${classes.dateAtCursorMarker}`]: {
            display: 'block',
          },
        }}
        minColumnWidth={0}
      />
    </>
  );
};

export const Timeline = forwardRef(BaseTimeline) as <
  RecordRow extends BaseDataRow
>(
  p: TimelineProps<RecordRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default Timeline;
