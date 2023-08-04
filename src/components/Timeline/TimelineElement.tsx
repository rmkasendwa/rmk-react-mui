import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Tooltip,
  TooltipProps,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

export interface TimelineElementClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineElementClassKey = keyof TimelineElementClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineElement: TimelineElementProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineElement: keyof TimelineElementClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineElement?: {
      defaultProps?: ComponentsProps['MuiTimelineElement'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineElement'];
      variants?: ComponentsVariants['MuiTimelineElement'];
    };
  }
}

export interface TimelineElementProps extends Partial<Omit<BoxProps, 'ref'>> {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  label?: ReactNode;
  TooltipProps?: Partial<TooltipProps>;
}

export function getTimelineElementUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineElement', slot);
}

export const TimelineElementClasses: TimelineElementClasses =
  generateUtilityClasses('MuiTimelineElement', ['root']);

const slots = {
  root: ['root'],
};

export const TimelineElement = forwardRef<HTMLDivElement, TimelineElementProps>(
  function TimelineElement(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTimelineElement' });
    const { className, sx, label, TooltipProps = {}, ...rest } = props;

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

    const { palette } = useTheme();

    const timelineElementNode = (
      <Box
        ref={ref}
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
          ...sx,
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
