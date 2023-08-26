import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

import Tooltip from '../Tooltip';
import { TimelineElement as TimelineElementType } from './models';

export interface TimelineElementClasses {
  /** Styles applied to the root element. */
  root: string;
  leftEdgeIntersecting: string;
}

export type TimelineElementClassKey = keyof TimelineElementClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineElement: TimelineElementProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineElement: keyof TimelineElementClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineElement?: {
      defaultProps?: ComponentsProps['MuiTimelineElement'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineElement'];
      variants?: ComponentsVariants['MuiTimelineElement'];
    };
  }
}
//#endregion

export const getTimelineElementUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTimelineElement', slot);
};

const slots: Record<TimelineElementClassKey, [TimelineElementClassKey]> = {
  root: ['root'],
  leftEdgeIntersecting: ['leftEdgeIntersecting'],
};

export const timelineElementClasses: TimelineElementClasses =
  generateUtilityClasses(
    'MuiTimelineElement',
    Object.keys(slots) as TimelineElementClassKey[]
  );

export interface TimelineElementProps extends TimelineElementType {
  scrollingAncenstorElement?: HTMLElement | null;
}

export const TimelineElement = forwardRef<HTMLDivElement, TimelineElementProps>(
  function TimelineElement(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTimelineElement' });
    const {
      className,
      sx,
      label,
      TooltipProps = {},
      scrollingAncenstorElement,
      percentage = 0,
      offsetPercentage = 0,
      timelineContainerWidth = 0,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getTimelineElementUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const {
      title,
      PopperProps: TooltipPropsPopperProps = {},
      ...TooltipPropsRest
    } = TooltipProps;

    //#region Refs
    const timelineElementRef = useRef<HTMLDivElement>(null);
    //#endregion

    const { palette } = useTheme();
    const { ref: observerRef, inView: isVisible } = useInView();
    const baseLeftEdgeOffset = timelineContainerWidth * offsetPercentage;
    const width = timelineContainerWidth * percentage;
    const baseRightEdgeOffset = baseLeftEdgeOffset + width;

    const updateStickyContentPosition = () => {
      if (timelineElementRef.current && scrollingAncenstorElement) {
        const timelineElement = timelineElementRef.current;
        const scrollingAncenstorElementLeftEdgeOffset = 0;
        const timelineElementLeftOffset =
          baseLeftEdgeOffset - scrollingAncenstorElement.scrollLeft;
        const timelineElementRightOffset =
          baseRightEdgeOffset - scrollingAncenstorElement.scrollLeft;
        if (
          scrollingAncenstorElementLeftEdgeOffset > timelineElementLeftOffset &&
          scrollingAncenstorElementLeftEdgeOffset < timelineElementRightOffset
        ) {
          timelineElement.classList.add(classes.leftEdgeIntersecting);
          timelineElement.style.paddingLeft = `${
            scrollingAncenstorElementLeftEdgeOffset - timelineElementLeftOffset
          }px`;
        } else {
          timelineElement.classList.remove(classes.leftEdgeIntersecting);
          timelineElement.style.paddingLeft = '';
        }
      }
    };
    const updateStickyContentPositionRef = useRef(updateStickyContentPosition);
    updateStickyContentPositionRef.current = updateStickyContentPosition;

    useEffect(() => {
      if (
        isVisible &&
        scrollingAncenstorElement &&
        timelineElementRef.current
      ) {
        const timelineElement = timelineElementRef.current;
        const scrollEventCallback = () => {
          updateStickyContentPositionRef.current();
        };
        scrollingAncenstorElement.addEventListener(
          'scroll',
          scrollEventCallback
        );
        scrollEventCallback();
        return () => {
          timelineElement.classList.remove(classes.leftEdgeIntersecting);
          timelineElement.style.paddingLeft = '';
          timelineElement.style.paddingRight = '';
          scrollingAncenstorElement.removeEventListener(
            'scroll',
            scrollEventCallback
          );
        };
      }
    }, [
      baseLeftEdgeOffset,
      baseRightEdgeOffset,
      classes.leftEdgeIntersecting,
      isVisible,
      scrollingAncenstorElement,
    ]);

    const timelineElementNode = (
      <Box
        ref={mergeRefs([ref, timelineElementRef, observerRef])}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          bgcolor: palette.primary.main,
          color: palette.getContrastText(palette.primary.main),
          border: `1px solid ${palette.divider}`,
          borderRadius: 1,
          height: 42,
          '&:hover': {
            zIndex: 1,
          },
          boxSizing: 'border-box',
          ...sx,
        }}
      >
        <Typography
          component="div"
          variant="body2"
          noWrap
          sx={{
            width: '100%',
            px: 2,
          }}
        >
          {label}
        </Typography>
      </Box>
    );

    if (title) {
      return (
        <Tooltip
          title={title}
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
          {timelineElementNode}
        </Tooltip>
      );
    }

    return timelineElementNode;
  }
);

export default TimelineElement;
