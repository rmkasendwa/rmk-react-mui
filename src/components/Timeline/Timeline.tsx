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
  generateUtilityClass,
  generateUtilityClasses,
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
import { useDragToScroll } from '../../hooks/Scrolling';
import { BaseDataRow, Table, TableColumn, TableProps } from '../Table';
import Tooltip, { TooltipProps } from '../Tooltip';
import {
  ScrollTimelineToolsProps,
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
  rowLabelProperty?: keyof RecordRow;
  getRowLabel?: (row: RecordRow) => ReactNode;
  rows: RecordRow[];
  expandedRows?: string[];
  allRowsExpanded?: boolean;
  onChangeExpanded?: (expandedRows: string[]) => void;
  timelineElementLabelProperty?: keyof RecordRow;
  getTimelineElementLabel?: (timelineElement: RecordRow) => ReactNode;
  getTimelineElementTooltipProps?: (
    timelineElement: RecordRow
  ) => Partial<TooltipProps>;
  getTimelineElementProps?: (timelineElement: RecordRow) => BoxProps;
  startDateProperty?: keyof RecordRow;
  endDateProperty?: keyof RecordRow;
  showRowLabelsColumn?: boolean;
  rowLabelsColumnHeader?: ReactNode;
  getTimelineElements?: (row: RecordRow) => TimelineElement[];
  id?: string;
  minDate?: string | number | Date;
  maxDate?: string | number | Date;
  getTimelineDates?: (rows: RecordRow[]) => (string | number | Date)[];
  selectedTimeScale?: TimeScaleOption;
  clearSearchStateOnUnmount?: boolean;
  getDefaultViewResetFunction?: (resetToDefaultView: () => void) => void;
  rowLabelsColumnWidth?: number;
  showToolBar?: boolean;
  supportedTimeScales?: TimeScaleOption[];
  todayMarkerVariant?: 'default' | 'foregroundFullSpan';
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
  TimeScaleToolProps?: Partial<TimeScaleToolProps>;
  ScrollTimelineToolsProps?: Partial<ScrollTimelineToolsProps>;
  onChangeSelectedTimeScale?: (selectedTimeScale: TimeScaleOption) => void;
  onChangeTimelineDateBounds?: (dateBounds: {
    minDate: Date;
    maxDate: Date;
  }) => void;
  onChangeCurrentDateAtCenter?: (currentDateAtCenter: Date) => void;
  getScrollToDateFunction?: (scrollToDate: ScrollToDateFunction) => void;
  getSelectTimeScaleFunction?: (
    selectTimeScale: SelectTimeScaleCallbackFunction
  ) => void;
  getJumpToOptimalTimeScaleFunction?: (
    jumpToOptimalTimeScale: () => void
  ) => void;
  getJumpToPreviousUnitTimeScaleFunction?: (
    jumpToPreviousUnitTimeScale: () => void
  ) => void;
  getJumpToNextUnitTimeScaleFunction?: (
    jumpToNextUnitTimeScale: () => void
  ) => void;
  defaultTimelineCenter?: 'centerOfDataSet' | 'now';
  TodayIndicatorProps?: Partial<BoxProps>;
  staticRows?: (BaseDataRow & {
    timelineElements: TimelineElement[];
    label?: ReactNode;
  })[];
  scrollingAncenstorElement?: HTMLElement | null;
  dateFormat?: string;
  DateAtCursorMarkerProps?: Partial<BoxProps>;
  DateAtCursorMarkerLabelProps?: Partial<Omit<TypographyProps, 'ref'>>;
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
  ]
);

