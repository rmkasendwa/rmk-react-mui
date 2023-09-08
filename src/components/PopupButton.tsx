import {
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { omit } from 'lodash';
import { ReactNode, forwardRef } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { PopupToolProps, usePopupTool } from '../hooks/Tools/PopupTool';

export interface PopupButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PopupButtonClassKey = keyof PopupButtonClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPopupButton: PopupButtonProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPopupButton: keyof PopupButtonClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPopupButton?: {
      defaultProps?: ComponentsProps['MuiPopupButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPopupButton'];
      variants?: ComponentsVariants['MuiPopupButton'];
    };
  }
}
//#endregion

export const getPopupButtonUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPopupButton', slot);
};

const slots: Record<PopupButtonClassKey, [PopupButtonClassKey]> = {
  root: ['root'],
};

export const buttonPopupClasses: PopupButtonClasses = generateUtilityClasses(
  'MuiPopupButton',
  Object.keys(slots) as PopupButtonClassKey[]
);

export interface PopupButtonProps
  extends Omit<PopupToolProps, 'label' | 'icon'> {
  children: ReactNode;
}

export const PopupButton = forwardRef<HTMLElement, PopupButtonProps>(
  function PopupButton(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiPopupButton' });
    const { className, children, ...rest } = props;

    const classes = composeClasses(
      slots,
      getPopupButtonUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const popupTool = usePopupTool({
      label: children,
      icon: <span className="material-icons">more_vert</span>,
      ...rest,
    });

    const {
      popupElement,
      label,
      icon,
      ref: anchorRef,
      ...popupToolRest
    } = omit(popupTool, 'open', 'setOpen', 'extraToolProps');

    return (
      <>
        <Button
          ref={mergeRefs([ref, anchorRef as any])}
          className={clsx(classes.root)}
          startIcon={icon}
          color="inherit"
          {...(popupToolRest as any)}
        >
          {label}
        </Button>
        {popupElement}
      </>
    );
  }
);

export default PopupButton;
