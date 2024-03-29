import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  GridProps,
  Modal,
  ModalProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { omit } from 'lodash';
import { ReactElement, ReactNode, forwardRef, useEffect, useRef } from 'react';

import ErrorAlert from './ErrorAlert';
import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface ModalPopupClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ModalPopupClassKey = keyof ModalPopupClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiModalPopup: ModalPopupProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiModalPopup: keyof ModalPopupClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiModalPopup?: {
      defaultProps?: ComponentsProps['MuiModalPopup'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiModalPopup'];
      variants?: ComponentsVariants['MuiModalPopup'];
    };
  }
}
//#endregion

export const getModalPopupUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiModalPopup', slot);
};

const slots: Record<ModalPopupClassKey, [ModalPopupClassKey]> = {
  root: ['root'],
};

export const modalPopupClasses: ModalPopupClasses = generateUtilityClasses(
  'MuiModalPopup',
  Object.keys(slots) as ModalPopupClassKey[]
);

export interface ModalPopupProps
  extends Partial<Omit<ModalProps, 'children' | 'title'>> {
  title?: ReactNode;
  headerElement?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  errorMessage?: string;
  open: boolean;
  actionButtons?: ReactNode[];
  actionAreaTools?: ReactNode[];
  onClose?: () => void;
  SearchSyncToolbarProps?: Partial<SearchSyncToolbarProps>;
  CardProps?: Partial<CardProps>;
  CardBodyProps?: Partial<BoxProps>;
  CloseActionButtonProps?: Partial<ButtonProps>;
  ActionButtonProps?: Partial<ButtonProps>;
  ActionButtonAreaProps?: Partial<GridProps>;
  showCloseIconButton?: boolean;
  showCloseActionButton?: boolean;
  showActionsToolbar?: boolean;
  showHeaderToolbar?: boolean;
  enableCloseOnBackdropClick?: boolean;
  modalElement?: ReactElement;
  getModalElement?: (modalElement: ReactElement) => ReactElement;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  popupStatsElement?: ReactNode;
}

