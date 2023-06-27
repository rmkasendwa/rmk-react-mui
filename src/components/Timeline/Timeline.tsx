import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  BoxProps,
  Button,
  ButtonGroup,
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
  outlinedInputClasses,
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
import { result, uniqueId } from 'lodash';
import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import scrollIntoView from 'scroll-into-view-if-needed';
import * as Yup from 'yup';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import DataDropdownField, {
  dataDropdownFieldClasses,
} from '../InputFields/DataDropdownField';
import { BaseDataRow, Table, TableColumn, TableProps } from '../Table';
import TimeScaleMeter, { timeScaleMeterClasses } from './TimeScaleMeter';

export interface TimelineClasses {
  /** Styles applied to the root element. */
  root: string;
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

const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export type TimeScaleConfiguration = {
  timeScaleRows: [
    { id: string; label: ReactNode }[],
    { id: string; label: ReactNode }[],
    { id: string; label: ReactNode }[]
  ];
  unitTimeScaleWidth: number;
  timeScaleWidth: number;
};

export interface TimelineElement extends Partial<BoxProps> {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  label?: ReactNode;
  TooltipProps?: Partial<TooltipProps>;
}

export interface TimelineProps<RecordRow extends BaseDataRow = any>
  extends Partial<Pick<TableProps, 'className' | 'sx'>> {
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
  getTimelineElements?: (row: RecordRow) => TimelineElement[];
  id?: string;
  minDate?: string | number | Date;
  maxDate?: string | number | Date;
  selectedTimeScale?: TimeScaleOption;
  clearSearchStateOnUnmount?: boolean;
  getDefaultViewResetFunction?: (resetToDefaultView: () => void) => void;
  onChangeSearchParams?: (changedSearchParamKeys: string[]) => void;
}

export function getTimelineUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeline', slot);
}

export const timelineClasses: TimelineClasses = generateUtilityClasses(
  'MuiTimeline',
  ['root']
);

