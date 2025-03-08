import { ClickAwayListener } from '@mui/base';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { RefObject, forwardRef, useState } from 'react';

import Tooltip, { TooltipProps } from './Tooltip';

export interface TooltipPopupButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TooltipPopupButtonClassKey = keyof TooltipPopupButtonClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTooltipPopupButton: TooltipPopupButtonProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTooltipPopupButton: keyof TooltipPopupButtonClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTooltipPopupButton?: {
      defaultProps?: ComponentsProps['MuiTooltipPopupButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTooltipPopupButton'];
      variants?: ComponentsVariants['MuiTooltipPopupButton'];
    };
  }
}
//#endregion

export const getTooltipPopupButtonUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTooltipPopupButton', slot);
};

const slots: Record<TooltipPopupButtonClassKey, [TooltipPopupButtonClassKey]> =
  {
    root: ['root'],
  };

export const buttonPopupClasses: TooltipPopupButtonClasses =
  generateUtilityClasses(
    'MuiTooltipPopupButton',
    Object.keys(slots) as TooltipPopupButtonClassKey[]
  );

export interface TooltipPopupButtonProps
  extends Omit<LoadingButtonProps, 'title'>,
    Pick<TooltipProps, 'title'> {
  TooltipProps?: Partial<TooltipProps>;
  openTooltipRef?: RefObject<(() => void) | undefined>;
  closeTooltipRef?: RefObject<(() => void) | undefined>;
}

export const TooltipPopupButton = forwardRef<
  HTMLButtonElement,
  TooltipPopupButtonProps
>(function TooltipPopupButton(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTooltipPopupButton',
  });
  const {
    className,
    children,
    title,
    TooltipProps = {},
    openTooltipRef,
    closeTooltipRef,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTooltipPopupButtonUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const [open, setOpen] = useState(false);

  const handleTooltipOpen = () => {
    setOpen(true);
  };
  if (openTooltipRef) {
    openTooltipRef.current = handleTooltipOpen;
  }

  const handleTooltipClose = () => {
    setOpen(false);
  };
  if (closeTooltipRef) {
    closeTooltipRef.current = handleTooltipClose;
  }

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <span>
        <Tooltip
          {...TooltipProps}
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          enterAtCursorPosition={false}
          title={title}
        >
          <LoadingButton
            ref={ref}
            className={clsx(classes.root)}
            {...rest}
            onClick={handleTooltipOpen}
          >
            {children}
          </LoadingButton>
        </Tooltip>
      </span>
    </ClickAwayListener>
  );
});

export default TooltipPopupButton;
