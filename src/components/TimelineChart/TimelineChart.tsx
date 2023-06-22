import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  BoxProps,
  Button,
  ButtonGroup,
  CircularProgress,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  Stack,
  Tooltip,
  TooltipProps,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import differenceInDays from 'date-fns/differenceInDays';
import formatDate from 'date-fns/format';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import { result } from 'lodash';
import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  Suspense,
  forwardRef,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import DataDropdownField from '../InputFields/DataDropdownField';
import DateInputField from '../InputFields/DateInputField';
import RenderIfVisible from '../RenderIfVisible';
import { BaseDataRow, Table, TableColumn } from '../Table';
import { BaseTimelineChartProps } from './models';
import TimelineChartBodyDataRow from './TimelineChartBodyDataRow';
import TimelineChartDataLabelRow from './TimelineChartDataLabelRow';
import TimelineChartHeader from './TimelineChartHeader';
import TimelineChartNavigationControls from './TimelineChartNavigationControls';

export interface TimelineChartClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineChartClassKey = keyof TimelineChartClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineChart: TimelineChartProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineChart: keyof TimelineChartClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineChart?: {
      defaultProps?: ComponentsProps['MuiTimelineChart'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineChart'];
      variants?: ComponentsVariants['MuiTimelineChart'];
    };
  }
}

const timelineMonthMinWidth = 120;

const fullMonthLabels = [
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

export interface TimelineElement extends Partial<BoxProps> {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  label?: ReactNode;
  TooltipProps?: Partial<TooltipProps>;
}

export interface TimelineChartProps<RecordRow extends BaseDataRow = any>
  extends BaseTimelineChartProps<RecordRow>,
    Partial<Pick<GridProps, 'className' | 'sx'>> {
  rowLabelProperty?: keyof RecordRow;
  getRowLabel?: (row: RecordRow) => ReactNode;
  rows: RecordRow[];
  expandedRows?: string[];
  allRowsExpanded?: boolean;
  onChangeExpanded?: (expandedRows: string[]) => void;
  timelineElementLabelProperty: keyof RecordRow;
  getTimelineElementLabel?: (timelineElement: RecordRow) => ReactNode;
  getTimelineElementTooltipProps?: (
    timelineElement: RecordRow
  ) => Partial<TooltipProps>;
  getTimelineElementProps?: (timelineElement: RecordRow) => BoxProps;
  startDateProperty: keyof RecordRow;
  endDateProperty: keyof RecordRow;
  showRowLabelsColumn?: boolean;
  getTimelineElements?: (row: RecordRow) => Promise<TimelineElement[]>;
  legacy?: boolean;
}

export function getTimelineChartUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineChart', slot);
}

export const timelineChartClasses: TimelineChartClasses =
  generateUtilityClasses('MuiTimelineChart', ['root']);

const slots = {
  root: ['root'],
};

