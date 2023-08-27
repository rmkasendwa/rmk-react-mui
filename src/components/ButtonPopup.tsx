import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardActions,
  CardContent,
  CardContentProps,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grow,
  Popper,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

export interface ButtonPopupClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ButtonPopupClassKey = keyof ButtonPopupClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiButtonPopup: ButtonPopupProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiButtonPopup: keyof ButtonPopupClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiButtonPopup?: {
      defaultProps?: ComponentsProps['MuiButtonPopup'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiButtonPopup'];
      variants?: ComponentsVariants['MuiButtonPopup'];
    };
  }
}
//#endregion

export const getButtonPopupUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiButtonPopup', slot);
};

const slots: Record<ButtonPopupClassKey, [ButtonPopupClassKey]> = {
  root: ['root'],
};

export const buttonPopupClasses: ButtonPopupClasses = generateUtilityClasses(
  'MuiButtonPopup',
  Object.keys(slots) as ButtonPopupClassKey[]
);

export interface ButtonPopupProps extends Partial<Omit<ButtonProps, 'title'>> {
  title: ReactNode;
  bodyContent: ReactNode;
  BodyContentProps?: Partial<CardContentProps>;
  footerContent?: ReactNode;
  iconButton?: ReactNode;
}

export const ButtonPopup = forwardRef<HTMLDivElement, ButtonPopupProps>(
  function ButtonPopup(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiButtonPopup' });
    const {
      className,
      children,
      startIcon,
      title,
      bodyContent,
      BodyContentProps = {},
      footerContent,
      iconButton,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getButtonPopupUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: BodyContentPropsSx, ...BodyContentPropsRest } =
      BodyContentProps;
    const anchorRef = useRef<HTMLDivElement>();

    const { palette, breakpoints } = useTheme();
    const largeScreenSize = useMediaQuery(breakpoints.up(1200));
    const [open, setOpen] = useState(false);

    return (
      <>
        <Box
          ref={mergeRefs([anchorRef, ref])}
          className={clsx(classes.root)}
          onClick={(() => {
            if (iconButton) {
              return () => setOpen(true);
            }
          })()}
        >
          {(() => {
            if (iconButton) {
              return iconButton;
            }
            if (largeScreenSize) {
              return (
                <Button
                  color="inherit"
                  {...{ startIcon }}
                  {...rest}
                  onClick={() => setOpen(true)}
                >
                  {children}
                </Button>
              );
            }
            return (
              <Button
                color="inherit"
                {...rest}
                onClick={() => setOpen(true)}
                sx={{
                  minWidth: 'auto',
                  px: 0.5,
                  '&>svg': {
                    fontSize: 16,
                  },
                }}
              >
                {startIcon}
              </Button>
            );
          })()}
        </Box>
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
                        {title}
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
    );
  }
);

export default ButtonPopup;
