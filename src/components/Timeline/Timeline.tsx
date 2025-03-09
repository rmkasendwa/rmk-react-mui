import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
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
  keyframes,
  lighten,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import {
  addHours,
  differenceInDays,
  differenceInHours,
  formatDate,
  isAfter,
  isBefore,
} from 'date-fns';
import { omit, result } from 'lodash';
import {
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import scrollIntoView from 'scroll-into-view-if-needed';
import * as Yup from 'yup';

import { useGlobalConfiguration } from '../../contexts/GlobalConfigurationContext';
import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import { DragToScrollProps, useDragToScroll } from '../../hooks/Scrolling';
import { BLACK_COLOR } from '../../theme';
import { BaseDataRow, Table, TableColumn, TableProps } from '../Table';
import { tableBodyColumnClasses } from '../Table/TableBodyColumn';
import { TooltipProps } from '../Tooltip';
import {
  ScrollTimelineToolsProps,
  SelectCustomDatesTimeScaleCallbackFunction,
  SelectTimeScaleCallbackFunction,
  SetDynamicallySelectedTimeScaleFunctionRef,
  TimeScaleToolProps,
  useScrollTimelineTools,
  useTimeScaleTool,
} from './hooks';
import { useTimelineDataComputedProperties } from './hooks/TimelineDataComputedProperties';
import { useTimeScaleMeterConfiguration } from './hooks/TimeScaleMeterConfiguration';
import {
  ScrollToDateFunction,
  ScrollToDateFunctionOptions,
  TimeScaleOption,
  TimelineDataComputedProperties,
  TimelineElement as TimelineElementType,
  timeScaleOptions,
  timelineSearchParamValidationSpec,
} from './models';
import TimelineRowDataContainer, {
  TimelineRowDataContainerProps,
  timelineRowDataContainerClasses,
} from './TimelineRowDataContainer';
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
  customDateRangeBlocker: string;
  flicker: string;
}

export type TimelineClassKey = keyof TimelineClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeline: TimelineProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeline: keyof TimelineClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeline?: {
      defaultProps?: ComponentsProps['MuiTimeline'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeline'];
      variants?: ComponentsVariants['MuiTimeline'];
    };
  }
}
//#endregion

export const getTimelineUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTimeline', slot);
};

const slots: Record<TimelineClassKey, [TimelineClassKey]> = {
  root: ['root'],
  timelineMeterContainer: ['timelineMeterContainer'],
  rowLabelColumn: ['rowLabelColumn'],
  todayMarker: ['todayMarker'],
  dateAtCursorMarker: ['dateAtCursorMarker'],
  dateAtCursorMarkerLabel: ['dateAtCursorMarkerLabel'],
  emptyTimelineRowPlaceholder: ['emptyTimelineRowPlaceholder'],
  customDateRangeBlocker: ['customDateRangeBlocker'],
  flicker: ['flicker'],
};

export const timelineClasses: TimelineClasses = generateUtilityClasses(
  'MuiTimeline',
  Object.keys(slots) as TimelineClassKey[]
);