const slots = {
  root: ['root'],
  timelineMeterContainer: ['timelineMeterContainer'],
  rowLabelColumn: ['rowLabelColumn'],
  todayMarker: ['todayMarker'],
  dateAtCursorMarker: ['dateAtCursorMarker'],
  dateAtCursorMarkerLabel: ['dateAtCursorMarkerLabel'],
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
    getJumpToNextUnitTimeScaleFunction,
    getJumpToOptimalTimeScaleFunction,
    getJumpToPreviousUnitTimeScaleFunction,
    getScrollToDateFunction,
    getSelectTimeScaleFunction,
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
  //#endregion

  //#region Refs
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const currentDateAtCenterRef = useRef<Date | null>(null);
  const lastDateAtCenterRef = useRef<Date | null>(null);
  const [timelineContainerElement, setTimelineContainerElement] =
    useState<HTMLTableElement | null>(null);
  if (!scrollingAncenstorElement && timelineContainerElement) {
    scrollingAncenstorElement = timelineContainerElement?.parentElement;
  }

  const todayIndicatorRef = useRef<HTMLDivElement>(null);

  const getDefaultViewResetFunctionRef = useRef(getDefaultViewResetFunction);
  getDefaultViewResetFunctionRef.current = getDefaultViewResetFunction;

  const getTimelineDatesRef = useRef(getTimelineDates);
  getTimelineDatesRef.current = getTimelineDates;

  const onChangeSelectedTimeScaleRef = useRef(onChangeSelectedTimeScale);
  onChangeSelectedTimeScaleRef.current = onChangeSelectedTimeScale;

  const onChangeTimelineDateBoundsRef = useRef(onChangeTimelineDateBounds);
  onChangeTimelineDateBoundsRef.current = onChangeTimelineDateBounds;

  const onChangeCurrentDateAtCenterRef = useRef(onChangeCurrentDateAtCenter);
  onChangeCurrentDateAtCenterRef.current = onChangeCurrentDateAtCenter;

  const getScrollToDateFunctionRef = useRef(getScrollToDateFunction);
  getScrollToDateFunctionRef.current = getScrollToDateFunction;

  const getSelectTimeScaleFunctionRef = useRef(getSelectTimeScaleFunction);
  getSelectTimeScaleFunctionRef.current = getSelectTimeScaleFunction;

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
    searchParams: { timeScale: searchParamsSelectedTimeScale },
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
  });

  const {
    minCalendarDate,
    maxCalendarDate,
    timelineYears,
    totalNumberOfDays,
    totalNumberOfHours,
    centerOfGravity,
    allDates,
    timelineDifferenceInDays,
    timelineDifferenceInHours,
  } = useMemo(() => {
    const allDates = (() => {
      if (getTimelineDatesRef.current) {
        const dates = getTimelineDatesRef.current(rows);
        return dates.map((date) => {
          return createDateWithoutTimezoneOffset(date);
        });
      }
      return rows.flatMap((row) => {
        const dates: Date[] = [];
        const startDateValue = (() => {
          if (startDateProperty) {
            return result(row, startDateProperty);
          }
        })();
        if (startDateValue) {
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
          if (endDateProperty) {
            return result(row, endDateProperty);
          }
        })();
        if (endDateValue) {
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

    const minDateYear = minCalendarDate.getFullYear();
    const maxDateYear = maxCalendarDate.getFullYear();
    const timelineYears: number[] = [];

    for (let year = minDateYear; year <= maxDateYear; year++) {
      timelineYears.push(year);
    }
    const totalNumberOfDays =
      differenceInDays(maxCalendarDate, minCalendarDate) + 1;
    const totalNumberOfHours =
      differenceInHours(maxCalendarDate, minCalendarDate) + 1;

    const timelineDifferenceInDays = differenceInDays(maxDate, minDate);
    const timelineDifferenceInHours = differenceInHours(maxDate, minDate);

    const centerOfGravity =
      allDates.length > 0
        ? addDays(minDate, Math.floor(timelineDifferenceInDays / 2))
        : new Date();

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

  const idealOptimalTimeScale = ((): TimeScaleOption => {
    if (allDates.length <= 1) {
      return 'Year';
    }
    const timelineViewPortWidth =
      (scrollingAncenstorElement?.offsetWidth || window.innerWidth) -
      (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0);

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
    return '5 year';
  })();

  const optimalTimeScale = (() => {
    if (!supportedTimeScalesRef.current.includes(idealOptimalTimeScale)) {
      if (
        timeScaleOptions.indexOf(idealOptimalTimeScale) >
        timeScaleOptions.indexOf(
          supportedTimeScalesRef.current[
            supportedTimeScalesRef.current.length - 1
          ]
        )
      ) {
        return supportedTimeScalesRef.current[
          supportedTimeScalesRef.current.length - 1
        ];
      }
      return supportedTimeScalesRef.current[0];
    }
    return idealOptimalTimeScale;
  })();

  const scrollToDate: ScrollToDateFunction = useCallback(
    (date, scrollBehaviour: ScrollBehavior = 'smooth') => {
      const timelineMeterContainerContainer =
        scrollingAncenstorElement?.querySelector(
          `.${classes.timelineMeterContainer}`
        ) as HTMLElement;
      if (
        scrollingAncenstorElement &&
        timelineMeterContainerContainer &&
        isAfter(date, minCalendarDate) &&
        isBefore(date, maxCalendarDate)
      ) {
        const offsetPercentage =
          differenceInHours(date, minCalendarDate) / totalNumberOfHours;
        const { offsetWidth: scrollingAncenstorElementOffsetWidth } =
          scrollingAncenstorElement;
        const { offsetWidth } = timelineMeterContainerContainer;

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

  const caliberateDateCursorElements = (
    timelineContainerElement: HTMLDivElement
  ) => {
    const todayMarkerElement = timelineContainerElement.querySelector(
      `.${classes.todayMarker}`
    ) as HTMLElement;
    if (todayMarkerElement) {
      const rootContainerHeight = timelineContainerElement.offsetHeight;
      const timelineMeterContainer = timelineContainerElement.querySelector(
        `.${classes.timelineMeterContainer}`
      ) as HTMLElement;
      const timelineContainerHeight = timelineMeterContainer?.offsetHeight;
      const height = (() => {
        if (todayMarkerVariant === 'foregroundFullSpan') {
          return rootContainerHeight;
        }
        if (rootContainerHeight != null && timelineContainerHeight != null) {
          return rootContainerHeight - timelineContainerHeight;
        }
      })();
      todayMarkerElement.style.height = height ? `${height}px` : '';

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

    const dateAtCursorMarkerElement = timelineContainerElement.querySelector(
      `.${classes.dateAtCursorMarker}`
    ) as HTMLElement;
    if (dateAtCursorMarkerElement) {
      const timelineContainerHeight = (
        timelineContainerElement.querySelector(
          `.${classes.timelineMeterContainer}`
        ) as HTMLElement
      )?.offsetHeight;
      if (timelineContainerHeight) {
        dateAtCursorMarkerElement.style.height = `${timelineContainerHeight}px`;
      }
    }
  };
  const caliberateDateCursorElementsRef = useRef(caliberateDateCursorElements);
  caliberateDateCursorElementsRef.current = caliberateDateCursorElements;

  useEffect(() => {
    onChangeSelectedTimeScaleRef.current?.(selectedTimeScale);
  }, [selectedTimeScale]);

  const { timeScaleRows, unitTimeScaleWidth, timeScaleWidth } =
    useMemo((): TimeScaleConfiguration => {
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
                return 2;
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
    }, [
      TimeScaleMeterPropsVariant,
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

  useEffect(() => {
    const parentElement = scrollingAncenstorElement;
    const timelineMeterContainer = scrollingAncenstorElement?.querySelector(
      `.${classes.timelineMeterContainer}`
    ) as HTMLElement;
    if (parentElement && timelineMeterContainer) {
      const scrollEventCallback = () => {
        const { scrollLeft, offsetWidth: parentElementOffsetWidth } =
          parentElement;
        const { offsetWidth } = timelineMeterContainer;
        const dateAtStart = addHours(
          minCalendarDate,
          totalNumberOfHours *
            ((scrollLeft - baseSpacingUnits) / (offsetWidth - baseSpacingUnits))
        );
        if (todayIndicatorRef.current) {
          if (isBefore(new Date(), dateAtStart)) {
            todayIndicatorRef.current.style.display = 'none';
          } else {
            todayIndicatorRef.current.style.display = '';
          }
        }

        const dateAtCenter = addHours(
          minCalendarDate,
          totalNumberOfHours *
            ((scrollLeft -
              baseSpacingUnits +
              Math.round(
                (parentElementOffsetWidth -
                  (shouldShowRowLabelsColumn ? rowLabelsColumnWidth : 0)) /
                  2
              )) /
              (offsetWidth - baseSpacingUnits))
        );
        currentDateAtCenterRef.current = dateAtCenter;
        onChangeCurrentDateAtCenterRef.current?.(dateAtCenter);
        if (timelineContainerElement) {
          caliberateDateCursorElementsRef.current(timelineContainerElement);
        }
      };
      parentElement.addEventListener('scroll', scrollEventCallback);
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
      if (!isNaN(startDate.getTime())) {
        const endDate = (() => {
          if (endDateValue) {
            const endDate = createDateWithoutTimezoneOffset(
              endDateValue as any
            );
            if (!isNaN(endDate.getTime())) {
              if (
                typeof endDateValue === 'string' &&
                !dateStringHasTimeComponent(endDateValue)
              ) {
                endDate.setHours(23, 59, 59, 999);
              }
              return endDate;
            }
          }
          return maxCalendarDate;
        })();
        if (isAfter(endDate, startDate)) {
          const numberOfHours = differenceInHours(endDate, startDate);
          const offsetPercentage =
            differenceInHours(startDate, minCalendarDate) / totalNumberOfHours;
          const percentage = numberOfHours / totalNumberOfHours;

          const baseTimelineElementLabel = `${formatDate(
            startDate,
            'MMM dd, yyyy'
          )} - ${formatDate(endDate, 'MMM dd, yyyy')}`;

          const timelineElementLabel = ((): ReactNode => {
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
    if (scrollingAncenstorElement) {
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
  }, [centerOfGravity, defaultTimelineCenter, scrollingAncenstorElement]);

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

  const { element: timeScaleToolElement } = useTimeScaleTool({
    ...TimeScaleToolProps,
    selectedTimeScale,
    supportedTimeScales,
    onSelectTimeScale,
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
                  ref={todayIndicatorRef}
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
          <Box
            className={clsx(classes.dateAtCursorMarker)}
            {...DateAtCursorMarkerPropsRest}
            sx={{
              width: 2,
              bgcolor: palette.text.primary,
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
                bgcolor: palette.text.primary,
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
        if (timelineElements) {
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
          return getTimelineElementNode({
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
        }
      },
      width: scaledTimeScaleWidth + baseSpacingUnits,
      wrapColumnContentInFieldValue: false,
      headerClassName: classes.timelineMeterContainer,
      headerSx: {
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
