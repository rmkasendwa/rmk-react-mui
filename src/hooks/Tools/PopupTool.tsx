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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useRef, useState } from 'react';

import ModalPopup from '../../components/ModalPopup';
import { ButtonTool } from '../../components/SearchSyncToolbar';

export interface PopupToolOptions extends Partial<ButtonTool> {
  bodyContent: ReactNode;
  label: ReactNode;
  popupCardTitle?: ReactNode;
  BodyContentProps?: Partial<CardContentProps>;
  footerContent?: ReactNode;
  icon?: ReactNode;
  wrapBodyContentInCard?: boolean;
}

export const usePopupTool = ({
  popupCardTitle,
  bodyContent,
  BodyContentProps = {},
  footerContent,
  wrapBodyContentInCard = true,
  ...rest
}: PopupToolOptions): ButtonTool & {
  extraToolProps: {
    closePopup: () => void;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
} => {
  const { sx: BodyContentPropsSx, ...BodyContentPropsRest } = BodyContentProps;
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [open, setOpen] = useState(false);

  const bodyContentElement = (() => {
    if (wrapBodyContentInCard) {
      return (
        <Card
          variant="outlined"
          sx={{
            ...(() => {
              if (isSmallScreenSize) {
                return {
                  border: 'none',
                };
              }
            })(),
          }}
        >
          {(() => {
            if (popupCardTitle) {
              return (
                <>
                  {popupCardTitle}
                  <Divider />
                </>
              );
            }
          })()}
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
      );
    }
    return bodyContent;
  })();

  return {
    color: 'inherit',
    ...rest,
    ref: anchorRef,
    type: 'button',
    onClick: () => {
      setOpen(true);
    },
    popupElement: (() => {
      if (isSmallScreenSize) {
        return (
          <ModalPopup
            {...{ open }}
            onClose={() => {
              setOpen(false);
            }}
            CardProps={{
              sx: {
                maxHeight: 'none',
              },
            }}
            CardBodyProps={{
              sx: {
                p: 0,
              },
            }}
            disableEscapeKeyDown={false}
            disableAutoFocus={false}
            showHeaderToolbar={false}
            enableCloseOnBackdropClick
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {bodyContentElement}
          </ModalPopup>
        );
      }
      return (
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          transition
          placement="bottom-start"
          sx={{
            zIndex: 9999,
          }}
        >
          {({ TransitionProps }) => {
            return (
              <Grow {...TransitionProps}>
                <Box>
                  <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <Box>{bodyContentElement}</Box>
                  </ClickAwayListener>
                </Box>
              </Grow>
            );
          }}
        </Popper>
      );
    })(),
    extraToolProps: {
      closePopup: () => {
        setOpen(false);
      },
    },
    open,
    setOpen,
  };
};
