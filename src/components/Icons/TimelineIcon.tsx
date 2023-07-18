import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TimelineIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineIconClassKey = keyof TimelineIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineIcon: TimelineIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineIcon: keyof TimelineIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineIcon?: {
      defaultProps?: ComponentsProps['MuiTimelineIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineIcon'];
      variants?: ComponentsVariants['MuiTimelineIcon'];
    };
  }
}

export interface TimelineIconProps extends SvgIconProps {}

export function getTimelineIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineIcon', slot);
}

export const codeIconClasses: TimelineIconClasses = generateUtilityClasses(
  'MuiTimelineIcon',
  ['root']
);

const slots = {
  root: ['root'],
};

export const TimelineIcon = forwardRef<SVGSVGElement, TimelineIconProps>(
  function TimelineIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTimelineIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getTimelineIconUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <SvgIcon
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        viewBox="0 0 16 16"
      >
        <path d="M4.16667 11.35H7.83333V10.35H4.16667V11.35ZM6.16667 8.5H9.83333V7.5H6.16667V8.5ZM8.16667 5.65H11.8333V4.65H8.16667V5.65ZM3 14C2.73333 14 2.5 13.9 2.3 13.7C2.1 13.5 2 13.2667 2 13V3C2 2.73333 2.1 2.5 2.3 2.3C2.5 2.1 2.73333 2 3 2H13C13.2667 2 13.5 2.1 13.7 2.3C13.9 2.5 14 2.73333 14 3V13C14 13.2667 13.9 13.5 13.7 13.7C13.5 13.9 13.2667 14 13 14H3ZM3 13H13V3H3V13ZM3 3V13V3Z" />
      </SvgIcon>
    );
  }
);

export default TimelineIcon;
