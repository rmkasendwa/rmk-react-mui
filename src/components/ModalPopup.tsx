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
  IconButton,
  Modal,
  ModalProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { Children, FC, ReactNode, useEffect, useRef, useState } from 'react';

import SearchSyncToolbar from './SearchSyncToolbar';

export interface ModalPopupClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ModalPopupClassKey = keyof ModalPopupClasses;

export function getModalPopupUtilityClass(slot: string): string {
  return generateUtilityClass('MuiModalPopup', slot);
}

export const modalPopupClasses: ModalPopupClasses = generateUtilityClasses(
  'MuiModalPopup',
  ['root']
);

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

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getModalPopupUtilityClass, classes);
};

export interface ModalPopupProps extends Partial<Omit<ModalProps, 'children'>> {
  title: string;
  children?: ReactNode;
  loading?: boolean;
  errorMessage?: string;
  open: boolean;
  actionButtons?: ReactNode | ReactNode[];
  onClose?: () => void;
  CardProps?: Partial<CardProps>;
  CloseActionButtonProps?: Partial<ButtonProps>;
}

export const ModalPopup: FC<ModalPopupProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiModalPopup' });
  const {
    children,
    title,
    open,
    onClose,
    actionButtons,
    CardProps = {},
    loading = false,
    CloseActionButtonProps = {},
    sx,
    ...rest
  } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { palette, components } = useTheme();

  const { sx: cardPropsSx, ...cardPropsRest } = CardProps;
  const {
    children: closeActionButtonPropsChildren,
    sx: closeActionButtonPropsSx,
    ...closeActionButtonPropsRest
  } = CloseActionButtonProps;

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

  return (
    <Modal
      {...rest}
      className={clsx(classes.root)}
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && onClose) {
          onClose();
        }
      }}
      sx={{
        display: 'flex',
        p: 4,
        justifyContent: 'center',
        alignItems: 'center',
        ...(components?.MuiModalPopup?.styleOverrides?.root as any),
        ...sx,
      }}
      disableEscapeKeyDown
      disableAutoFocus
    >
      <Card
        {...cardPropsRest}
        sx={{ maxWidth: 640, width: `100%`, ...cardPropsSx }}
      >
        <SearchSyncToolbar
          title={title}
          hasSearchTool={false}
          hasSyncTool={false}
        >
          {!loading ? (
            <IconButton onClick={onClose} sx={{ p: 0.5 }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </SearchSyncToolbar>
        <Divider />
        <Box sx={{ py: 0, px: 3 }}>
          {children ? (
            <Box
              ref={(detailsContainerElement: HTMLDivElement | null) => {
                setDetailsContainerElement(detailsContainerElement);
              }}
              sx={{
                py: 2,
              }}
            >
              {children}
            </Box>
          ) : null}
        </Box>
        <Divider />
        <Grid
          container
          spacing={2}
          sx={{ py: 2, px: 3, flexDirection: 'row-reverse' }}
        >
          {(() => {
            if (actionButtons) {
              const toolsList = Children.toArray(actionButtons);
              return toolsList.map((tool, index) => {
                return (
                  <Grid item key={index} sx={{ minWidth: 0 }}>
                    {tool}
                  </Grid>
                );
              });
            }
          })()}
          <Grid item>
            <Button
              variant="outlined"
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
        </Grid>
      </Card>
    </Modal>
  );
};

export default ModalPopup;
