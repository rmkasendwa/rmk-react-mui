import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardContentProps,
  ClickAwayListener,
  Divider,
  Grow,
  Popper,
  alpha,
  useTheme,
} from '@mui/material';
import { ReactNode, useRef, useState } from 'react';

import { Tool } from '../components/SearchSyncToolbar';

export interface ButtonPopupToolOptions {
  popupCardTitle: ReactNode;
  bodyContent: ReactNode;
  label: ReactNode;
  BodyContentProps?: Partial<CardContentProps>;
  footerContent?: ReactNode;
  icon?: ReactNode;
}

export const useButtonPopupTool = ({
  label,
  popupCardTitle,
  icon,
  bodyContent,
  BodyContentProps = {},
  footerContent,
}: ButtonPopupToolOptions) => {
  const { sx: BodyContentPropsSx, ...BodyContentPropsRest } = BodyContentProps;
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const { palette } = useTheme();
  const [open, setOpen] = useState(false);

  const tool: Tool = {
    ref: anchorRef,
    label: (
      <>
        {label}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          transition
          placement="bottom-start"
          sx={{
            zIndex: 10,
          }}
        >
          {({ TransitionProps }) => {
            return (
              <Grow {...TransitionProps}>
                <Box>
                  <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <Box>
                      <Card>
                        {popupCardTitle}
                        <Divider />
                        <CardContent
                          {...BodyContentPropsRest}
                          sx={{
                            maxHeight: `calc(100vh - 210px)`,
                            minWidth: 400,
                            overflowY: 'auto',
                            bgcolor: alpha(palette.background.paper, 0.7),
                            backdropFilter: `blur(20px)`,
                            '&,&:last-child': {
                              py: 1,
                            },
                            px: 2,
                            ...BodyContentPropsSx,
                          }}
                        >
                          {bodyContent}
                        </CardContent>
                        {footerContent ? (
                          <CardActions
                            sx={{
                              bgcolor: alpha(palette.text.primary, 0.05),
                              px: 3,
                              py: 0.5,
                            }}
                          >
                            {footerContent}
                          </CardActions>
                        ) : null}
                      </Card>
                    </Box>
                  </ClickAwayListener>
                </Box>
              </Grow>
            );
          }}
        </Popper>
      </>
    ),
    icon,
    type: 'button',
    onClick: () => {
      setOpen(true);
    },
  };
  return tool;
};