export const BaseTimelineChart = <RecordRow extends BaseDataRow>(
  inProps: TimelineChartProps<RecordRow>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTimelineChart' });
  const {
    className,
    rows,
    rowLabelProperty,
    getRowLabel,
    expandedRows: expandedRowsProp = [],
    allRowsExpanded: allRowsExpandedProp = false,
    onChangeExpanded: onChangeExpandedProp,
    onSelectTimeline,
    getTimelines,
    startDateProperty,
    endDateProperty,
    timelineElementLabelProperty,
    getTimelineElementLabel,
    getTimelineElementTooltipProps,
    getTimelineElementProps,
    getTimelineElements,
    showRowLabelsColumn = true,
    legacy = false,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTimelineChartUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const tableElementRef = useRef<HTMLTableElement>(null);
  const todayIndicatorRef = useRef<HTMLDivElement>(null);

  const { minDate, maxDate, timelineYears, totalNumberOfDays } = useMemo(() => {
    const allDates = rows
      .flatMap((row) => {
        const dates: Date[] = [];
        const startDateValue = result(row, startDateProperty);
        if (startDateValue) {
          if (startDateValue instanceof Date) {
            dates.push(startDateValue);
          } else {
            const parsedStartDateValue = new Date(startDateValue as any);
            if (!isNaN(parsedStartDateValue.getTime())) {
              dates.push(parsedStartDateValue);
            }
          }
        }
        const endDateValue = result(row, endDateProperty);
        if (endDateValue) {
          if (endDateValue instanceof Date) {
            dates.push(endDateValue);
          } else {
            const parsedEndDateValue = new Date(endDateValue as any);
            if (!isNaN(parsedEndDateValue.getTime())) {
              dates.push(parsedEndDateValue);
            }
          }
        }
        return dates;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    const { maxDate, minDate } = (() => {
      if (allDates.length > 0) {
        const minDate = new Date(allDates[0].getFullYear(), 0, 1);
        const maxDate = new Date(
          allDates[allDates.length - 1].getFullYear(),
          11,
          31
        );
        return { minDate, maxDate };
      }
      const thisYear = new Date().getFullYear();
      return {
        minDate: new Date(thisYear, 0, 1),
        maxDate: new Date(thisYear, 11, 31),
      };
    })();

    const minDateYear = minDate.getFullYear();
    const maxDateYear = maxDate.getFullYear();
    const timelineYears: number[] = [];

    for (let year = minDateYear; year <= maxDateYear; year++) {
      timelineYears.push(year);
    }
    const totalNumberOfDays = differenceInDays(maxDate, minDate);

    return {
      minDate,
      maxDate,
      timelineYears,
      totalNumberOfDays,
    };
  }, [endDateProperty, rows, startDateProperty]);

  //#region Legacy
  const onChangeExpandedRef = useRef(onChangeExpandedProp);
  onChangeExpandedRef.current = onChangeExpandedProp;
  const getTimelinesRef = useRef(getTimelines);
  getTimelinesRef.current = getTimelines;

  const { palette } = useTheme();
  const thisYear = useMemo(() => {
    return new Date().getFullYear();
  }, []);
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [timelineWrapperElement, setTimelineWrapperElement] =
    useState<HTMLDivElement | null>(null);
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [timelineElement, setTimelineElement] = useState<HTMLDivElement | null>(
    null
  );
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [allRowsExpanded, setAllRowsExpanded] = useState(allRowsExpandedProp);

  useEffect(() => {
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.join(';') !== expandedRowsProp.join(';')) {
        return expandedRowsProp;
      }
      return prevExpandedRows;
    });
  }, [expandedRowsProp]);

  useEffect(() => {
    setAllRowsExpanded(allRowsExpandedProp);
  }, [allRowsExpandedProp]);

  const onChangeExpanded = useCallback((id: string) => {
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(id)) {
        prevExpandedRows.splice(prevExpandedRows.indexOf(id), 1);
      } else {
        prevExpandedRows.push(id);
      }
      return [...prevExpandedRows];
    });
  }, []);

  useEffect(() => {
    onChangeExpandedRef.current && onChangeExpandedRef.current(expandedRows);
  }, [expandedRows]);

  const { searchParams, setSearchParams } = useReactRouterDOMSearchParams();
  const searchParamSelectedYear = searchParams.get('timeline:year') as
    | string
    | null;

  // Today's cursor
  const { todaysDatePercentage } = useMemo(() => {
    const todaysDatePercentage = (() => {
      if (selectedYear === thisYear) {
        const date = new Date();
        return (
          (date.getMonth() * (1 / 12) +
            ((date.getDate() - 1) / (getDaysInMonth(date) - 1)) * (1 / 12)) *
          100
        );
      }
    })();
    return { todaysDatePercentage };
  }, [selectedYear, thisYear]);

  useEffect(() => {
    if (timelineWrapperElement && timelineElement) {
      let scaleFactor = 1;
      const mouseWheelEventCallback = (event: any) => {
        if (event.ctrlKey) {
          event.preventDefault();
          const { offsetWidth: wrapperElementWidth } = timelineWrapperElement;
          const { wheelDelta } = event;
          let width = timelineElement.offsetWidth + wheelDelta;
          width > wrapperElementWidth || (width = wrapperElementWidth);

          timelineElement.style.width = `${width}px`;
          scaleFactor = width / wrapperElementWidth;
        }
      };
      const windowResizeEventCallback = () => {
        const { offsetWidth: wrapperElementWidth } = timelineWrapperElement;
        timelineElement.style.width = `${wrapperElementWidth * scaleFactor}px`;
      };

      timelineWrapperElement.addEventListener(
        'mousewheel',
        mouseWheelEventCallback
      );
      window.addEventListener('resize', windowResizeEventCallback);
      return () => {
        timelineWrapperElement.removeEventListener(
          'mousewheel',
          mouseWheelEventCallback
        );
        window.removeEventListener('resize', windowResizeEventCallback);
      };
    }
  }, [timelineElement, timelineWrapperElement]);

  useEffect(() => {
    if (timelineWrapperElement && timelineElement) {
      let timelineElementWidthDiff = 0;
      let initialTranslateX = 0;
      let initialX = 0;
      const mousemoveEventCallback = (event: MouseEvent) => {
        const dX = event.clientX - initialX;
        const translateX = dX - initialTranslateX;
        if (translateX >= timelineElementWidthDiff && translateX <= 0) {
          timelineElement.style.transform = `translateX(${translateX}px)`;
        }
        return false;
      };
      const mousedownEventCallback = (event: MouseEvent) => {
        if (event.button === 0) {
          timelineElementWidthDiff =
            timelineWrapperElement.offsetWidth - timelineElement.offsetWidth;
          initialTranslateX = (() => {
            const currentTranslateX = timelineElement.style.transform
              ? parseFloat(
                  /^translateX\((.+)\)/g.exec(
                    timelineElement.style.transform
                  )?.[1] || ''
                )
              : 0;
            return !isNaN(currentTranslateX) ? currentTranslateX : 0;
          })();
          initialX = event.clientX;
          document.body.style.cursor = 'move';
          timelineElement.style.transformOrigin = `${
            event.offsetX + initialTranslateX
          }px 0`;
          timelineElement.style.pointerEvents = 'none';
          window.addEventListener('mousemove', mousemoveEventCallback);
        }
      };
      const mouseupEventCallback = () => {
        document.body.style.cursor = '';
        timelineElement.style.pointerEvents = '';
        window.removeEventListener('mousemove', mousemoveEventCallback);
      };
      timelineWrapperElement.addEventListener(
        'mousedown',
        mousedownEventCallback
      );
      window.addEventListener('mouseup', mouseupEventCallback);
      return () => {
        document.body.style.cursor = '';
        timelineElement.style.pointerEvents = '';
        timelineWrapperElement.removeEventListener(
          'mousedown',
          mousedownEventCallback
        );
        window.removeEventListener('mousemove', mousemoveEventCallback);
      };
    }
  }, [timelineElement, timelineWrapperElement]);

  useEffect(() => {
    if (rootElement) {
      const mouseOverEventCallback = (event: MouseEvent) => {
        const elementAtMousePosition = document.elementFromPoint(
          event.clientX,
          event.clientY
        );
        const closestDataRow = elementAtMousePosition?.closest(
          '.team-assignments-timeline-data-row'
        );
        if (closestDataRow) {
          if (!closestDataRow.classList.contains('hover')) {
            const closestDataRowIndex = [
              ...(closestDataRow.parentElement?.querySelectorAll(
                '.team-assignments-timeline-data-row'
              ) || []),
            ].indexOf(closestDataRow);

            rootElement
              .querySelectorAll('.team-assignments-timeline-data-row')
              .forEach((element) => element.classList.remove('hover'));

            rootElement
              .querySelectorAll('.team-assignments-timeline-data-row-container')
              .forEach((containerElement) => {
                containerElement
                  .querySelectorAll('.team-assignments-timeline-data-row')
                  [closestDataRowIndex]?.classList.add('hover');
              });
          }
        } else {
          rootElement
            .querySelectorAll('.team-assignments-timeline-data-row.hover')
            .forEach((element) => element.classList.remove('hover'));
        }
      };
      const mouseLeaveEventCallback = () => {
        rootElement
          .querySelectorAll('.team-assignments-timeline-data-row.hover')
          .forEach((element) => element.classList.remove('hover'));
      };
      rootElement.addEventListener('mouseover', mouseOverEventCallback);
      rootElement.addEventListener('mouseleave', mouseLeaveEventCallback);
      return () => {
        rootElement.removeEventListener('mouseover', mouseOverEventCallback);
        rootElement.addEventListener('mouseleave', mouseLeaveEventCallback);
      };
    }
  }, [rootElement]);

  useEffect(() => {
    if (searchParamSelectedYear && searchParamSelectedYear.match(/^\d+$/g)) {
      const selectedYear = parseInt(searchParamSelectedYear);
      setSelectedYear(selectedYear);
    } else {
      setSearchParams(
        {
          'timeline:year': String(thisYear),
        },
        {
          replace: true,
        }
      );
    }
  }, [searchParamSelectedYear, setSearchParams, thisYear]);

  if (legacy) {
    return (
      <Grid
        {...rest}
        className={clsx(classes.root)}
        ref={mergeRefs([
          (rootElement: HTMLDivElement | null) => {
            setRootElement(rootElement);
          },
          ref,
        ])}
        container
      >
        {/* Row labels column */}
        <Grid
          item
          className="team-assignments-timeline-data-row-container"
          sx={{
            width: 256,
            zIndex: 2,
            bgcolor: palette.background.paper,
          }}
        >
          <Box
            sx={{
              height: 80,
              borderRight: `1px solid ${palette.divider}`,
              borderBottom: `1px solid ${palette.divider}`,
            }}
          />
          {rows.map((row) => {
            return (
              <RenderIfVisible
                key={row.id}
                displayPlaceholder={false}
                unWrapChildrenIfVisible
                sx={{
                  height: 50,
                }}
              >
                <TimelineChartDataLabelRow
                  {...{
                    onChangeExpanded,
                    row,
                    getTimelines,
                    rowLabelProperty,
                    getRowLabel,
                  }}
                  expanded={allRowsExpanded || expandedRows.includes(row.id)}
                />
              </RenderIfVisible>
            );
          })}
        </Grid>

        {/* Row Timelines column */}
        <Grid
          ref={(timelineWrapperElement: HTMLDivElement | null) => {
            setTimelineWrapperElement(timelineWrapperElement);
          }}
          item
          xs
          sx={{
            minWidth: 0,
            position: 'relative',
          }}
        >
          <TimelineChartNavigationControls {...{ selectedYear }} />
          <Box
            ref={(timelineElement: HTMLDivElement | null) => {
              setTimelineElement(timelineElement);
            }}
            sx={{ minWidth: 800 }}
          >
            <TimelineChartHeader {...{ selectedYear }} />
            <Box
              component="section"
              className="team-assignments-timeline-data-row-container"
              sx={{
                position: 'relative',
                mb: 3,
                '&>div:last-of-type .team-assignments-timeline-column': {
                  borderBottom: `1px solid ${palette.divider}`,
                },
              }}
            >
              {todaysDatePercentage ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `calc(${todaysDatePercentage}% - 1px)`,
                    border: `1px solid ${palette.primary.main}`,
                  }}
                >
                  <Tooltip title={formatDate(new Date(), 'MMM dd, yyyy')}>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: `calc(100% + 2px)`,
                        left: '-20px',
                        fontSize: 12,
                      }}
                    >
                      Today
                    </Typography>
                  </Tooltip>
                </Box>
              ) : null}
              {rows.map((row) => {
                return (
                  <RenderIfVisible
                    key={row.id}
                    displayPlaceholder={false}
                    unWrapChildrenIfVisible
                    sx={{
                      height: 50,
                    }}
                  >
                    <TimelineChartBodyDataRow
                      {...{
                        row,
                        onSelectTimeline,
                        onChangeExpanded,
                        selectedYear,
                        getTimelines,
                      }}
                      expanded={
                        allRowsExpanded || expandedRows.includes(row.id)
                      }
                    />
                  </RenderIfVisible>
                );
              })}
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }
  //#endregion

  const getTimelineElementNode = ({
    startDate: startDateValue,
    endDate: endDateValue,
    label,
    TooltipProps = {},
    sx,
    ...rest
  }: TimelineElement) => {
    if (startDateValue) {
      const startDate = new Date(startDateValue as any);
      if (!isNaN(startDate.getTime())) {
        const endDate = (() => {
          if (endDateValue) {
            const endDate = new Date(endDateValue as any);
            if (!isNaN(endDate.getTime())) {
              return endDate;
            }
          }
          return maxDate;
        })();
        if (isAfter(endDate, startDate)) {
          const numberOfDays = differenceInDays(endDate, startDate);
          const offsetPercentage =
            differenceInDays(startDate, minDate) / totalNumberOfDays;
          const percentage = numberOfDays / totalNumberOfDays;

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
              followCursor
              {...TooltipPropsRest}
              PopperProps={{
                ...TooltipPropsPopperProps,
                sx: {
                  pointerEvents: 'none',
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
                  border: `1px solid ${palette.divider}`,
                  ...sx,
                  width: `${percentage * 100}%`,
                  position: 'absolute',
                  top: 0,
                  left: `${offsetPercentage * 100}%`,
                  height: 34,
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body2" noWrap>
                  {timelineElementLabel}
                </Typography>
              </Box>
            </Tooltip>
          );
        }
      }
    }
  };

  const columns: TableColumn<RecordRow>[] = [
    {
      id: 'timeline',
      label: (
        <>
          <Stack
            sx={{
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
              }}
            >
              {timelineYears.map((year) => {
                return (
                  <Box
                    key={year}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'sticky',
                        overflow: 'hidden',
                        left: showRowLabelsColumn ? 256 : 0,
                        px: (() => {
                          if (showRowLabelsColumn) {
                            return 2;
                          }
                          return 3;
                        })(),
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 'bold',
                        }}
                      >
                        {year}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box
              sx={{
                display: 'flex',
              }}
            >
              {timelineYears.map((year) => {
                return (
                  <Box
                    key={year}
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {fullMonthLabels.map((month) => {
                      return (
                        <Box
                          key={month}
                          sx={{
                            flex: 1,
                            overflow: 'hidden',
                            minWidth: 0,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            px: (() => {
                              if (showRowLabelsColumn) {
                                return 2;
                              }
                              return 3;
                            })(),
                          }}
                        >
                          <Typography variant="body2" noWrap>
                            {month}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Stack>
          {(() => {
            const today = new Date();
            if (isAfter(today, minDate) && isBefore(today, maxDate)) {
              const offsetPercentage =
                differenceInDays(today, minDate) / totalNumberOfDays;
              return (
                <Box
                  ref={mergeRefs([
                    todayIndicatorRef,
                    (element: HTMLDivElement) => {
                      if (element) {
                        scrollIntoView(element, {
                          scrollMode: 'if-needed',
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'center',
                        });
                      }
                    },
                  ])}
                  sx={{
                    position: 'absolute',
                    width: 2,
                    bgcolor: palette.primary.main,
                    height: rows.length * 51,
                    top: '100%',
                    left: `${offsetPercentage * 100}%`,
                  }}
                />
              );
            }
          })()}
        </>
      ),
      getColumnValue: (row) => {
        if (getTimelineElements) {
          const TimelineElements = lazy(async () => {
            const timelineElements = await getTimelineElements(row);
            return {
              default: () => {
                return (
                  <>
                    {timelineElements.map((timelineElement, index) => {
                      return (
                        <Fragment key={index}>
                          {getTimelineElementNode(timelineElement)}
                        </Fragment>
                      );
                    })}
                  </>
                );
              },
            };
          });

          return (
            <Suspense fallback={<CircularProgress size={24} color="inherit" />}>
              <TimelineElements />
            </Suspense>
          );
        }
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
      },
      width: timelineMonthMinWidth * timelineYears.length * 12,
      wrapColumnContentInFieldValue: false,
      headerSx: {
        pt: '50px',
        '&>div': {
          p: 0,
        },
      },
      bodySx: {
        pl: 0,
        pr: 0,
        py: 1,
        borderColor: 'transparent',
        '&>div': {
          height: 34,
        },
      },
    },
  ];

  if (showRowLabelsColumn) {
    columns.unshift({
      id: 'label',
      label: 'Label',
      width: 256,
      showHeaderText: false,
      getColumnValue: (row) => {
        if (getRowLabel) {
          return getRowLabel(row);
        }
        if (rowLabelProperty) {
          return result(row, rowLabelProperty);
        }
      },
      bodySx: {
        zIndex: 2,
      },
    });
    columns.push({
      id: 'gutter',
      label: 'Gutter',
      width: 20,
      showHeaderText: false,
      bodySx: {
        p: 0,
        borderColor: 'transparent',
      },
      sx: {
        '&:last-of-type': {
          borderLeftColor: 'transparent !important',
        },
      },
    });
  }

  return (
    <>
      <Box
        sx={{
          height: 0,
          zIndex: 5,
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        <Grid
          container
          spacing={1}
          sx={{
            px: 3,
            py: 1,
            alignItems: 'center',
            position: 'sticky',
            right: 0,
            display: 'inline-flex',
            justifyContent: 'end',
          }}
        >
          <Grid item xs />
          <Grid item>
            <DateInputField
              placeholder="From"
              size="small"
              minDate={minDate.toISOString()}
              sx={{
                width: 150,
              }}
            />
          </Grid>
          <Grid item>
            <DateInputField
              placeholder="To"
              size="small"
              maxDate={maxDate.toISOString()}
              sx={{
                width: 150,
              }}
            />
          </Grid>
          <Grid item>
            <DataDropdownField
              placeholder="Timescale"
              size="small"
              options={timeScaleOptions.map((timeScaleOption) => {
                return {
                  value: timeScaleOption,
                  label: timeScaleOption,
                };
              })}
              showClearButton={false}
              sx={{
                width: 120,
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => {
                if (todayIndicatorRef.current) {
                  scrollIntoView(todayIndicatorRef.current, {
                    scrollMode: 'if-needed',
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                  });
                }
              }}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <ButtonGroup size="small" color="inherit">
              <Button
                onClick={() => {
                  tableElementRef.current?.parentElement?.scrollBy({
                    left: -(timelineMonthMinWidth * 12),
                    behavior: 'smooth',
                  });
                }}
              >
                <NavigateBeforeIcon />
              </Button>
              <Button
                onClick={() => {
                  tableElementRef.current?.parentElement?.scrollBy({
                    left: timelineMonthMinWidth * 12,
                    behavior: 'smooth',
                  });
                }}
              >
                <NavigateNextIcon />
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>
      <Table
        ref={tableElementRef}
        columns={columns}
        paging={false}
        bordersVariant="square"
        rows={rows}
        startStickyColumnIndex={0}
        stickyHeader
        sx={{
          tr: {
            verticalAlign: 'middle',
          },
        }}
      />
    </>
  );
};

export const TimelineChart = forwardRef(BaseTimelineChart) as <
  RecordRow extends BaseDataRow
>(
  p: TimelineChartProps<RecordRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default TimelineChart;
