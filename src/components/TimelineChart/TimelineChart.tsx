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
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import scrollIntoView from 'scroll-into-view-if-needed';
import * as Yup from 'yup';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import DataDropdownField from '../InputFields/DataDropdownField';
import { BaseDataRow, Table, TableColumn, TableProps } from '../Table';

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

const baseTimeScaleWidth = 120;
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
const shortMonthLabels = [
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
  extends Partial<Pick<TableProps, 'className' | 'sx'>> {
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
    startDateProperty,
    endDateProperty,
    timelineElementLabelProperty,
    getTimelineElementLabel,
    getTimelineElementTooltipProps,
    getTimelineElementProps,
    getTimelineElements,
    showRowLabelsColumn = true,
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

  const { palette } = useTheme();

  const {
    searchParams: { timeScale: selectedTimeScale = 'Year' },
    setSearchParams,
  } = useReactRouterDOMSearchParams({
    mode: 'json',
    spec: {
      timeScale: Yup.mixed<TimeScaleOption>().oneOf([...timeScaleOptions]),
    },
  });

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

  const scrollToToday = () => {
    if (todayIndicatorRef.current) {
      scrollIntoView(todayIndicatorRef.current, {
        scrollMode: 'if-needed',
        behavior: 'smooth',
        block: 'start',
        inline: 'center',
      });
    }
  };
  const scrollToTodayRef = useRef(scrollToToday);
  scrollToTodayRef.current = scrollToToday;

  useEffect(() => {
    scrollToTodayRef.current();
  }, []);

  const {
    timeScaleRows: [topTimeScaleRow, middleTimeScaleRow, bottomTimeScaleRow],
    unitTimeScaleWidth,
    timeScaleWidth,
  } = ((): {
    timeScaleRows: [
      { id: string; label: string }[],
      { id: string; label: string }[],
      { id: string; label: string }[]
    ];
    unitTimeScaleWidth: number;
    timeScaleWidth: number;
  } => {
    switch (selectedTimeScale) {
      case '5 year':
        return {
          timeScaleRows: [
            timelineYears.flatMap((year) => {
              return {
                id: String(year),
                label: String(year),
              };
            }),
            timelineYears.flatMap((_, index) => {
              return ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                return {
                  id: index + quarter,
                  label: quarter,
                };
              });
            }),
            timelineYears.flatMap((_, index) => {
              return shortMonthLabels.map((label) => {
                return {
                  id: index + label,
                  label,
                };
              });
            }),
          ],
          unitTimeScaleWidth: baseTimeScaleWidth * 12,
          timeScaleWidth:
            ((baseTimeScaleWidth * timelineYears.length) / 4) * 12,
        };
      default:
        return {
          timeScaleRows: [
            timelineYears.flatMap((year) => {
              return ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                const label = `${quarter} ${year}`;
                return {
                  id: label,
                  label,
                };
              });
            }),
            timelineYears.flatMap((_, index) => {
              return fullMonthLabels.map((label) => {
                return {
                  id: index + label,
                  label,
                };
              });
            }),
            timelineYears.flatMap((year) => {
              return shortMonthLabels.flatMap((label, index) => {
                const daysInMonth = getDaysInMonth(new Date(year, index));
                const unitPeriod = Math.floor(daysInMonth / 2);
                return Array.from({ length: 2 }).map((_, periodIndex) => {
                  return {
                    id: year + label,
                    label: String(
                      1 +
                        Math.floor(Math.random() * 5) +
                        unitPeriod * periodIndex
                    ),
                  };
                });
              });
            }),
          ],
          unitTimeScaleWidth: baseTimeScaleWidth * 12,
          timeScaleWidth: baseTimeScaleWidth * timelineYears.length * 12,
        };
    }
  })();

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
                height: 56,
                alignItems: 'center',
              }}
            >
              {topTimeScaleRow.map(({ id, label }) => {
                return (
                  <Box
                    key={id}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'sticky',
                        overflow: 'hidden',
                        left:
                          (showRowLabelsColumn ? 256 : 0) +
                          (() => {
                            if (showRowLabelsColumn) {
                              return 16;
                            }
                            return 24;
                          })(),
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {label}
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
              {middleTimeScaleRow.map(({ id, label }) => {
                return (
                  <Box
                    key={id}
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      minWidth: 0,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {label}
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
              {bottomTimeScaleRow.map(({ id, label }) => {
                return (
                  <Box
                    key={id}
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      minWidth: 0,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontSize: 12,
                      }}
                    >
                      {label}
                    </Typography>
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
                  ref={todayIndicatorRef}
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
      width: timeScaleWidth,
      wrapColumnContentInFieldValue: false,
      headerSx: {
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
          display: 'flex',
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Grid
          container
          sx={{
            px: 3,
            py: 1,
            alignItems: 'center',
            position: 'sticky',
            right: 0,
            display: 'inline-flex',
            gap: 1,
            bgcolor: palette.background.paper,
            height: 56,
            width: 'auto',
          }}
        >
          <Grid item>
            <DataDropdownField
              placeholder="Timescale"
              size="small"
              value={selectedTimeScale}
              options={timeScaleOptions.map((timeScaleOption) => {
                return {
                  value: timeScaleOption,
                  label: timeScaleOption,
                };
              })}
              onChange={(event) => {
                setSearchParams(
                  {
                    timeScale: (event.target.value as any) || null,
                  },
                  {
                    replace: true,
                  }
                );
              }}
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
                scrollToToday();
              }}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <ButtonGroup
              size="small"
              color="inherit"
              sx={{
                display: 'flex',
              }}
            >
              <Button
                onClick={() => {
                  tableElementRef.current?.parentElement?.scrollBy({
                    left: -unitTimeScaleWidth,
                    behavior: 'smooth',
                  });
                }}
              >
                <NavigateBeforeIcon />
              </Button>
              <Button
                onClick={() => {
                  tableElementRef.current?.parentElement?.scrollBy({
                    left: unitTimeScaleWidth,
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
        ref={mergeRefs([tableElementRef, ref])}
        className={clsx(className, classes.root)}
        {...rest}
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
