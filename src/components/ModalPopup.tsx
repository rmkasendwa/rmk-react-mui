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
  Modal,
  ModalProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  Children,
  ReactElement,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface ModalPopupClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ModalPopupClassKey = keyof ModalPopupClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiModalPopup: ModalPopupProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiModalPopup: keyof ModalPopupClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiModalPopup?: {
      defaultProps?: ComponentsProps['MuiModalPopup'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiModalPopup'];
      variants?: ComponentsVariants['MuiModalPopup'];
    };
  }
}

export interface ModalPopupProps
  extends Partial<Omit<ModalProps, 'children' | 'title'>> {
  title?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  errorMessage?: string;
  open: boolean;
  actionButtons?: ReactNode | ReactNode[];
  onClose?: () => void;
  SearchSyncToolbarProps?: Partial<SearchSyncToolbarProps>;
  CardProps?: Partial<CardProps>;
  CardBodyProps?: Partial<BoxProps>;
  CloseActionButtonProps?: Partial<ButtonProps>;
  showCloseIconButton?: boolean;
  showCloseActionButton?: boolean;
  showActionsToolbar?: boolean;
  showHeaderToolbar?: boolean;
  enableCloseOnBackdropClick?: boolean;
  modalElement?: ReactElement;
  getModalElement?: (modalElement: ReactElement) => ReactElement;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

export function getModalPopupUtilityClass(slot: string): string {
  return generateUtilityClass('MuiModalPopup', slot);
}

export const modalPopupClasses: ModalPopupClasses = generateUtilityClasses(
  'MuiModalPopup',
  ['root']
);

const slots = {
  root: ['root'],
};

export const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
  function ModalPopup(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiModalPopup' });
    const {
      children,
      title,
      open,
      onClose,
      actionButtons,
      SearchSyncToolbarProps = {},
      CardProps = {},
      CardBodyProps = {},
      loading = false,
      CloseActionButtonProps = {},
      sx,
      className,
      showHeaderToolbar = true,
      showCloseIconButton = true,
      showCloseActionButton = true,
      showActionsToolbar = true,
      enableCloseOnBackdropClick = false,
      getModalElement,
      placement = 'center',
      ...rest
    } = props;

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

    const { palette, components } = useTheme();

    const { sx: SearchSyncToolbarPropsSx, ...SearchSyncToolbarPropsRest } =
      SearchSyncToolbarProps;
    const { sx: CardPropsSx, ...CardPropsRest } = CardProps;
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

    const [detailsContainerElement, setDetailsContainerElement] =
      useState<HTMLDivElement | null>(null);
    const [, setDetailsContainerHeight] = useState(0);

    useEffect(() => {
      if (detailsContainerElement) {
        const windowResizeEventCallback = () => {
          setDetailsContainerHeight(detailsContainerElement.offsetHeight);
        };
        window.addEventListener('resize', windowResizeEventCallback);
        setDetailsContainerHeight(detailsContainerElement.offsetHeight);
        return () => {
          window.removeEventListener('resize', windowResizeEventCallback);
        };
      }
    }, [detailsContainerElement]);

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
          {showHeaderToolbar ? (
            <>
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
              <Divider />
            </>
          ) : null}
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
            {children ? (
              <Box
                ref={(detailsContainerElement: HTMLDivElement | null) => {
                  setDetailsContainerElement(detailsContainerElement);
                }}
              >
                {children}
              </Box>
            ) : null}
          </Box>
          {showActionsToolbar ? (
            <>
              <Divider />
              <Grid
                container
                spacing={2}
                sx={{ py: 2, px: 3, flexDirection: 'row-reverse' }}
              >
                {(() => {
                  if (actionButtons) {
                    return Children.toArray(actionButtons).map(
                      (tool, index) => {
                        return (
                          <Grid item key={index} sx={{ minWidth: 0 }}>
                            {tool}
                          </Grid>
                        );
                      }
                    );
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
          p: 4,
          justifyContent: 'center',
          alignItems: 'center',
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
