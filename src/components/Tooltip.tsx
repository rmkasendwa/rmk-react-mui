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
import { forwardRef, useEffect, useRef, useState } from 'react';

export interface TooltipClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TooltipClassKey = keyof TooltipClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTooltipExtended: TooltipProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTooltipExtended: keyof TooltipClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTooltipExtended?: {
      defaultProps?: ComponentsProps['MuiTooltipExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTooltipExtended'];
      variants?: ComponentsVariants['MuiTooltipExtended'];
    };
  }
}
//#endregion

export const getTooltipUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTooltipExtended', slot);
};

const slots: Record<TooltipClassKey, [TooltipClassKey]> = {
  root: ['root'],
};

export const tooltipClasses: TooltipClasses = generateUtilityClasses(
  'MuiTooltipExtended',
  Object.keys(slots) as TooltipClassKey[]
);

export interface TooltipProps extends Omit<MuiTooltipProps, 'ref'> {
  enterAtCursorPosition?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTooltipExtended' });
    const {
      className,
      children,
      followCursor = false,
      enterAtCursorPosition = true,
      enterDelay = 1000,
      enterNextDelay = 500,
      open: openProp,
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

    const [open, setOpen] = useState(false);

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
        {...{ followCursor, enterDelay, enterNextDelay }}
        open={open || openProp}
        className={clsx(classes.root)}
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
          sx: {
            zIndex: 9999,
            ...rest.PopperProps?.sx,
          },
        }}
        onOpen={(...args) => {
          if (lastMouseEventRef.current) {
            mouseCoordinatesRef.current = {
              x: lastMouseEventRef.current.clientX,
              y: lastMouseEventRef.current.clientY,
            };
          }
          setOpen(true);
          return rest.onOpen?.(...args);
        }}
        onClose={(...args) => {
          const [event] = args;
          if (event?.type === 'mouseleave') {
            setOpen(false);
          }
          return rest.onClose?.(...args);
        }}
      >
        {children}
      </MuiTooltip>
    );
  }
);

export default Tooltip;
