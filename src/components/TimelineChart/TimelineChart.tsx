import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  Stack,
  Tooltip,
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
import { result } from 'lodash';
import {
  ReactElement,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import RenderIfVisible from '../RenderIfVisible';
import { BaseDataRow, Table } from '../Table';
import { BaseTimelineChartProps } from './models';
import TimelineChartBodyDataRow from './TimelineChartBodyDataRow';
import TimelineChartDataLabelRow, {
  TimelineChartDataLabelRowProps,
} from './TimelineChartDataLabelRow';
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

export interface TimelineChartProps<RecordRow extends BaseDataRow = any>
  extends BaseTimelineChartProps<RecordRow>,
    Pick<
      TimelineChartDataLabelRowProps<RecordRow>,
      'rowLabelProperty' | 'getRowLabel'
    >,
    Partial<Pick<GridProps, 'className' | 'sx'>> {
  rows: RecordRow[];
  expandedRows?: string[];
  allRowsExpanded?: boolean;
  onChangeExpanded?: (expandedRows: string[]) => void;
  startDateProperty: keyof RecordRow;
  endDateProperty: keyof RecordRow;
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
    legacy = false,
    startDateProperty,
    endDateProperty,
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

  return (
    <Table
      columns={[
        {
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
        },
        {
          id: 'timeline',
          label: (
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
                        width: timelineMonthMinWidth * 12,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
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
                  );
                })}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                }}
              >
                {timelineYears.map(() => {
                  return fullMonthLabels.map((month) => {
                    return (
                      <Box
                        key={month}
                        sx={{
                          width: timelineMonthMinWidth,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: 0,
                          px: 2,
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {month}
                        </Typography>
                      </Box>
                    );
                  });
                })}
              </Box>
            </Stack>
          ),
          getColumnValue: (row) => {
            const startDateValue = result(row, startDateProperty);

            if (startDateValue) {
              const startDate = new Date(startDateValue as any);
              if (!isNaN(startDate.getTime())) {
                const endDate = (() => {
                  const endDateValue = result(row, endDateProperty);
                  if (endDateValue) {
                    const endDate = new Date(endDateValue as any);
                    if (!isNaN(endDate.getTime())) {
                      return endDate;
                    }
                  }
                  return maxDate;
                })();
                const numberOfDays = differenceInDays(endDate, startDate);
                const offsetPercentage =
                  differenceInDays(startDate, minDate) / totalNumberOfDays;
                const percentage = numberOfDays / totalNumberOfDays;

                return (
                  <Box
                    sx={{
                      width: `${percentage * 100}%`,
                      ml: `${offsetPercentage * 100}%`,
                      height: 34,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      border: `1px solid ${palette.divider}`,
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {result(row, startDateProperty)} -{' '}
                      {result(row, endDateProperty)}
                    </Typography>
                  </Box>
                );
              }
            }
          },
          width: timelineMonthMinWidth * timelineYears.length * 12,
          wrapColumnContentInFieldValue: false,
          headerSx: {
            '&>div': {
              p: 0,
            },
          },
          bodySx: {
            px: 0,
          },
        },
        {
          id: 'gutter',
          label: 'Gutter',
          width: 40,
          showHeaderText: false,
        },
      ]}
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
  );
};

export const TimelineChart = forwardRef(BaseTimelineChart) as <
  RecordRow extends BaseDataRow
>(
  p: TimelineChartProps<RecordRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default TimelineChart;
