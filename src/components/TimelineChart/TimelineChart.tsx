import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  Tooltip,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { format as formatDate } from 'date-fns';
import getDaysInMonth from 'date-fns/getDaysInMonth';
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
import { BaseDataRow } from '../../interfaces/Table';
import RenderIfVisible from '../RenderIfVisible';
import { BaseTimelineChartProps } from './interfaces';
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

  const onChangeExpandedRef = useRef(onChangeExpandedProp);
  const getTimelinesRef = useRef(getTimelines);

  useEffect(() => {
    onChangeExpandedRef.current = onChangeExpandedProp;
    getTimelinesRef.current = getTimelines;
  }, [getTimelines, onChangeExpandedProp]);

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
                    expanded={allRowsExpanded || expandedRows.includes(row.id)}
                  />
                </RenderIfVisible>
              );
            })}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export const TimelineChart = forwardRef(BaseTimelineChart) as <
  RecordRow extends BaseDataRow
>(
  p: TimelineChartProps<RecordRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default TimelineChart;
