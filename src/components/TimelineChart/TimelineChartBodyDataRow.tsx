import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  alpha,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  lighten,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import {
  CSSProperties,
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { BaseDataRow } from '../../interfaces/Table';
import { MONTHS, alignmentSyles } from './data';
import { BaseTimelineChartProps, Timeline } from './interfaces';

export interface TimelineChartBodyDataRowClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineChartBodyDataRowClassKey =
  keyof TimelineChartBodyDataRowClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineChartBodyDataRow: TimelineChartBodyDataRowProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineChartBodyDataRow: keyof TimelineChartBodyDataRowClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineChartBodyDataRow?: {
      defaultProps?: ComponentsProps['MuiTimelineChartBodyDataRow'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineChartBodyDataRow'];
      variants?: ComponentsVariants['MuiTimelineChartBodyDataRow'];
    };
  }
}

export interface TimelineChartBodyDataRowProps<
  RecordRow extends BaseDataRow = any
> extends BaseTimelineChartProps<RecordRow>,
    Partial<Pick<BoxProps, 'className' | 'sx'>> {
  row: RecordRow;
  expanded: boolean;
  onChangeExpanded?: (id: string) => void;
  selectedYear: number;
}

export function getTimelineChartBodyDataRowUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineChartBodyDataRow', slot);
}

export const TimelineChartBodyDataRowClasses: TimelineChartBodyDataRowClasses =
  generateUtilityClasses('MuiTimelineChartBodyDataRow', ['root']);

const slots = {
  root: ['root'],
};

export const TimelineChartBodyDataRow = forwardRef<
  HTMLDivElement,
  TimelineChartBodyDataRowProps