export const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
  function ModalPopup(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiModalPopup' });
    const {
      children,
      title,
      open,
      onClose,
      actionButtons,
      actionAreaTools,
      SearchSyncToolbarProps = {},
      CardProps = {},
      CardBodyProps = {},
      loading = false,
      CloseActionButtonProps = {},
      ActionButtonAreaProps = {},
      sx,
      className,
      showHeaderToolbar = true,
      showCloseIconButton = true,
      showCloseActionButton = true,
      showActionsToolbar = true,
      enableCloseOnBackdropClick = false,
      getModalElement,
      placement = 'center',
      headerElement,
      popupStatsElement,
      errorMessage,
      ...rest
    } = omit(props, 'modalElement');

    let { modalElement } = props;

    const classes = composeClasses(
      slots,
      getModalPopupUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette, breakpoints, components } = useTheme();
    const isSmallScreen = useMediaQuery(breakpoints.down('sm'));

    const { sx: SearchSyncToolbarPropsSx, ...SearchSyncToolbarPropsRest } =
      SearchSyncToolbarProps;
    const { sx: CardPropsSx, ...CardPropsRest } = CardProps;
    const { sx: ActionButtonAreaPropsSx, ...ActionButtonAreaPropsRest } =
      ActionButtonAreaProps;
    const {
      children: closeActionButtonPropsChildren,
      sx: closeActionButtonPropsSx,
      ...closeActionButtonPropsRest
    } = CloseActionButtonProps;
    const { sx: CardBodyPropsSx, ...CardBodyPropsRest } = CardBodyProps;

    const { CardProps: placementCardProps = {}, sx: placementSx } = (() => {
      const props: Partial<ModalPopupProps> = {};
      switch (placement) {
        case 'right':
        case 'left':
          props.CardProps = {
            sx: {
              maxWidth: 600,
              borderRadius: 0,
              height: '100%',
              maxHeight: 'auto',
            },
          };
          props.sx = {
            alignItems: 'start',
            ...(() => {
              switch (placement) {
                case 'left':
                  return {
                    justifyContent: 'start',
                  };
                case 'right':
                  return {
                    justifyContent: 'end',
                  };
              }
            })(),
            p: 0,
          };
          break;
      }
      return props;
    })();

    const { sx: placementCardPropsSx, ...placementCardPropsRest } =
      placementCardProps;

    // Refs
    const onCloseRef = useRef(onClose);
    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    modalElement ||
      (modalElement = (
        <Card
          {...(placementCardPropsRest as any)}
          {...CardPropsRest}
          sx={{
            maxWidth: 640,
            width: `100%`,
            maxHeight: `80%`,
            display: 'flex',
            flexDirection: 'column',
            ...placementCardPropsSx,
            ...CardPropsSx,
          }}
        >
          {(() => {
            if (showHeaderToolbar || headerElement) {
              return (
                <>
                  {(() => {
                    if (headerElement) {
                      return headerElement;
                    }
                    if (showHeaderToolbar) {
                      return (
                        <SearchSyncToolbar
                          hasSearchTool={false}
                          hasSyncTool={false}
                          {...SearchSyncToolbarPropsRest}
                          {...{ title }}
                          {...(() => {
                            if (showCloseIconButton && !loading) {
                              return {
                                postSyncButtonTools: [
                                  {
                                    type: 'icon-button',
                                    icon: <CloseIcon />,
                                    onClick: onClose,
                                  },
                                ] as NonNullable<
                                  typeof SearchSyncToolbarPropsRest.postSyncButtonTools
                                >,
                              };
                            }
                          })()}
                          sx={SearchSyncToolbarPropsSx}
                        />
                      );
                    }
                  })()}
                  <Divider />
                </>
              );
            }
          })()}
          <Box
            {...CardBodyPropsRest}
            sx={{
              py: 2,
              px: 3,
              overflowY: 'auto',
              flex: 1,
              ...CardBodyPropsSx,
            }}
          >
            {children}
            {errorMessage ? (
              <Box sx={{ position: 'sticky', bottom: 0 }}>
                <ErrorAlert message={errorMessage} />
              </Box>
            ) : null}
          </Box>
          {showActionsToolbar ? (
            <>
              <Divider />
              <Grid
                container
                spacing={2}
                {...ActionButtonAreaPropsRest}
                sx={{
                  py: 2,
                  px: 3,
                  ...(() => {
                    if (isSmallScreen) {
                      return {
                        py: 1,
                        px: 2,
                      };
                    }
                  })(),
                  alignItems: 'center',
                  flexDirection: 'row-reverse',
                  ...ActionButtonAreaPropsSx,
                }}
              >
                {(() => {
                  if (actionButtons) {
                    return actionButtons.map((tool, index) => {
                      return (
                        <Grid item key={index} sx={{ minWidth: 0 }}>
                          {tool}
                        </Grid>
                      );
                    });
                  }
                })()}
                {(() => {
                  if (showCloseActionButton) {
                    return (
                      <Grid item>
                        <Button
                          variant="text"
                          color="inherit"
                          {...closeActionButtonPropsRest}
                          onClick={onClose}
                          sx={{
                            color: alpha(palette.text.primary, 0.5),
                            ...closeActionButtonPropsSx,
                          }}
                        >
                          {closeActionButtonPropsChildren ?? 'Close'}
                        </Button>
                      </Grid>
                    );
                  }
                })()}
                <Grid item xs />
                {(() => {
                  if (actionAreaTools) {
                    return actionAreaTools.map((tool, index) => {
                      return (
                        <Grid item key={index} sx={{ minWidth: 0 }}>
                          {tool}
                        </Grid>
                      );
                    });
                  }
                })()}
                {(() => {
                  if (popupStatsElement) {
                    return <Grid item>{popupStatsElement}</Grid>;
                  }
                })()}
              </Grid>
            </>
          ) : null}
        </Card>
      ));

    return (
      <Modal
        disableEscapeKeyDown
        disableAutoFocus
        {...omit(rest, 'modalElement')}
        ref={ref}
        className={clsx(classes.root)}
        open={open}
        onClose={(_, reason) => {
          if (
            onClose &&
            (enableCloseOnBackdropClick || reason !== 'backdropClick')
          ) {
            onClose();
          }
        }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          ...(() => {
            if (isSmallScreen) {
              return {
                p: 2,
              };
            }
          })(),
          zIndex: 9999,
          ...(components?.MuiModalPopup?.styleOverrides?.root as any),
          ...placementSx,
          ...sx,
        }}
      >
        {(() => {
          if (getModalElement) {
            return getModalElement(modalElement);
          }
          return modalElement;
        })()}
      </Modal>
    );
  }
);

export default ModalPopup;
