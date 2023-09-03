import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { MutableRefObject, forwardRef, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

import { ScrollToDateFunction, TimelineElement } from './models';

export interface TimelineRowDataNavigationButtonsContainerClasses {
  /** Styles applied to the root element. */
  root: string;
  navigationButton: string;
  navigationLeftButton: string;
  navigationRightButton: string;
}

export type TimelineRowDataNavigationButtonsContainerClassKey =
  keyof TimelineRowDataNavigationButtonsContainerClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineRowDataNavigationButtonsContainer: TimelineRowDataNavigationButtonsContainerProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineRowDataNavigationButtonsContainer: keyof TimelineRowDataNavigationButtonsContainerClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineRowDataNavigationButtonsContainer?: {
      defaultProps?: ComponentsProps['MuiTimelineRowDataNavigationButtonsContainer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineRowDataNavigationButtonsContainer'];
      variants?: ComponentsVariants['MuiTimelineRowDataNavigationButtonsContainer'];
    };
  }
}
//#endregion

export const getTimelineRowDataNavigationButtonsContainerUtilityClass = (
  slot: string
) => {
  return generateUtilityClass(
    'MuiTimelineRowDataNavigationButtonsContainer',
    slot
  );
};

const slots: Record<
  TimelineRowDataNavigationButtonsContainerClassKey,
  [TimelineRowDataNavigationButtonsContainerClassKey]
> = {
  root: ['root'],
  navigationButton: ['navigationButton'],
  navigationLeftButton: ['navigationLeftButton'],
  navigationRightButton: ['navigationRightButton'],
};

export const timelineRowDataNavigationButtonsContainerClasses: TimelineRowDataNavigationButtonsContainerClasses =
  generateUtilityClasses(
    'MuiTimelineRowDataNavigationButtonsContainer',
    Object.keys(slots) as TimelineRowDataNavigationButtonsContainerClassKey[]
  );

export interface TimelineRowDataNavigationButtonsContainerProps
  extends Partial<GridProps> {
  timelineViewPortContainerWidth: number;
  timelineElements: TimelineElement[];
  scrollingAncenstorElementRef?: MutableRefObject<
    HTMLElement | null | undefined
  >;
  currentDateAtStartPositionLeftOffsetRef: MutableRefObject<number | undefined>;
  currentDateAtEndPositionLeftOffsetRef: MutableRefObject<number | undefined>;
  scrollToDate: ScrollToDateFunction;
}

export const TimelineRowDataNavigationButtonsContainer = forwardRef<
  HTMLDivElement,
  TimelineRowDataNavigationButtonsContainerProps