const slots = {
  root: ['root'],
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
    id,
    minDate: minDateProp,
    maxDate: maxDateProp,
    selectedTimeScale: selectedTimeScaleProp,
    clearSearchStateOnUnmount = false,
    getDefaultViewResetFunction,
    onChangeSearchParams,
    ...rest
  } = props;

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

  const isInitialMountRef = useRef(true);
  const timelineContainerElementRef = useRef<HTMLTableElement>(null);
  const todayIndicatorRef = useRef<HTMLDivElement>(null);
  const getDefaultViewResetFunctionRef = useRef(getDefaultViewResetFunction);
  getDefaultViewResetFunctionRef.current = getDefaultViewResetFunction;
  const onChangeSearchParamsRef = useRef(onChangeSearchParams);
  onChangeSearchParamsRef.current = onChangeSearchParams;

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));
  const baseSpacingUnits = isSmallScreenSize ? 16 : 24;

  const shouldShowRowLabelsColumn = (() => {
    return !isSmallScreenSize && showRowLabelsColumn;
  })();

  const { searchParams, setSearchParams } = useReactRouterDOMSearchParams({
    mode: 'json',
    spec: {
      timeScale: Yup.mixed<TimeScaleOption>().oneOf([...timeScaleOptions]),
    },
    id,
    clearSearchStateOnUnmount,
  });

  const stringifiedSearchParamKeys = JSON.stringify(Object.keys(searchParams));
  useEffect(() => {
    if (onChangeSearchParamsRef.current) {
      onChangeSearchParamsRef.current(JSON.parse(stringifiedSearchParamKeys));
    }
  }, [stringifiedSearchParamKeys]);

  const { timeScale: searchParamsSelectedTimeScale } = searchParams;

  const {
    minDate,
    maxDate,
    timelineYears,
    totalNumberOfDays,
    totalNumberOfHours,
  } = useMemo(() => {
    const allDates = rows
      .flatMap((row) => {
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
            const parsedStartDateValue = new Date(startDateValue as any);
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
        const baseMinDate = minDateProp ? new Date(minDateProp) : allDates[0];
        const minDate = new Date(baseMinDate.getFullYear(), 0, 1, 0, 0);

        const baseMaxDate = maxDateProp
          ? new Date(maxDateProp)
          : allDates[allDates.length - 1];
        const maxDate = new Date(baseMaxDate.getFullYear(), 11, 31, 23, 59);

        return { minDate, maxDate };
      }
      const thisYear = new Date().getFullYear();
      return {
        minDate: new Date(thisYear, 0, 1, 0, 0),
        maxDate: new Date(thisYear, 11, 31, 23, 59),
      };
    })();

    const minDateYear = minDate.getFullYear();
    const maxDateYear = maxDate.getFullYear();
    const timelineYears: number[] = [];

    for (let year = minDateYear; year <= maxDateYear; year++) {
      timelineYears.push(year);
    }
    const totalNumberOfDays = differenceInDays(maxDate, minDate) + 1;
    const totalNumberOfHours = differenceInHours(maxDate, minDate) + 24;

    return {
      minDate,
      maxDate,
      timelineYears,
      totalNumberOfDays,
      totalNumberOfHours,
    };
  }, [endDateProperty, maxDateProp, minDateProp, rows, startDateProperty]);

  const selectedTimeScale = useMemo(() => {
    if (searchParamsSelectedTimeScale) {
      return searchParamsSelectedTimeScale;
    }
    return selectedTimeScaleProp || 'Year';
  }, [searchParamsSelectedTimeScale, selectedTimeScaleProp]);

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
            timelineYears.flatMap((year) => {
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
            }),
            timelineYears.flatMap((year) => {
              return fullMonthLabels.flatMap((_, index) => {
                const unitTickDate = new Date(year, index, 1);
                const daysInMonth = getDaysInMonth(unitTickDate);
                return Array.from({ length: daysInMonth }).map((_, index) => {
                  const tickDate = addDays(unitTickDate, index);
                  return {
                    id: uniqueId(),
                    label: formatDate(tickDate, 'd'),
                  };
                });
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
      }: {
        monthSplit: number;
        unitTimeScaleWidth: number;
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
            timelineYears.flatMap(() => {
              return fullMonthLabels.map((label) => {
                return {
                  id: uniqueId(),
                  label,
                };
              });
            }),
            timelineYears.flatMap((_, yearIndex) => {
              return Array.from({ length: 12 }).flatMap((_, monthIndex) => {
                return Array.from({ length: monthSplit }).map(
                  (_, periodIndex) => {
                    const unitTickDate = addDays(
                      minDate,
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
                    };
                  }
                );
              });
            }),
          ],
          unitTimeScaleWidth,
          timeScaleWidth: unitTimeScaleWidth * timelineYears.length,
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
            unitTimeScaleWidth: baseTimeScaleWidth * 4 * 12,
          });
        case 'Year':
          return getMonthlyTickTimeScale({
            monthSplit: 3,
            unitTimeScaleWidth: baseTimeScaleWidth * 12,
          });
        case '5 year':
          const unitTimeScaleWidth = baseTimeScaleWidth * 12;
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
            timeScaleWidth: (unitTimeScaleWidth * timelineYears.length) / 4,
          };
      }
    }, [
      minDate,
      selectedTimeScale,
      timelineYears,
      totalNumberOfDays,
      totalNumberOfHours,
    ]);

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
          const numberOfHours = differenceInHours(endDate, startDate) + 24;
          const offsetPercentage =
            (differenceInHours(startDate, minDate) + 24) / totalNumberOfHours;
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
                  bgcolor: palette.background.paper,
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

  const scrollToToday = () => {
    if (todayIndicatorRef.current) {
      const initialScrollTop =
        timelineContainerElementRef.current?.parentElement?.scrollTop;
      scrollIntoView(todayIndicatorRef.current, {
        scrollMode: 'if-needed',
        behavior: 'smooth',
        block: 'start',
        inline: 'center',
      });
      setTimeout(() => {
        if (initialScrollTop != null) {
          timelineContainerElementRef.current?.parentElement?.scrollTo({
            top: initialScrollTop,
            behavior: 'smooth',
          });
        }
      }, 1000);
    }
  };
  const scrollToTodayRef = useRef(scrollToToday);
  scrollToTodayRef.current = scrollToToday;

  useEffect(() => {
    if (selectedTimeScale) {
      scrollToTodayRef.current();
    }
  }, [selectedTimeScale]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const columns: TableColumn<RecordRow>[] = [
    {
      id: 'timeline',
      label: (
        <TimeScaleMeter
          {...{ timeScaleRows, timeScaleWidth }}
          scrollingElement={timelineContainerElementRef.current?.parentElement}
          leftOffset={(shouldShowRowLabelsColumn ? 256 : 0) + baseSpacingUnits}
          sx={{
            [`.${timeScaleMeterClasses.timeScaleLevel1Tick}`]: {
              left:
                (shouldShowRowLabelsColumn ? 256 : 0) +
                (() => {
                  if (shouldShowRowLabelsColumn) {
                    return 16;
                  }
                  return baseSpacingUnits;
                })(),
            },
          }}
        />
      ),
      secondaryHeaderRowContent: (() => {
        const today = new Date();
        if (isAfter(today, minDate) && isBefore(today, maxDate)) {
          const offsetPercentage =
            differenceInHours(today, minDate) / totalNumberOfHours;
          return (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
              }}
            >
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
            </Box>
          );
        }
      })(),
      getColumnValue: (row) => {
        if (getTimelineElements) {
          const timelineElements = getTimelineElements(row);
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
      width: timeScaleWidth + baseSpacingUnits * 2,
      wrapColumnContentInFieldValue: false,
      headerSx: {
        '&>div': {
          py: 0,
          pl: `${baseSpacingUnits}px`,
          pr: `${baseSpacingUnits}px`,
        },
      },
      bodySx: {
        pl: `${baseSpacingUnits}px`,
        pr: `${baseSpacingUnits}px`,
        py: 1,
        '&>div': {
          height: 34,
        },
      },
    },
  ];

  if (shouldShowRowLabelsColumn) {
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
      headerSx: {
        borderRight: 'none !important',
        zIndex: 1,
        '&>div': {
          py: 0,
          pl: `${baseSpacingUnits}px`,
          pr: `${baseSpacingUnits}px`,
        },
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
      headerSx: {
        '&>div': {
          py: 0,
          pl: `${baseSpacingUnits}px`,
          pr: `${baseSpacingUnits}px`,
        },
      },
      bodySx: {
        p: 0,
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
            pr: `${baseSpacingUnits}px`,
            pl: 1,
            py: 1,
            alignItems: 'center',
            position: 'sticky',
            right: 0,
            display: 'inline-flex',
            gap: isSmallScreenSize ? 0.5 : 2,
            bgcolor: palette.background.paper,
            height: 56,
            width: 'auto',
          }}
        >
          <Grid item>
            <Stack
              direction="row"
              sx={{
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {!isSmallScreenSize ? (
                <Typography variant="body2">Timescale:</Typography>
              ) : null}
              <Button
                color="inherit"
                variant="contained"
                size="small"
                disableRipple
                sx={{
                  minWidth: 0,
                  p: 0,
                }}
              >
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
                  InputProps={{
                    sx: {
                      height: 32,
                      pr: 0.5,
                      [`.${outlinedInputClasses.notchedOutline}`]: {
                        border: 'none',
                      },
                    },
                  }}
                  WrapperProps={{
                    sx: {
                      [`.${dataDropdownFieldClasses.selectedOptionsWrapper}`]: {
                        top: 3,
                        width: 'calc(100% - 22px) !important',
                      },
                    },
                  }}
                  enableLoadingState={false}
                  sx={{
                    width: 90,
                  }}
                />
              </Button>
            </Stack>
          </Grid>
          <Grid item>
            <Stack
              direction="row"
              sx={{
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {!isSmallScreenSize ? (
                <Typography variant="body2">Jump to:</Typography>
              ) : null}
              <Button
                variant="contained"
                color="inherit"
                size="small"
                onClick={() => {
                  scrollToToday();
                }}
                sx={{
                  height: 32,
                }}
              >
                Today
              </Button>
              <ButtonGroup
                size="small"
                variant="contained"
                color="inherit"
                disableElevation
                sx={{
                  display: 'flex',
                }}
              >
                <Button
                  onClick={() => {
                    timelineContainerElementRef.current?.parentElement?.scrollBy(
                      {
                        left: -unitTimeScaleWidth,
                        behavior: 'smooth',
                      }
                    );
                  }}
                  sx={{
                    px: 1,
                    minWidth: 'auto !important',
                    width: 32,
                  }}
                >
                  <NavigateBeforeIcon />
                </Button>
                <Button
                  onClick={() => {
                    timelineContainerElementRef.current?.parentElement?.scrollBy(
                      {
                        left: unitTimeScaleWidth,
                        behavior: 'smooth',
                      }
                    );
                  }}
                  sx={{
                    px: 1,
                    minWidth: 'auto !important',
                    width: 32,
                  }}
                >
                  <NavigateNextIcon />
                </Button>
              </ButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <Table
        ref={mergeRefs([timelineContainerElementRef, ref])}
        className={clsx(className, classes.root)}
        {...rest}
        columns={columns}
        paging={false}
        bordersVariant="square"
        rows={rows}
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
          },
        }}
        SecondaryHeaderRowProps={{
          sx: {
            position: 'relative',
            zIndex: -1,
          },
        }}
        sx={{
          tr: {
            verticalAlign: 'middle',
          },
        }}
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
