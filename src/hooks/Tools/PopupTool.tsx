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
import {
  FC,
  MutableRefObject,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

import ModalPopup from '../../components/ModalPopup';
import { ButtonTool } from '../../components/SearchSyncToolbar';

//#region Popup Tool Popover
export interface PopupToolPopoverProps {
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>;
  wrapBodyContentInCard?: boolean;
  popupCardTitle?: ReactNode;
  BodyContentProps?: Partial<CardContentProps>;
  bodyContent: ReactNode;
  footerContent?: ReactNode;
  togglePopupFunctionRef: MutableRefObject<
    ((open: boolean) => void) | undefined
  >;
}

export const PopupToolPopover: FC<PopupToolPopoverProps> = ({
  anchorRef,
  wrapBodyContentInCard,
  popupCardTitle,
  BodyContentProps = {},
  bodyContent,
  footerContent,
  togglePopupFunctionRef,
}) => {
  const { sx: BodyContentPropsSx, ...BodyContentPropsRest } = BodyContentProps;
  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  togglePopupFunctionRef.current = (open) => {
    setOpen(open);
  };

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
};
//#endregion

//#region Popup Tool
export interface PopupToolProps
  extends Partial<ButtonTool>,
    Pick<
      PopupToolPopoverProps,
      | 'wrapBodyContentInCard'
      | 'popupCardTitle'
      | 'BodyContentProps'
      | 'bodyContent'
      | 'footerContent'
    > {
  label: ReactNode;
  icon?: ReactNode;
  onTogglePopup?: (open: boolean) => void;
}

export const usePopupTool = ({
  popupCardTitle,
  bodyContent,
  BodyContentProps = {},
  footerContent,
  wrapBodyContentInCard = true,
  onTogglePopup,
  ...rest
}: PopupToolProps): ButtonTool & {
  extraToolProps: {
    closePopup: () => void;
  };
  setOpen: (open: boolean) => void;
} => {
  //#region Refs
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const togglePopupFunctionRef = useRef<(open: boolean) => void>();
  const togglePopupRef = useRef(onTogglePopup);
  togglePopupRef.current = onTogglePopup;
  //#endregion

  const setOpen = useCallback((open: boolean) => {
    togglePopupFunctionRef.current?.(open);
    togglePopupRef.current?.(open);
  }, []);

  return {
    color: 'inherit',
    ...rest,
    ref: anchorRef,
    type: 'button',
    onClick: () => {
      togglePopupFunctionRef.current?.(true);
      togglePopupRef.current?.(true);
    },
    popupElement: (
      <PopupToolPopover
        {...{
          anchorRef,
          wrapBodyContentInCard,
          popupCardTitle,
          BodyContentProps,
          bodyContent,
          footerContent,
          togglePopupFunctionRef,
        }}
      />
    ),
    extraToolProps: {
      closePopup: () => {
        togglePopupFunctionRef.current?.(false);
        togglePopupRef.current?.(false);
      },
    },
    setOpen,
  };
};
//#endregion