>(function TimelineChartBodyDataRow(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTimelineChartBodyDataRow',
  });
  const {
    className,
    row,
    expanded,
    onSelectTimeline,
    onChangeExpanded,
    getTimelines,
    selectedYear,
  } = props;

  const classes = composeClasses(
    slots,
    getTimelineChartBodyDataRowUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const getTimelinesRef = useRef(getTimelines);

  useEffect(() => {
    getTimelinesRef.current = getTimelines;
  }, [getTimelines]);

  const { palette } = useTheme();

  const getDatePercentage = useCallback(
    (dateString?: string, isEndDate = false) => {
      if (dateString) {
        const date = new Date(dateString);
        if (date.getFullYear() === selectedYear) {
          return (
            (date.getMonth() * (1 / 12) +
              ((date.getDate() - (isEndDate ? 0 : 1)) / getDaysInMonth(date)) *
                (1 / 12)) *
            100
          );
        }
      }
    },
    [selectedYear]
  );

  const { hasIntersectingTimelines, timelines } = useMemo(() => {
    const timelines = (
      getTimelinesRef.current ? getTimelinesRef.current(row) : []
    )
      .map((row) => {
        const { startDate, endDate } = row;
        return {
          ...row,
          startPercentage: getDatePercentage(startDate),
          endPercentage: getDatePercentage(endDate, true),
          displayInSelectedYear: (() => {
            if (
              (startDate && new Date(startDate).getFullYear() > selectedYear) ||
              (endDate && new Date(endDate).getFullYear() < selectedYear)
            ) {
              return false;
            }
            return true;
          })(),
        } as Timeline;
      })
      .sort(
        (
          { startDate: aResourceStartDate },
          { startDate: bResourceStartDate }
        ) => {
          if (aResourceStartDate && bResourceStartDate) {
            return (
              new Date(aResourceStartDate).getTime() -
              new Date(bResourceStartDate).getTime()
            );
          }
          if (aResourceStartDate && !bResourceStartDate) {
            return 1;
          }
          if (!aResourceStartDate && bResourceStartDate) {
            return -1;
          }
          return 0;
        }
      );

    let hasIntersectingTimelines = false;

    const selectedYearTimelines = timelines.filter(
      ({ displayInSelectedYear }) => displayInSelectedYear
    );

    selectedYearTimelines.forEach((timeline) => {
      const {
        startPercentage = 0,
        endPercentage = 100,
        displayInSelectedYear,
      } = timeline;
      if (displayInSelectedYear) {
        const intersectingTimelines = selectedYearTimelines.filter(
          (selectedYearTimeline) => {
            const {
              startPercentage: timelineStartPercentage = 0,
              endPercentage: timelineEndPercentage = 100,
            } = selectedYearTimeline;
            return (
              selectedYearTimeline !== timeline &&
              endPercentage > timelineStartPercentage &&
              timelineEndPercentage > startPercentage
            );
          }
        );
        if (intersectingTimelines.length > 0) {
          [timeline, ...intersectingTimelines].forEach((timeline) => {
            timeline.intersects = true;
          });
          hasIntersectingTimelines = true;
        }
      }
    });

    return {
      timelines,
      hasIntersectingTimelines,
    };
  }, [getDatePercentage, row, selectedYear]);

  const { id } = row;

  const intersectingTimelines = timelines.filter(
    ({ intersects }) => intersects
  );

  return (
    <Box
      ref={ref}
      className={clsx(classes.root)}
      onClick={
        timelines.length > 1
          ? () => {
              onChangeExpanded && onChangeExpanded(id);
            }
          : undefined
      }
      sx={{
        ...alignmentSyles,
        height: 'auto',
        position: 'relative',
        ...(() => {
          const styles: CSSProperties = {};
          if (timelines.length > 1) {
            if (expanded) {
              styles.cursor = 'zoom-out';
            } else {
              styles.cursor = 'zoom-in';
              if (hasIntersectingTimelines) {
                styles.zIndex = 1;
              }
            }
          }
          return styles;
        })(),
        '&.hover': {
          bgcolor: alpha(palette.primary.main, 0.1),
        },
        '&:hover': {
          zIndex: 2,
          ...(() => {
            const styles: any = {};
            if (timelines.length > 1 && hasIntersectingTimelines && !expanded) {
              timelines.forEach((timeline) => {
                const { intersects } = timeline;
                if (intersects) {
                  const index = intersectingTimelines.indexOf(timeline);
                  styles[
                    `& > .team-assignments-timeline-timeline-wrapper:nth-of-type(${
                      index + 1
                    }) > div`
                  ] = {
                    transform: `translateY(${index * 20}px)`,
                  };
                }
              });
            }
            return styles;
          })(),
        },
      }}
    >
      {/* Columns */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          '&>div': {
            borderRight: `1px solid ${palette.divider}`,
          },
          '&>div:last-of-type': {
            borderRightColor: 'transparent',
          },
          pointerEvents: 'none',
        }}
      >
        {MONTHS.map((month) => {
          return (
            <Box
              key={month}
              className="team-assignments-timeline-column"
              sx={{
                ...alignmentSyles,
                height: (() => {
                  if (expanded) {
                    return timelines.length * 50;
                  }
                  return 50;
                })(),
                borderBottom: `1px solid transparent`,
                flex: 1,
                justifyContent: 'center',
                willChange: 'height',
                transition: 'height 300ms',
              }}
            />
          );
        })}
      </Box>
      {timelines.map((timeline, index) => {
        const {
          id,
          startPercentage,
          endPercentage,
          displayInSelectedYear,
          intersects,
          label,
          getTimelineElement,
        } = timeline;
        const bgcolor =
          timeline.bgcolor ||
          (palette.mode === 'light' ? darken : lighten)(
            palette.background.paper,
            0.15
          );
        const color = timeline.color || palette.getContrastText(bgcolor);
        if (!displayInSelectedYear) {
          return <Fragment key={id} />;
        }
        const baseTimelineElement = (
          <Box
            onClick={(event) => {
              event.stopPropagation();
              onSelectTimeline && onSelectTimeline(id);
            }}
            sx={{
              bgcolor,
              color,
              height: '100%',
              position: 'relative',
              left: `${startPercentage || 0}%`,
              transform: (() => {
                if (intersects && !expanded) {
                  const index = intersectingTimelines.indexOf(timeline);
                  return `translateY(${index * 3}px)`;
                }
                return 'none';
              })(),
              width: `${
                (endPercentage ? endPercentage : 100) - (startPercentage || 0)
              }%`,
              overflow: 'hidden',
              willChange: 'height, transform',
              transition: 'height 300ms, transform 500ms',
              pointerEvents: 'auto',
              ...(() => {
                const styles: CSSProperties = {};
                if (startPercentage != null) {
                  styles.borderTopLeftRadius = '4px';
                  styles.borderBottomLeftRadius = '4px';
                }
                if (endPercentage != null) {
                  styles.borderTopRightRadius = '4px';
                  styles.borderBottomRightRadius = '4px';
                }
                const baseBoxShadow = `0 0 1px 1px ${alpha(color, 0.1)} inset`;
                if (hasIntersectingTimelines && !expanded) {
                  if (intersects) {
                    styles.boxShadow = `${baseBoxShadow}, 0 1px 5px -1px ${alpha(
                      '#000',
                      0.3
                    )}`;
                  }
                } else {
                  styles.boxShadow = baseBoxShadow;
                }
                return styles;
              })(),
              cursor: 'pointer',
              '&:hover': {
                boxShadow: `0 0 1px 1px ${alpha(
                  color,
                  0.3
                )}, 0 0 1px 2px ${bgcolor}`,
              },
            }}
          >
            {label}
          </Box>
        );
        return (
          <Box
            key={id}
            className="team-assignments-timeline-timeline-wrapper"
            component="section"
            sx={{
              position: 'absolute',
              top: (() => {
                if (expanded) {
                  return index * 50;
                }
                return 0;
              })(),
              width: '100%',
              height: 50,
              py: 1,
              zIndex: 0,
              display: 'flex',
              alignItems: 'end',
              willChange: 'top',
              transition: 'top 300ms',
              ...(() => {
                const styles: CSSProperties = {};
                if (timelines.length > 1 && !expanded) {
                  styles.pointerEvents = 'none';
                }
                return styles;
              })(),
              '&:hover': {
                zIndex: 2,
                ...(() => {
                  const styles: CSSProperties = {};
                  if (timelines.length > 1 && expanded) {
                    styles.backgroundColor = alpha(palette.primary.main, 0.1);
                  }
                  return styles;
                })(),
              },
            }}
          >
            {getTimelineElement
              ? getTimelineElement({ baseTimelineElement })
              : baseTimelineElement}
          </Box>
        );
      })}
    </Box>
  );
});

export default TimelineChartBodyDataRow;
