import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
import { alpha, useTheme } from '@mui/material';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import differenceInHours from 'date-fns/differenceInHours';
import formatDate from 'date-fns/format';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import { uniqueId } from 'lodash';
import { RefObject, useEffect, useMemo, useState } from 'react';

import {
  TimeScaleConfiguration,
  TimeScaleOption,
  TimeScaleRow,
  fullMonthLabels,
  quarterLabels,
  shortMonthLabels,
} from '../models';

export interface TimeScaleConfigurationProps {
  selectedTimeScale: TimeScaleOption;
  TimeScaleMeterPropsVariant: 'compact' | 'default';
  customDateRange?: {
    startDate?: string;
    endDate?: string;
  };
  isCustomDatesSelected?: boolean;
  minCalendarDate: Date;
  timelineYears: number[];
  totalNumberOfDays: number;
  totalNumberOfHours: number;
  scrollingAncenstorElementRef?: RefObject<HTMLElement | null | undefined>;
  timelineViewPortLeftOffset: number;
}
export const useTimeScaleMeterConfiguration = ({
  selectedTimeScale,
  TimeScaleMeterPropsVariant,
  minCalendarDate,
  timelineYears,
  totalNumberOfDays,
  totalNumberOfHours,
  customDateRange,
  isCustomDatesSelected,
  timelineViewPortLeftOffset,
  scrollingAncenstorElementRef,
}: TimeScaleConfigurationProps) => {
  const { palette } = useTheme();
  const [
    scrollingAncenstorElementClientWidth,
    setScrollingAncenstorElementClientWidth,
  ] = useState(scrollingAncenstorElementRef?.current?.clientWidth);

  useEffect(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    if (scrollingAncenstorElement) {
      const observer = new ResizeObserver(() => {
        setScrollingAncenstorElementClientWidth(
          scrollingAncenstorElement.clientWidth
        );
      });
      observer.observe(scrollingAncenstorElement);
      return () => {
        observer.disconnect();
      };
    }
  }, [scrollingAncenstorElementRef]);

  return useMemo(() => {
    const {
      timeScaleRows,
      unitTimeScaleWidth: baseUnitTimeScaleWidth,
      timeScaleWidth: baseTimeScaleWidth,
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
            unitTimeScale: 14,
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
              (() => {
                if (TimeScaleMeterPropsVariant === 'compact') {
                  return timelineYears.flatMap((year) => {
                    return {
                      id: uniqueId(),
                      label: String(year),
                    };
                  });
                }
                return timelineYears.flatMap(() => {
                  return quarterLabels.map((quarter) => {
                    return {
                      id: uniqueId(),
                      label: quarter,
                    };
                  });
                });
              })(),
              timelineYears.flatMap(() => {
                return shortMonthLabels.map((label, monthIndex) => {
                  return {
                    id: uniqueId(),
                    label,
                    ...(() => {
                      if (TimeScaleMeterPropsVariant === 'compact') {
                        return {
                          sx: {
                            ...(() => {
                              if (monthIndex % 3 === 0) {
                                return {
                                  borderLeftColor: '#f00',
                                };
                              }
                            })(),
                            ...(() => {
                              if (monthIndex === 0) {
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
                });
              }),
            ],
            unitTimeScaleWidth,
            timeScaleWidth: yearWidth * timelineYears.length,
          };
        }
      }
    })();

    const { unitTimeScaleWidth, timeScaleWidth } = (() => {
      if (
        isCustomDatesSelected &&
        customDateRange?.startDate &&
        customDateRange?.endDate
      ) {
        return {
          unitTimeScaleWidth:
            40 *
            differenceInHours(
              createDateWithoutTimezoneOffset(customDateRange.endDate),
              createDateWithoutTimezoneOffset(customDateRange.startDate)
            ),
          timeScaleWidth: 40 * totalNumberOfHours,
        };
      }
      return {
        unitTimeScaleWidth: baseUnitTimeScaleWidth,
        timeScaleWidth: baseTimeScaleWidth,
      };
    })();

    const timelineViewPortContainerWidth =
      (scrollingAncenstorElementClientWidth ?? 0) - timelineViewPortLeftOffset;
    const timelineWidthScaleFactor =
      timelineViewPortContainerWidth > 0
        ? timelineViewPortContainerWidth / unitTimeScaleWidth
        : 1;
    const scaledUnitTimeScaleWidth =
      unitTimeScaleWidth * timelineWidthScaleFactor;
    const scaledTimeScaleWidth = timeScaleWidth * timelineWidthScaleFactor;

    return {
      timeScaleRows,
      unitTimeScaleWidth,
      timeScaleWidth,
      timelineWidthScaleFactor,
      scaledUnitTimeScaleWidth,
      scaledTimeScaleWidth,
      timelineViewPortContainerWidth,
    };
  }, [
    TimeScaleMeterPropsVariant,
    customDateRange?.endDate,
    customDateRange?.startDate,
    isCustomDatesSelected,
    minCalendarDate,
    palette.text.primary,
    scrollingAncenstorElementClientWidth,
    selectedTimeScale,
    timelineViewPortLeftOffset,
    timelineYears,
    totalNumberOfDays,
    totalNumberOfHours,
  ]);
};
