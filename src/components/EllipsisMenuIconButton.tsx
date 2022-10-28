import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, IconButtonProps, Popper } from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import { forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { EllipsisMenuToolProps } from '../interfaces/Utils';
import PaginatedDropdownOptionList, {
  PaginatedDropdownOptionListProps,
} from './PaginatedDropdownOptionList';

export type { DropdownOption } from './PaginatedDropdownOptionList';

export interface EllipsisMenuIconButtonProps
  extends IconButtonProps,
    EllipsisMenuToolProps {
  PaginatedDropdownOptionListProps?: Partial<PaginatedDropdownOptionListProps>;
}

export const EllipsisMenuIconButton = forwardRef<
  HTMLButtonElement,
  EllipsisMenuIconButtonProps
>(function EllipsisMenuIconButton(
  { options, PaginatedDropdownOptionListProps = {}, ...rest },
  ref
) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <IconButton
        {...rest}
        ref={mergeRefs([anchorRef, ref])}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-end"
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                enabled: true,
                offset: [0, 12],
              },
            },
          ],
        }}
        sx={{ zIndex: 999 }}
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box>
                <ClickAwayListener onClickAway={close}>
                  <PaginatedDropdownOptionList
                    onSelectOption={close}
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
