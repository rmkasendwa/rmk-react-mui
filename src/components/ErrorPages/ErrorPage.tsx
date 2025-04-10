import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Container,
  Grid2,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { Children, ReactNode, forwardRef } from 'react';

export interface ErrorPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ErrorPageClassKey = keyof ErrorPageClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiErrorPage: ErrorPageProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiErrorPage: keyof ErrorPageClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiErrorPage?: {
      defaultProps?: ComponentsProps['MuiErrorPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiErrorPage'];
      variants?: ComponentsVariants['MuiErrorPage'];
    };
  }
}
//#endregion

export const getErrorPageUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiErrorPage', slot);
};

const slots: Record<ErrorPageClassKey, [ErrorPageClassKey]> = {
  root: ['root'],
};

export const errorPageClasses: ErrorPageClasses = generateUtilityClasses(
  'MuiErrorPage',
  Object.keys(slots) as ErrorPageClassKey[]
);

export interface ErrorPageProps extends Pick<BoxProps, 'className' | 'sx'> {
  showDefaultPageLinks?: boolean;
  title: string;
  heading: ReactNode;
  description?: ReactNode;
  errorCode?: ReactNode;
  tools?: ReactNode | ReactNode[];
  showGoBackButton?: boolean;
  showGoHomeButton?: boolean;
  slotProps?: {
    goBackButton?: Partial<ButtonProps>;
    goHomeButton?: Partial<ButtonProps>;
  };
}

export const ErrorPage = forwardRef<HTMLDivElement, ErrorPageProps>(
  function ErrorPage(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiErrorPage',
    });
    const {
      className,
      showDefaultPageLinks = true,
      heading,
      description,
      errorCode,
      tools,
      showGoBackButton = true,
      showGoHomeButton = true,
      slotProps,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getErrorPageUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();

    return (
      <>
        <Box
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          sx={{
            position: 'absolute',
            width: '100%',
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              py: 5,
              px: 3,
            }}
          >
            <Typography variant="h2" mb={2}>
              {heading}
            </Typography>
            {description ? (
              <Typography variant="body1">{description}</Typography>
            ) : null}
            <Typography
              variant="body2"
              sx={{
                color: alpha(palette.text.primary, 0.75),
              }}
            >
              That&rsquo;s all we know.
            </Typography>
            <Box
              sx={{
                my: 3,
                color: palette.error.main,
              }}
            >
              {(() => {
                if (errorCode) {
                  if (['string', 'number'].includes(typeof errorCode)) {
                    return (
                      <Typography
                        sx={{
                          fontSize: 120,
                          fontWeight: 500,
                        }}
                      >
                        {errorCode}
                      </Typography>
                    );
                  }
                  return errorCode;
                }
              })()}
            </Box>
            {showDefaultPageLinks ? (
              <Grid2
                container
                spacing={3}
                sx={{
                  maxWidth: 600,
                  justifyContent: 'center',
                }}
              >
                {(() => {
                  if (tools) {
                    return Children.toArray(tools).map((tool, index) => {
                      return (
                        <Grid2 key={index} sx={{ minWidth: 0 }}>
                          {tool}
                        </Grid2>
                      );
                    });
                  }
                  return (
                    <>
                      {showGoBackButton ? (
                        <Grid2
                          size={{
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <Button
                            color="primary"
                            fullWidth
                            size="large"
                            {...slotProps?.goBackButton}
                          >
                            <Typography variant="body2" noWrap>
                              Go back to the previous page
                            </Typography>
                          </Button>
                        </Grid2>
                      ) : null}
                      {showGoHomeButton ? (
                        <Grid2
                          size={{
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <Button
                            color="inherit"
                            fullWidth
                            size="large"
                            {...slotProps?.goHomeButton}
                          >
                            <Typography variant="body2" noWrap>
                              Go to home page
                            </Typography>
                          </Button>
                        </Grid2>
                      ) : null}
                    </>
                  );
                })()}
              </Grid2>
            ) : null}
          </Container>
        </Box>
      </>
    );
  }
);

export default ErrorPage;
