import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SvgIcon,
  SvgIconProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TrafficConeIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TrafficConeIconClassKey = keyof TrafficConeIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTrafficConeIcon: TrafficConeIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTrafficConeIcon: keyof TrafficConeIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTrafficConeIcon?: {
      defaultProps?: ComponentsProps['MuiTrafficConeIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTrafficConeIcon'];
      variants?: ComponentsVariants['MuiTrafficConeIcon'];
    };
  }
}
//#endregion

export const getTrafficConeIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTrafficConeIcon', slot);
};

const slots: Record<TrafficConeIconClassKey, [TrafficConeIconClassKey]> = {
  root: ['root'],
};

export const trafficConeIconClasses: TrafficConeIconClasses =
  generateUtilityClasses(
    'MuiTrafficConeIcon',
    Object.keys(slots) as TrafficConeIconClassKey[]
  );

export interface TrafficConeIconProps extends SvgIconProps {}

export const TrafficConeIcon = forwardRef<SVGSVGElement, TrafficConeIconProps>(
  function TrafficConeIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTrafficConeIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getTrafficConeIconUtilityClass,
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
        viewBox="0 0 512 512"
      >
        <path
          d="M255.8,310.9c-32,0-59.7-4.8-83.1-14.4c-23.4-9.6-35.9-21.1-37.3-34.6c15.6-44,25.6-72.1,29.8-84.2
  c3.6,9.9,14,18.1,31.4,24.5c17.4,6.4,37.1,9.6,59.1,9.6c22.7,0,42.6-3.2,59.7-9.6c17-6.4,27.3-14.6,30.9-24.5
  c4.3,12.1,14.2,40.1,29.8,84.2c-1.4,13.5-13.9,25-37.3,34.6C315.4,306.1,287.7,310.9,255.8,310.9 M255.8,132.9
  c-34.1,0-56.1-7.8-66.1-23.4l27.7-75.6c3.6-12.1,16.3-18.1,38.4-18.1s35.2,6,39.4,18.1c4.3,13.5,13.1,38.7,26.6,75.6
  C311.9,125.1,289.8,132.9,255.8,132.9 M490.1,337.5c14.2,5.7,21.5,13,21.8,21.8c0.4,8.9-6.2,17.2-19.7,25L304.8,484.5
  c-13.5,7.8-29.7,11.7-48.5,11.7s-35-3.9-48.5-11.7L19.2,384.4c-13.5-7.1-19.9-15.3-19.2-24.5c0.7-9.2,8.2-16.7,22.4-22.4L122.6,297
  l-11.7,32c0,17,14.2,31.6,42.6,43.7c28.4,12.1,62.5,18.1,102.3,18.1s73.9-6,102.3-18.1c28.4-12.1,43-26.6,43.7-43.7L390,297
  L490.1,337.5"
        />
      </SvgIcon>
    );
  }
);

export default TrafficConeIcon;