export const flickerAnimation = keyframes`
  0% {
    opacity: 0;
  }
  10%,
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

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
      | 'isGroupedTable'
      | 'TableGroupingProps'
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
  getTimelineElements?: (row: RecordRow) => TimelineElementType[];

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

  /** The width of the row labels column. */
  rowLabelsColumnWidth?: number;

  RowLabelColumnProps?: Partial<TableColumn>;

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
      | 'scrollingAncenstorElementRef'
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

  /** The default center for the timeline: either the center of the data set or the current date ("now"). */
  defaultTimelineCenter?: 'centerOfDataSet' | 'now';

  /** Custom props for the TodayIndicator component. */
  TodayIndicatorProps?: Partial<BoxProps>;

  /** An array of static rows with additional data, like timeline elements and label. */
  staticRows?: (BaseDataRow & {
    timelineElements: TimelineElementType[];
    label?: ReactNode;
  })[];

  /** A boolean indicating whether to show the placeholder when the static row is empty. */
  showPlaceholderWhenStaticRowIsEmpty?: boolean;

  /** The HTMLElement or null that is the ancestor of the scrolling element. */
  scrollingAncenstorElementRef?: RefObject<HTMLElement | null | undefined>;

  /** The date format to be used in the timeline. */
  dateFormat?: string;

  /** Custom props for the DateAtCursorMarker component. */
  DateAtCursorMarkerProps?: Partial<BoxProps>;

  /** Custom props for the DateAtCursorMarkerLabel component. */
  DateAtCursorMarkerLabelProps?: Partial<Omit<TypographyProps, 'ref'>>;

  /** Custom props for the useDragToScroll hook. */
  DragToScrollProps?: Partial<Pick<DragToScrollProps, 'enableDragToScroll'>>;

  scrollToDateFunctionRef?: RefObject<ScrollToDateFunction | undefined>;
  selectTimeScaleFunctionRef?: RefObject<
    SelectTimeScaleCallbackFunction | undefined
  >;
  selectCustomDatesTimeScaleFunctionRef?: RefObject<
    SelectCustomDatesTimeScaleCallbackFunction | undefined
  >;
  jumpToOptimalTimeScaleFunctionRef?: RefObject<(() => void) | undefined>;
  jumpToPreviousUnitTimeScaleFunctionRef?: RefObject<(() => void) | undefined>;
  jumpToNextUnitTimeScaleFunctionRef?: RefObject<(() => void) | undefined>;

  minCalendarDateRef?: RefObject<Date | null>;
  maxCalendarDateRef?: RefObject<Date | null>;

  currentDateAtStartRef?: RefObject<Date | null>;
  currentDateAtCenterRef?: RefObject<Date | null>;
  currentDateAtEndRef?: RefObject<Date | null>;

  defaultViewResetFunctionRef?: RefObject<(() => void) | undefined>;

  blockCustomDateRangeRegion?: boolean;

  /**
   * Whether the timeline is the master timeline. A master timeline is a timeline that controls its own operations and
   * the operations of other timelines. If true the timeline will be able to control the operations of other timelines.
   * Otherwise, the timeline will be controlled by other timelines.
   *
   * @default true
   */
  isMasterTimeline?: boolean;

  /**
   * Function to be called when the timeline computed properties change.
   *
   * @param timelineDataComputedProperties The properties computed from the timeline data.
   */
  onChangeTimelineComputedProperties?: (
    timelineDataComputedProperties: TimelineDataComputedProperties
  ) => void;

  /**
   * The ids of the timeline elements that have just been added. The timeline will scroll to the first element in the
   * list and highlight the elements in the list.
   */
  newTimelineElementIds?: string[];

  /**
   * Ref to track the ids of the timeline elements that have just been added and scrolled to. This is used to prevent
   * the timeline from scrolling to the same elements multiple times.
   */
  lastNewTimelineElementIdsRef?: RefObject<string[] | undefined>;

  setDynamicallySelectedTimeScaleFunctionRef?: SetDynamicallySelectedTimeScaleFunctionRef;

  TimelineRowDataContainerProps?: Partial<TimelineRowDataContainerProps>;
}

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
    rowLabelsColumnWidth = 256,
    getTimelineDates,
    showToolBar = true,
    supportedTimeScales = [...timeScaleOptions],
    TimeScaleMeterProps = {},
    ScrollTimelineToolsProps = {},
    onChangeSelectedTimeScale,
    onChangeSelectedCustomDatesTimeScale,
    todayMarkerVariant = 'default',
    TimeScaleToolProps,
    onChangeTimelineDateBounds,
    onChangeCurrentDateAtCenter,
    defaultTimelineCenter,
    TodayIndicatorProps = {},
    staticRows,
    showPlaceholderWhenStaticRowIsEmpty = true,
    DateAtCursorMarkerLabelProps = {},
    DateAtCursorMarkerProps = {},
    DragToScrollProps = {},
    blockCustomDateRangeRegion = true,
    jumpToNextUnitTimeScaleFunctionRef,
    jumpToOptimalTimeScaleFunctionRef,
    jumpToPreviousUnitTimeScaleFunctionRef,
    scrollToDateFunctionRef,
    selectTimeScaleFunctionRef,
    selectCustomDatesTimeScaleFunctionRef,
    minCalendarDateRef,
    maxCalendarDateRef,
    currentDateAtStartRef: currentDateAtStartRefProp,
    currentDateAtCenterRef: currentDateAtCenterRefProp,
    currentDateAtEndRef: currentDateAtEndRefProp,
    RowLabelColumnProps,
    defaultViewResetFunctionRef,
    isMasterTimeline = true,
    onChangeTimelineComputedProperties,
    newTimelineElementIds,
    lastNewTimelineElementIdsRef,
    setDynamicallySelectedTimeScaleFunctionRef,
    TimelineRowDataContainerProps = {},
    sx,
    ...rest
  } = omit(
    props,
    'parentBackgroundColor',
    'scrollingAncenstorElementRef',
    'dateFormat'
  );

  let { parentBackgroundColor, scrollingAncenstorElementRef, dateFormat } =
    props;

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
  const { ...TimelineRowDataContainerPropsRest } =
    TimelineRowDataContainerProps;
  //#endregion

  //#region Refs
  const isInitialMountRef = useRef(true);
  const isScrollingToTimelineCenterRef = useRef(false);
  const isTimelineScrolledRef = useRef(false);
  const lastMouseEventRef = useRef<MouseEvent | null>(null);

  const currentDateAtStartRef = useRef<Date | null>(null);
  const currentDateAtCenterRef = useRef<Date | null>(null);
  const currentDateAtEndRef = useRef<Date | null>(null);

  const currentDateAtStartPositionLeftOffsetRef = useRef<number | undefined>(
    undefined
  );
  const currentDateAtCenterPositionLeftOffsetRef = useRef<number | undefined>(
    undefined
  );
  const currentDateAtEndPositionLeftOffsetRef = useRef<number | undefined>(
    undefined
  );
  const timelineContainerElementRef = useRef<HTMLTableElement | null>(null);

  const todayMarkerRef = useRef<HTMLDivElement>(null);

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

  const onChangeTimelineComputedPropertiesRef = useRef(
    onChangeTimelineComputedProperties
  );
  onChangeTimelineComputedPropertiesRef.current =
    onChangeTimelineComputedProperties;

  const supportedTimeScalesRef = useRef(supportedTimeScales);
  supportedTimeScalesRef.current = supportedTimeScales;

  const newTimelineElementIdsRef = useRef(newTimelineElementIds);
  newTimelineElementIdsRef.current = newTimelineElementIds;

  const hasScrolledToNewTimelineElementsRef = useRef(false);
  useEffect(() => {
    if (rows) {
      hasScrolledToNewTimelineElementsRef.current = false;
    }
  }, [rows]);

  const cancelMomentumTrackingRef = useRef<(() => void) | undefined>(undefined);
  const localScrollingAncenstorElementRef = useRef<
    HTMLTableElement | null | undefined
  >(null);
  scrollingAncenstorElementRef ??
    (scrollingAncenstorElementRef = localScrollingAncenstorElementRef);
  //#endregion

  useEffect(() => {
    if (
      scrollingAncenstorElementRef &&
      !scrollingAncenstorElementRef?.current
    ) {
      scrollingAncenstorElementRef.current =
        timelineContainerElementRef.current?.parentElement;
    }
  }, [scrollingAncenstorElementRef]);

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  parentBackgroundColor || (parentBackgroundColor = palette.background.paper);

  const shouldShowRowLabelsColumn = (() => {
    return !isSmallScreenSize && showRowLabelsColumn;
  })();

  const timelineViewPortLeftOffset = shouldShowRowLabelsColumn
    ? rowLabelsColumnWidth
    : 0;

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
    targetElementRef: timelineContainerElementRef,
    scrollableElementRef: scrollingAncenstorElementRef,
    ...DragToScrollPropsRest,
    cancelMomentumTrackingRef,
  });

  const { dateTimeFormat: globalDateTimeFormat } = useGlobalConfiguration();

  dateFormat || (dateFormat = globalDateTimeFormat);

  //#region Memoized calculation of various timeline-related values and properties.
  const timelineDataComputedProperties = useTimelineDataComputedProperties({
    rows,
    endDateProperty,
    startDateProperty,
    minDate: minDateProp,
    maxDate: maxDateProp,
    getTimelineDates,
  });
  //#endregion

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
  } = timelineDataComputedProperties;

  useEffect(() => {
    onChangeTimelineComputedPropertiesRef.current?.(
      timelineDataComputedProperties
    );
  }, [timelineDataComputedProperties]);

  minCalendarDateRef && (minCalendarDateRef.current = minCalendarDate);
  maxCalendarDateRef && (maxCalendarDateRef.current = maxCalendarDate);

  useEffect(() => {
    onChangeTimelineDateBoundsRef.current?.({
      minDate: minCalendarDate,
      maxDate: maxCalendarDate,
    });
  }, [maxCalendarDate, minCalendarDate]);

  const getIdealOptimalTimeScale = useCallback(
    (
      options:
        | {
            startDate: Date;
            endDate: Date;
          }
        | {
            timelineDifferenceInDays: number;
            timelineDifferenceInHours: number;
          }
    ): TimeScaleOption => {
      const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
      const timelineDifferenceInDays = (() => {
        if ('timelineDifferenceInDays' in options) {
          return options.timelineDifferenceInDays;
        }
        return differenceInDays(options.endDate, options.startDate);
      })();
      const timelineDifferenceInHours = (() => {
        if ('timelineDifferenceInHours' in options) {
          return options.timelineDifferenceInHours;
        }
        return differenceInHours(options.endDate, options.startDate);
      })();

      // Calculate the width of the timeline viewport.
      const timelineViewPortWidth =
        (scrollingAncenstorElement?.clientWidth || window.innerWidth) -
        timelineViewPortLeftOffset;

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
    },
    [scrollingAncenstorElementRef, timelineViewPortLeftOffset]
  );
  const getIdealOptimalTimeScaleRef = useRef(getIdealOptimalTimeScale);
  getIdealOptimalTimeScaleRef.current = getIdealOptimalTimeScale;

  /**
   * Calculates the ideal optimal time scale for the timeline based on the timeline's data and viewport width.
   */
  const idealOptimalTimeScale = useMemo(() => {
    // If there is only one date, the optimal time scale is set to 'Year'.
    if (allDates.length <= 1) {
      return 'Year';
    }
    return getIdealOptimalTimeScaleRef.current({
      timelineDifferenceInDays,
      timelineDifferenceInHours,
    });
  }, [allDates.length, timelineDifferenceInDays, timelineDifferenceInHours]);

  //#region Find fallback time scale if ideal timescale is not supported
  const optimalTimeScale = (() => {
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
    return idealOptimalTimeScale;
  })();
  //#endregion

  const getDateAtPercentage = useCallback(
    (percentage: number) => {
      return addHours(minCalendarDate, totalNumberOfHours * percentage);
    },
    [minCalendarDate, totalNumberOfHours]
  );
  const getDateAtPercentageRef = useRef(getDateAtPercentage);
  getDateAtPercentageRef.current = getDateAtPercentage;

  const getPercentageAtDate = useCallback(
    (date: Date) => {
      return differenceInHours(date, minCalendarDate) / totalNumberOfHours;
    },
    [minCalendarDate, totalNumberOfHours]
  );
  const getPercentageAtDateRef = useRef(getPercentageAtDate);
  getPercentageAtDateRef.current = getPercentageAtDate;

  const scrollToDate: ScrollToDateFunction = useCallback(
    (inDate, options = 'smooth') => {
      const date = createDateWithoutTimezoneOffset(inDate);
      if (!isNaN(date.getTime())) {
        const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
        const scrollBehaviour: ScrollBehavior = (() => {
          if (typeof options === 'string') {
            return options;
          }
          if (typeof options === 'object' && options.scrollBehaviour) {
            return options.scrollBehaviour;
          }
          return 'smooth';
        })();
        const { dateAlignment = 'center', scrollOffset = 0 } =
          ((): ScrollToDateFunctionOptions => {
            if (typeof options === 'string') {
              return {};
            }
            return options;
          })();
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
          cancelMomentumTrackingRef.current?.();
          // Calculate the percentage offset of the date within the timeline
          const offsetPercentage = getPercentageAtDateRef.current(date);

          // Get the width of the scrolling ancestor element and the timeline meter container
          const { clientWidth: scrollingAncenstorElementOffsetWidth } =
            scrollingAncenstorElement;
          const { clientWidth } = timelineMeterContainerContainer;
          let dateScrollLeftPosition =
            clientWidth * offsetPercentage + scrollOffset;
          switch (dateAlignment) {
            case 'center':
              dateScrollLeftPosition -=
                (scrollingAncenstorElementOffsetWidth -
                  timelineViewPortLeftOffset) /
                2;
              break;
            case 'end':
              dateScrollLeftPosition -=
                scrollingAncenstorElementOffsetWidth -
                timelineViewPortLeftOffset;
              break;
          }

          // Scroll to the appropriate position within the timeline
          scrollingAncenstorElement.scrollTo({
            left: dateScrollLeftPosition,
            behavior: scrollBehaviour,
          });
        }
      }
    },
    // Dependencies for the callback function
    [
      classes.timelineMeterContainer,
      maxCalendarDate,
      minCalendarDate,
      scrollingAncenstorElementRef,
      timelineViewPortLeftOffset,
    ]
  );
  const scrollToDateRef = useRef(scrollToDate);
  scrollToDateRef.current = scrollToDate;
  scrollToDateFunctionRef && (scrollToDateFunctionRef.current = scrollToDate);

  const selectedTimeScale = ((): TimeScaleOption => {
    if (
      isCustomDatesSelected &&
      customDateRange?.startDate &&
      customDateRange?.endDate
    ) {
      return getIdealOptimalTimeScale({
        startDate: createDateWithoutTimezoneOffset(customDateRange.startDate),
        endDate: createDateWithoutTimezoneOffset(customDateRange.endDate),
      });
    }
    if (searchParamsSelectedTimeScale) {
      return searchParamsSelectedTimeScale;
    }
    if (selectedTimeScaleProp) {
      return selectedTimeScaleProp;
    }
    return optimalTimeScale;
  })();

  useEffect(() => {
    if (
      selectedTimeScale === optimalTimeScale &&
      setDynamicallySelectedTimeScaleFunctionRef?.current
    ) {
      setDynamicallySelectedTimeScaleFunctionRef.current(optimalTimeScale);
    }
  }, [
    optimalTimeScale,
    selectedTimeScale,
    setDynamicallySelectedTimeScaleFunctionRef,
  ]);

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

    // Get the timeline meter container element from the timeline container
    const timelineMeterContainer = timelineContainerElement.querySelector(
      `.${classes.timelineMeterContainer}`
    ) as HTMLElement;

    const dateCursorHeight =
      timelineContainerElement.clientHeight -
      (timelineMeterContainer?.clientHeight ?? 0);

    // If the today marker element is present, perform calibration
    if (todayMarkerElement) {
      // Get the height of the timeline meter container
      const timelineContainerHeight = timelineMeterContainer?.clientHeight;

      // Calculate the height and set it to the today marker element based on the todayMarkerVariant
      const height = (() => {
        if (todayMarkerVariant === 'foregroundFullSpan') {
          return timelineContainerElement.clientHeight;
        }
        if (timelineContainerHeight != null) {
          return dateCursorHeight;
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
            ((timelineMeterContainer.firstChild as HTMLElement).clientHeight ||
              0)
          );
        }
      })();
      todayMarkerElement.style.top = top ? `${top}px` : '';
    }

    // Get the date at cursor marker element from the timeline container
    const [dateAtCursorMarkerElement, secondaryDateAtCursorMarkerElement] = [
      ...timelineContainerElement.querySelectorAll(
        `.${classes.dateAtCursorMarker}`
      ),
    ] as HTMLElement[];

    // If the date at cursor marker element is present, perform calibration
    if (dateAtCursorMarkerElement) {
      // Get the height of the timeline meter container
      const timelineContainerHeight = (
        timelineContainerElement.querySelector(
          `.${classes.timelineMeterContainer}`
        ) as HTMLElement
      )?.clientHeight;

      // Set the height of the date at cursor marker element to match the timeline meter container height
      if (timelineContainerHeight) {
        dateAtCursorMarkerElement.style.height = `${timelineContainerHeight}px`;
      }
    }

    if (secondaryDateAtCursorMarkerElement) {
      secondaryDateAtCursorMarkerElement.style.height = `${dateCursorHeight}px`;
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

    if (currentDateAtStartPositionLeftOffsetRef.current) {
      timelineContainerElement
        .querySelectorAll(
          `.${timelineRowDataContainerClasses.navigationButtonsContainer}`
        )
        .forEach((placeholderElement) => {
          (placeholderElement as HTMLDivElement).style.left = `${
            currentDateAtStartPositionLeftOffsetRef.current! * 100
          }%`;
        });
    }

    timelineContainerElement
      .querySelectorAll(`.${classes.customDateRangeBlocker}`)
      .forEach((customDateRangeBlockerElement) => {
        (
          customDateRangeBlockerElement as HTMLDivElement
        ).style.height = `${dateCursorHeight}px`;
      });
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

  const {
    timeScaleRows,
    scaledUnitTimeScaleWidth,
    scaledTimeScaleWidth,
    timelineViewPortContainerWidth,
  } = useTimeScaleMeterConfiguration({
    selectedTimeScale,
    minCalendarDate,
    timelineYears,
    TimeScaleMeterPropsVariant,
    totalNumberOfDays,
    totalNumberOfHours,
    customDateRange,
    isCustomDatesSelected,
    scrollingAncenstorElementRef,
    timelineViewPortLeftOffset,
  });

  defaultViewResetFunctionRef &&
    (defaultViewResetFunctionRef.current = () => {
      isTimelineScrolledRef.current = false;
      isScrollingToTimelineCenterRef.current = true;
      setSearchParams(
        {
          timeScale: null,
          customDateRange: null,
          isCustomDatesSelected: null,
        },
        {
          replace: true,
        }
      );
    });

  const updateDateAtCursor = () => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    const timelineMeterContainerElement =
      timelineContainerElementRef.current?.querySelector(
        `.${classes.timelineMeterContainer}`
      ) as HTMLElement;
    const dateAtCursorMarkerLabelElement =
      timelineContainerElementRef.current?.querySelector(
        `.${classes.dateAtCursorMarker}>.${classes.dateAtCursorMarkerLabel}`
      ) as HTMLElement;
    if (
      lastMouseEventRef.current &&
      timelineMeterContainerElement &&
      scrollingAncenstorElement &&
      dateAtCursorMarkerLabelElement
    ) {
      const event = lastMouseEventRef.current;
      const { clientWidth: timelineMeterContainerElementClientWidth } =
        timelineMeterContainerElement;
      const { left } = scrollingAncenstorElement!.getBoundingClientRect();
      const { clientX } = event;
      const localX = clientX - left;
      let timelineX =
        localX -
        timelineViewPortLeftOffset +
        scrollingAncenstorElement!.scrollLeft;

      timelineX > 0 || (timelineX = 0);
      timelineX < timelineMeterContainerElementClientWidth ||
        (timelineX = timelineMeterContainerElementClientWidth);

      const percentageAtMousePosition =
        timelineX / timelineMeterContainerElementClientWidth;
      const dateAtMousePosition = getDateAtPercentageRef.current(
        percentageAtMousePosition
      );
      timelineContainerElementRef.current
        ?.querySelectorAll(`.${classes.dateAtCursorMarker}`)
        .forEach((dateAtCursorMarkerElement: any) => {
          dateAtCursorMarkerElement.style.left = `${timelineX}px`;
        });
      dateAtCursorMarkerLabelElement.innerText = formatDate(
        dateAtMousePosition,
        dateFormat!
      );
      const { clientWidth: scrollingAncenstorElementClientWidth } =
        scrollingAncenstorElement!;
      if (
        scrollingAncenstorElementClientWidth - localX <
        (scrollingAncenstorElementClientWidth - timelineViewPortLeftOffset) / 2
      ) {
        dateAtCursorMarkerLabelElement.style.right = '100%';
        dateAtCursorMarkerLabelElement.style.left = '';
        dateAtCursorMarkerLabelElement.style.borderBottomRightRadius = '';
        dateAtCursorMarkerLabelElement.style.borderBottomLeftRadius = '4px';
      } else {
        dateAtCursorMarkerLabelElement.style.right = '';
        dateAtCursorMarkerLabelElement.style.left = '100%';
        dateAtCursorMarkerLabelElement.style.borderBottomRightRadius = '4px';
        dateAtCursorMarkerLabelElement.style.borderBottomLeftRadius = '';
      }
    }
  };
  const updateDateAtCursorRef = useRef(updateDateAtCursor);
  updateDateAtCursorRef.current = updateDateAtCursor;

  const updateDatesAtTimelinePoints = () => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    const timelineMeterContainer = scrollingAncenstorElement?.querySelector(
      `.${classes.timelineMeterContainer}`
    ) as HTMLElement;
    if (scrollingAncenstorElement && timelineMeterContainer) {
      const { scrollLeft, clientWidth: parentElementClientWidth } =
        scrollingAncenstorElement;
      if (!isScrollingToTimelineCenterRef.current) {
        isTimelineScrolledRef.current = true;
      }
      isScrollingToTimelineCenterRef.current = false;
      const { clientWidth } = timelineMeterContainer;

      const startX = scrollLeft / clientWidth;
      currentDateAtStartPositionLeftOffsetRef.current = startX;
      const dateAtStart = addHours(
        minCalendarDate,
        totalNumberOfHours * startX
      );
      currentDateAtStartRef.current = dateAtStart;
      currentDateAtStartRefProp &&
        (currentDateAtStartRefProp.current = dateAtStart);

      // Hide or show the "today" markder based on whether it is before or after the date at the beginning of the timeline viewport.
      if (todayMarkerRef.current) {
        if (isBefore(new Date(), dateAtStart)) {
          todayMarkerRef.current.style.display = 'none';
        } else {
          todayMarkerRef.current.style.display = '';
        }
      }

      const centerX =
        (scrollLeft +
          (parentElementClientWidth - timelineViewPortLeftOffset) / 2) /
        clientWidth;
      const dateAtCenter = addHours(
        minCalendarDate,
        totalNumberOfHours * centerX
      );
      currentDateAtCenterPositionLeftOffsetRef.current = centerX;
      currentDateAtCenterRef.current = dateAtCenter;
      currentDateAtCenterRefProp &&
        (currentDateAtCenterRefProp.current = dateAtCenter);

      const endX =
        (scrollLeft + parentElementClientWidth - timelineViewPortLeftOffset) /
        clientWidth;
      currentDateAtEndPositionLeftOffsetRef.current = endX;
      const dateAtEnd = addHours(minCalendarDate, totalNumberOfHours * endX);
      currentDateAtEndRef.current = dateAtEnd;
      currentDateAtEndRefProp && (currentDateAtEndRefProp.current = dateAtEnd);

      // Call the provided callback function to notify about the updated date at the center.
      onChangeCurrentDateAtCenterRef.current?.(dateAtCenter);

      // Calibrate date cursor elements in the timeline container if available.
      if (timelineContainerElementRef.current) {
        caliberateDateCursorElementsRef.current(
          timelineContainerElementRef.current
        );
      }
      updateDateAtCursorRef.current();
    }
  };
  const updateDatesAtTimelinePointsRef = useRef(updateDatesAtTimelinePoints);
  updateDatesAtTimelinePointsRef.current = updateDatesAtTimelinePoints;

  useEffect(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    if (scrollingAncenstorElement) {
      const scrollEventCallback = () => {
        updateDatesAtTimelinePointsRef.current();
      };
      scrollingAncenstorElement.addEventListener('scroll', scrollEventCallback);
      scrollEventCallback();
      return () => {
        return scrollingAncenstorElement!.removeEventListener(
          'scroll',
          scrollEventCallback
        );
      };
    }
  }, [scrollingAncenstorElementRef]);

  useEffect(() => {
    if (isMasterTimeline && timelineContainerElementRef.current) {
      const observer = new ResizeObserver(() => {
        if (
          !newTimelineElementIdsRef.current ||
          newTimelineElementIdsRef.current.length === 0 ||
          hasScrolledToNewTimelineElementsRef.current ||
          (lastNewTimelineElementIdsRef &&
            JSON.stringify(lastNewTimelineElementIdsRef.current) ===
              JSON.stringify(newTimelineElementIdsRef.current))
        ) {
          const hasCustomDatesSelected =
            isCustomDatesSelected &&
            customDateRange?.startDate &&
            customDateRange?.endDate;
          if (!hasCustomDatesSelected) {
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
          } else if (hasCustomDatesSelected && customDateRange.startDate) {
            scrollToDateRef.current(
              createDateWithoutTimezoneOffset(customDateRange.startDate),
              {
                dateAlignment: 'start',
                scrollBehaviour: 'auto',
              }
            );
          }
        }
        updateDatesAtTimelinePointsRef.current();
      });
      observer.observe(timelineContainerElementRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [
    centerOfGravity,
    customDateRange?.endDate,
    customDateRange?.startDate,
    defaultTimelineCenter,
    isCustomDatesSelected,
    isMasterTimeline,
    lastNewTimelineElementIdsRef,
  ]);

  //#region Scroll to new timeline elements
  useEffect(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    if (
      rows &&
      scrollingAncenstorElement &&
      newTimelineElementIdsRef.current &&
      newTimelineElementIdsRef.current.length > 0 &&
      !hasScrolledToNewTimelineElementsRef.current &&
      (!lastNewTimelineElementIdsRef ||
        JSON.stringify(lastNewTimelineElementIdsRef.current) !==
          JSON.stringify(newTimelineElementIdsRef.current))
    ) {
      lastNewTimelineElementIdsRef &&
        (lastNewTimelineElementIdsRef.current =
          newTimelineElementIdsRef.current);
      const newTimelineElementNodes =
        scrollingAncenstorElement.querySelectorAll(
          `.${timelineRowDataContainerClasses.newTimelineElement}`
        );
      if (newTimelineElementNodes.length > 0) {
        const anchorElement = document.createElement('div');
        setTimeout(() => {
          anchorElement.style.position = 'absolute';
          anchorElement.style.top = '0';
          anchorElement.style.left = `-${timelineViewPortLeftOffset}px`;
          anchorElement.style.width = `${timelineViewPortLeftOffset}px`;
          anchorElement.style.height = '1px';
          newTimelineElementNodes[0].prepend(anchorElement);
          scrollIntoView(anchorElement, {
            scrollMode: 'always',
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
          setTimeout(() => {
            newTimelineElementNodes.forEach((field) => {
              field.classList.add(classes.flicker);
              setTimeout(() => field.classList.remove(classes.flicker), 1000);
            });
            hasScrolledToNewTimelineElementsRef.current = true;
            anchorElement.remove();
          }, 800);
        }, 500);
      }
    }
  }, [
    classes.flicker,
    lastNewTimelineElementIdsRef,
    rows,
    scrollingAncenstorElementRef,
    timelineViewPortLeftOffset,
  ]);
  //#endregion

  //#region Track date at cursor
  useEffect(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    if (scrollingAncenstorElement) {
      const mouseMoveEventCallback = (event: MouseEvent) => {
        lastMouseEventRef.current = event;
        updateDateAtCursorRef.current();
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
  }, [scrollingAncenstorElementRef]);
  //#endregion

  //#region TimeScale Tool
  const onSelectTimeScale: SelectTimeScaleCallbackFunction = useCallback(
    (timeScale) => {
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

  selectTimeScaleFunctionRef &&
    (selectTimeScaleFunctionRef.current = onSelectTimeScale);

  const onSelectCustomDatesTimeScale: SelectCustomDatesTimeScaleCallbackFunction =
    useCallback(
      (isCustomDatesTimeScaleSelected, selectedCustomDates) => {
        if (isCustomDatesTimeScaleSelected) {
          setSearchParams(
            {
              isCustomDatesSelected: true,
              customDateRange: ((): any => {
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
              customDateRange: null,
            },
            {
              replace: true,
            }
          );
        }
      },
      [setSearchParams]
    );

  selectCustomDatesTimeScaleFunctionRef &&
    (selectCustomDatesTimeScaleFunctionRef.current =
      onSelectCustomDatesTimeScale);

  const { element: timeScaleToolElement } = useTimeScaleTool({
    ...TimeScaleToolProps,
    selectedTimeScale,
    supportedTimeScales,
    onSelectTimeScale,
    onSelectCustomDatesTimeScale,
    isCustomDatesTimeScaleSelected: isCustomDatesSelected,
    selectedCustomDates: (() => {
      if (
        !customDateRange &&
        currentDateAtStartRef.current &&
        currentDateAtEndRef.current
      ) {
        return {
          startDate: formatDate(currentDateAtStartRef.current, 'yyyy-MM-dd'),
          endDate: formatDate(currentDateAtEndRef.current, 'yyyy-MM-dd'),
        };
      }
      return customDateRange;
    })(),
    startDateRef: currentDateAtStartRef,
    endDateRef: currentDateAtEndRef,
    minDate: minCalendarDate,
    maxDate: maxCalendarDate,
  });
  //#endregion

  //#region Scroll Timeline Tools
  const jumpToOptimalTimeScale = useCallback(() => {
    if (isCustomDatesSelected) {
      if (customDateRange?.startDate) {
        scrollToDateRef.current(
          createDateWithoutTimezoneOffset(customDateRange.startDate),
          {
            dateAlignment: 'start',
          }
        );
      }
      return;
    }
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
      scrollToDateRef.current(centerOfGravity);
    }
  }, [
    centerOfGravity,
    customDateRange?.startDate,
    isCustomDatesSelected,
    optimalTimeScale,
    selectedTimeScale,
    setSearchParams,
  ]);

  jumpToOptimalTimeScaleFunctionRef &&
    (jumpToOptimalTimeScaleFunctionRef.current = jumpToOptimalTimeScale);

  const jumpToPreviousUnitTimeScale = useCallback(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    scrollingAncenstorElement?.scrollBy({
      left: -scaledUnitTimeScaleWidth,
      behavior: 'smooth',
    });
  }, [scaledUnitTimeScaleWidth, scrollingAncenstorElementRef]);

  jumpToPreviousUnitTimeScaleFunctionRef &&
    (jumpToPreviousUnitTimeScaleFunctionRef.current =
      jumpToPreviousUnitTimeScale);

  const jumpToNextUnitTimeScale = useCallback(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    scrollingAncenstorElement?.scrollBy({
      left: scaledUnitTimeScaleWidth,
      behavior: 'smooth',
    });
  }, [scaledUnitTimeScaleWidth, scrollingAncenstorElementRef]);

  jumpToNextUnitTimeScaleFunctionRef &&
    (jumpToNextUnitTimeScaleFunctionRef.current = jumpToNextUnitTimeScale);

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

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const dateAtCursorBgcolor = lighten(palette.grey[900], 0.75);
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
            scrollingAncenstorElementRef={scrollingAncenstorElementRef}
            leftOffset={timelineViewPortLeftOffset}
            variant={TimeScaleMeterPropsVariant}
            sx={{
              ...TimeScaleMeterPropsSx,
              [`.${timeScaleMeterClasses.timeScaleLevel1Tick}`]: {
                left: timelineViewPortLeftOffset,
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
            return (
              <Box
                className={clsx(classes.dateAtCursorMarker)}
                {...DateAtCursorMarkerPropsRest}
                sx={{
                  width: '1px',
                  bgcolor: dateAtCursorBgcolor,
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
                    bgcolor: dateAtCursorBgcolor,
                    color: palette.background.paper,
                    fontSize: 12,
                    top: 0,
                    ...DateAtCursorMarkerLabelPropsSx,
                    position: 'absolute',
                  }}
                ></Typography>
              </Box>
            );
          })()}
        </Box>
      ),
      secondaryHeaderRowContent: (() => {
        return (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
            }}
          >
            {(() => {
              const startDate = (() => {
                if (customDateRange?.startDate) {
                  return customDateRange.startDate;
                }
                if (currentDateAtStartRef.current) {
                  return formatDate(
                    currentDateAtStartRef.current,
                    'yyyy-MM-dd'
                  );
                }
              })();
              const endDate = (() => {
                if (customDateRange?.endDate) {
                  return customDateRange.endDate;
                }
                if (currentDateAtEndRef.current) {
                  return formatDate(currentDateAtEndRef.current, 'yyyy-MM-dd');
                }
              })();
              if (
                blockCustomDateRangeRegion &&
                isCustomDatesSelected &&
                startDate &&
                endDate
              ) {
                const bgcolor = alpha(palette.grey[900], 0.75);
                const borderColor = '#fff';
                const blockerStyles: BoxProps['sx'] = {
                  position: 'absolute',
                  top: 0,
                  bgcolor,
                  zIndex: 3,
                  boxSizing: 'border-box',
                };
                return (
                  <>
                    <Box
                      className={clsx(classes.customDateRangeBlocker)}
                      sx={{
                        ...blockerStyles,
                        left: 0,
                        width: `${
                          getPercentageAtDate(
                            createDateWithoutTimezoneOffset(startDate)
                          ) * 100
                        }%`,
                        borderRight: `2px solid ${borderColor}`,
                        boxShadow: `1px 0px 4px 0px ${alpha(
                          BLACK_COLOR,
                          0.25
                        )}`,
                      }}
                    />
                    <Box
                      className={clsx(classes.customDateRangeBlocker)}
                      sx={{
                        ...blockerStyles,
                        right: 0,
                        left: `${
                          getPercentageAtDate(
                            createDateWithoutTimezoneOffset(endDate)
                          ) * 100
                        }%`,
                        borderLeft: `2px solid ${borderColor}`,
                        boxShadow: `-1px 0px 4px 0px ${alpha(
                          BLACK_COLOR,
                          0.25
                        )}`,
                      }}
                    />
                  </>
                );
              }
            })()}
            <Box
              className={clsx(classes.dateAtCursorMarker)}
              {...DateAtCursorMarkerPropsRest}
              sx={{
                width: '1px',
                bgcolor: dateAtCursorBgcolor,
                ...DateAtCursorMarkerPropsSx,
                top: 0,
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          </Box>
        );
      })(),
      getColumnValue: (row) => {
        const timelineElements = (() => {
          if (row.isTimelineStaticRow) {
            return row.timelineElements as TimelineElementType[];
          }
          if (getTimelineElements) {
            return getTimelineElements(row);
          }
          if (startDateProperty && endDateProperty) {
            return [
              {
                id: row.id,
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
              },
            ] as TimelineElementType[];
          }
        })();

        if (timelineElements && timelineElements.length > 0) {
          return (
            <TimelineRowDataContainer
              {...TimelineRowDataContainerPropsRest}
              {...{
                minCalendarDate,
                maxCalendarDate,
                totalNumberOfHours,
                scaledTimeScaleWidth,
                scrollingAncenstorElementRef,
                newTimelineElementIds,
                timelineViewPortContainerWidth,
                currentDateAtEndPositionLeftOffsetRef,
                currentDateAtStartPositionLeftOffsetRef,
                scrollToDate,
              }}
              timelineElements={timelineElements.map(
                (timelineElement, index) => {
                  return {
                    ...timelineElement,
                    id: timelineElement.id || String(row.id + index),
                  };
                }
              )}
            />
          );
        }

        if (row.isTimelineStaticRow && !showPlaceholderWhenStaticRowIsEmpty) {
          return null;
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
      width: scaledTimeScaleWidth,
      wrapColumnContentInFieldValue: false,
      headerClassName: classes.timelineMeterContainer,
      headerSx: {
        cursor: 'move',
        '&>div': {
          py: 0,
          pl: 0,
          pr: 0,
        },
      },
      bodySx: {
        pl: 0,
        pr: 0,
        py: 0.5,
        '&>div': {
          minHeight: 42,
        },
        [`&.${tableBodyColumnClasses.groupHeaderColumn}`]: {
          zIndex: 1,
        },
      },
    },
  ];

  if (shouldShowRowLabelsColumn) {
    columns.unshift({
      ...RowLabelColumnProps,
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
      className: clsx(classes.rowLabelColumn, RowLabelColumnProps?.className),
      headerSx: {
        ...(() => {
          if (todayMarkerVariant === 'foregroundFullSpan') {
            return {
              zIndex: 4,
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
                pl: 0,
                pr: 0,
              },
            };
          }
        })(),
      },
      secondaryHeaderSx: {
        ...RowLabelColumnProps?.secondaryHeaderSx,
        borderRight: 'none !important',
        '&>div': {
          py: 0,
          pl: 0,
          pr: 0,
        },
      },
      bodySx: {
        pt: '14px',
        ...RowLabelColumnProps?.bodySx,
        zIndex: 3,
        [`&.${tableBodyColumnClasses.groupHeaderColumn}`]: {
          zIndex: 4,
        },
        ...(() => {
          if (todayMarkerVariant === 'foregroundFullSpan') {
            return {
              zIndex: 4,
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
              pr: 0,
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
        ref={mergeRefs([ref, timelineContainerElementRef])}
        className={clsx(className, classes.root)}
        {...rest}
        controlZIndex={false}
        parentBackgroundColor={parentBackgroundColor}
        {...{ columns, rows }}
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
            verticalAlign: 'bottom',
            th: {
              zIndex: 4,
            },
          },
        }}
        SecondaryHeaderRowProps={{
          sx: {
            position: 'relative',
            th: {
              borderBottom: 'none',
            },
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
          [`.${classes.dateAtCursorMarker}`]: {
            display: 'none',
          },
          [`&:hover .${classes.dateAtCursorMarker}`]: {
            display: 'block',
          },
          [`.${classes.flicker}`]: {
            animation: `0.1s linear 0s infinite normal none running ${flickerAnimation}`,
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
