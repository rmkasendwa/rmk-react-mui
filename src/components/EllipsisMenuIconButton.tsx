import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  IconButtonProps,
  Popper,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { EllipsisMenuToolProps } from '../interfaces/Utils';
import PaginatedDropdownOptionList, {
  PaginatedDropdownOptionListProps,
} from './PaginatedDropdownOptionList';

export type { DropdownOption } from './PaginatedDropdownOptionList';

export interface EllipsisMenuIconButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EllipsisMenuIconButtonClassKey =
  keyof EllipsisMenuIconButtonClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiEllipsisMenuIconButton: EllipsisMenuIconButtonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiEllipsisMenuIconButton: keyof EllipsisMenuIconButtonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiEllipsisMenuIconButton?: {
      defaultProps?: ComponentsProps['MuiEllipsisMenuIconButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiEllipsisMenuIconButton'];
      variants?: ComponentsVariants['MuiEllipsisMenuIconButton'];
    };
  }
}

export interface EllipsisMenuIconButtonProps
  extends IconButtonProps,
    Omit<EllipsisMenuToolProps, 'variant'> {
  PaginatedDropdownOptionListProps?: Partial<PaginatedDropdownOptionListProps>;
  closeOnSelectOption?: boolean;
}

export function getEllipsisMenuIconButtonUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEllipsisMenuIconButton', slot);
}

export const ellipsisMenuIconButtonClasses: EllipsisMenuIconButtonClasses =
  generateUtilityClasses('MuiEllipsisMenuIconButton', ['root']);

const slots = {
  root: ['root'],
};

export const EllipsisMenuIconButton = forwardRef<
  HTMLButtonElement,
  EllipsisMenuIconButtonProps
>(function EllipsisMenuIconButton(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiEllipsisMenuIconButton',
  });
  const {
    className,
    children = <MoreVertIcon />,
    options,
    PaginatedDropdownOptionListProps = {},
    closeOnSelectOption = true,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getEllipsisMenuIconButtonUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const anchorRef = useRef(null);
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  if (options.length <= 0) {
    return null;
  }

  return (
    <>
      <IconButton
        {...rest}
        ref={mergeRefs([anchorRef, ref])}
        className={clsx(classes.root)}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
        sx={{
          ...sx,
          ...(() => {
            if (open) {
              return {
                '&,&:hover': {
                  bgcolor: alpha(palette.primary.main, 0.3),
                },
              };
            }
          })(),
        }}
      >
        {children}
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-end"
        sx={{ zIndex: 9999 }}
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box>
                <ClickAwayListener onClickAway={close}>
                  <PaginatedDropdownOptionList
                    onSelectOption={() => {
                      if (closeOnSelectOption) {
                        close();
                      }
                    }}
                    keyboardFocusElement={anchorRef.current}
                    {...{ options }}
                    {...PaginatedDropdownOptionListProps}
                  />
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
});

export default EllipsisMenuIconButton;