>(function TimelineRowDataNavigationButtonsContainer(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTimelineRowDataNavigationButtonsContainer',
  });
  const {
    className,
    timelineViewPortContainerWidth,
    timelineElements,
    scrollingAncenstorElementRef,
    currentDateAtEndPositionLeftOffsetRef,
    currentDateAtStartPositionLeftOffsetRef,
    scrollToDate,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTimelineRowDataNavigationButtonsContainerUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const timelineElementsRef = useRef(timelineElements);
  timelineElementsRef.current = timelineElements;
  const leftButtonElementRef = useRef<HTMLButtonElement | null>(null);
  const rightButtonElementRef = useRef<HTMLButtonElement | null>(null);

  const { palette } = useTheme();
  const { ref: observerRef, inView: isVisible } = useInView();

  useEffect(() => {
    const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
    const leftButtonElement = leftButtonElementRef.current;
    const rightButtonElement = rightButtonElementRef.current;
    if (
      scrollingAncenstorElement &&
      leftButtonElement &&
      rightButtonElement &&
      isVisible
    ) {
      const scrollEventCallback = () => {
        if (
          currentDateAtStartPositionLeftOffsetRef != null &&
          currentDateAtEndPositionLeftOffsetRef?.current != null
        ) {
          const startPosition = currentDateAtStartPositionLeftOffsetRef.current;
          const endPosition = currentDateAtEndPositionLeftOffsetRef.current;
          const shouldShowLeftButton = Boolean(
            timelineElementsRef.current.find(({ offsetPercentage }) => {
              return (
                offsetPercentage != null &&
                startPosition != null &&
                offsetPercentage < startPosition
              );
            })
          );
          const shouldShowRightButton = Boolean(
            timelineElementsRef.current.find(({ offsetPercentage }) => {
              return (
                offsetPercentage != null &&
                endPosition != null &&
                offsetPercentage > endPosition
              );
            })
          );
          if (shouldShowLeftButton) {
            leftButtonElement.style.display = 'inline-flex';
          } else {
            leftButtonElement.style.display = 'none';
          }
          if (shouldShowRightButton) {
            rightButtonElement.style.display = 'inline-flex';
          } else {
            rightButtonElement.style.display = 'none';
          }
        }
      };
      scrollingAncenstorElement.addEventListener('scroll', scrollEventCallback);
      scrollEventCallback();
      return () => {
        leftButtonElement.style.display = '';
        rightButtonElement.style.display = '';
        scrollingAncenstorElement.removeEventListener(
          'scroll',
          scrollEventCallback
        );
      };
    }
  }, [currentDateAtEndPositionLeftOffsetRef, currentDateAtStartPositionLeftOffsetRef, isVisible, scrollingAncenstorElementRef]);

  return (
    <Grid
      ref={mergeRefs([ref, observerRef])}
      {...rest}
      className={clsx(classes.root)}
      container
      sx={{
        ...sx,
        pointerEvents: 'none',
        height: '100%',
        alignItems: 'center',
        px: 1,
        position: 'relative',
        zIndex: 2,
        width: timelineViewPortContainerWidth,
        [`.${classes.navigationButton}`]: {
          minWidth: 'auto',
          pointerEvents: 'auto',
          p: 0,
          borderColor: palette.divider,
          display: 'none',
          bgcolor: alpha(palette.background.paper, 0.3),
          '&:hover': {
            bgcolor: palette.primary.main,
            color: palette.getContrastText(palette.primary.main),
          },
        },
      }}
    >
      <Grid item>
        <Button
          ref={leftButtonElementRef}
          className={clsx(
            classes.navigationButton,
            classes.navigationLeftButton
          )}
          onClick={(event) => {
            event.stopPropagation();
            const startPosition =
              currentDateAtStartPositionLeftOffsetRef.current;
            const timelineElement = timelineElements
              .sort(
                (
                  { offsetPercentage: aOffsetPercentage },
                  { offsetPercentage: bOffsetPercentage }
                ) => {
                  if (aOffsetPercentage != null && bOffsetPercentage != null) {
                    return bOffsetPercentage - aOffsetPercentage;
                  }
                  return 0;
                }
              )
              .find(({ offsetPercentage }) => {
                return (
                  offsetPercentage != null &&
                  startPosition != null &&
                  offsetPercentage < startPosition
                );
              });
            if (timelineElement?.startDate) {
              scrollToDate(timelineElement.startDate, {
                dateAlignment: 'start',
              });
            }
          }}
          variant="outlined"
          color="inherit"
        >
          <KeyboardArrowLeftIcon
            sx={{
              fontSize: 14,
            }}
          />
        </Button>
      </Grid>
      <Grid item xs />
      <Grid item>
        <Button
          ref={rightButtonElementRef}
          className={clsx(
            classes.navigationButton,
            classes.navigationRightButton
          )}
          variant="outlined"
          color="inherit"
          onClick={(event) => {
            event.stopPropagation();
            const endPosition = currentDateAtEndPositionLeftOffsetRef.current;
            const timelineElement = timelineElements
              .sort(
                (
                  { offsetPercentage: aOffsetPercentage },
                  { offsetPercentage: bOffsetPercentage }
                ) => {
                  if (aOffsetPercentage != null && bOffsetPercentage != null) {
                    return aOffsetPercentage - bOffsetPercentage;
                  }
                  return 0;
                }
              )
              .find(({ offsetPercentage }) => {
                return (
                  offsetPercentage != null &&
                  endPosition != null &&
                  offsetPercentage > endPosition
                );
              });
            if (timelineElement?.startDate) {
              scrollToDate(timelineElement.startDate, {
                dateAlignment: 'center',
              });
            }
          }}
        >
          <KeyboardArrowRightIcon
            sx={{
              fontSize: 14,
            }}
          />
        </Button>
      </Grid>
    </Grid>
  );
});

export default TimelineRowDataNavigationButtonsContainer;
