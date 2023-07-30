import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useEffect, useRef } from 'react';

export interface TooltipClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TooltipClassKey = keyof TooltipClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTooltipExtended: TooltipProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTooltipExtended: keyof TooltipClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTooltipExtended?: {
      defaultProps?: ComponentsProps['MuiTooltipExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTooltipExtended'];
      variants?: ComponentsVariants['MuiTooltipExtended'];
    };
  }
}

export interface TooltipProps extends Omit<MuiTooltipProps, 'ref'> {
  enterAtCursorPosition?: boolean;
}

export function getTooltipUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTooltipExtended', slot);
}

export const tooltipClasses: TooltipClasses = generateUtilityClasses(
  'MuiTooltipExtended',
  ['root']
);

const slots = {
  root: ['root'],
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTooltipExtended' });
    const {
      className,
      children,
      followCursor = false,
      enterAtCursorPosition = true,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getTooltipUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const lastMouseEventRef = useRef<MouseEvent | null>(null);
    const mouseCoordinatesRef = useRef<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });

    useEffect(() => {
      const mouseMoveEventCallback = (event: MouseEvent) => {
        lastMouseEventRef.current = event;
      };
      window.addEventListener('mousemove', mouseMoveEventCallback);
      return () => {
        window.removeEventListener('mousemove', mouseMoveEventCallback);
      };
    }, []);

    return (
      <MuiTooltip
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        followCursor={followCursor}
        PopperProps={{
          ...(() => {
            if (enterAtCursorPosition && !followCursor) {
              return {
                anchorEl: {
                  getBoundingClientRect: () => {
                    const { x, y } = mouseCoordinatesRef.current;
                    return new DOMRect(x, y, 0, 0);
                  },
                },
              };
            }
          })(),
          ...rest.PopperProps,
        }}
        onOpen={(...args) => {
          if (lastMouseEventRef.current) {
            mouseCoordinatesRef.current = {
              x: lastMouseEventRef.current.clientX,
              y: lastMouseEventRef.current.clientY,
            };
          }
          return rest.onOpen?.(...args);
        }}
      >
        {children}
      </MuiTooltip>
    );
  }
);

export default Tooltip;
