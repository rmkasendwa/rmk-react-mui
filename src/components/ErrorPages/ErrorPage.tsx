import {
  Box,
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Container,
  Grid,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { Children, ReactNode, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { INDEX_PAGE_ROUTE_PATH } from '../../route-paths';
import HtmlHead from '../HtmlHead';

export interface ErrorPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ErrorPageClassKey = keyof ErrorPageClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiErrorPage: ErrorPageProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiErrorPage: keyof ErrorPageClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiErrorPage?: {
      defaultProps?: ComponentsProps['MuiErrorPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiErrorPage'];
      variants?: ComponentsVariants['MuiErrorPage'];
    };
  }
}

export interface ErrorPageProps extends Pick<BoxProps, 'className' | 'sx'> {
  showDefaultPageLinks?: boolean;
  title: string;
  heading: ReactNode;
  description?: ReactNode;
  errorCode?: ReactNode;
  tools?: ReactNode | ReactNode[];
}

export function getErrorPageUtilityClass(slot: string): string {
  return generateUtilityClass('MuiErrorPage', slot);
}

export const resourceNotFoundPageClasses: ErrorPageClasses =
  generateUtilityClasses('MuiErrorPage', ['root']);

const slots = {
  root: ['root'],
};

export const ErrorPage = forwardRef<HTMLDivElement, ErrorPageProps>(
  function ErrorPage(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiErrorPage',
    });
    const {
      className,
      showDefaultPageLinks = true,
      title,
      heading,
      description,
      errorCode,
      tools,
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
    const navigate = useNavigate();
    const { authenticated } = useAuth();

    return (
      <>
        <HtmlHead {...{ title }} />
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
                          fontWeight: 'bold',
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
              <Grid
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
                        <Grid item key={index} sx={{ minWidth: 0 }}>
                          {tool}
                        </Grid>
                      );
                    });
                  }
                  return (
                    <>
                      <Grid item sm={6} xs={12}>
                        <Button
                          onClick={() => navigate(-1)}
                          color="primary"
                          fullWidth
                          size="large"
                        >
                          <Typography variant="body2" noWrap>
                            Go back to the previous page
                          </Typography>
                        </Button>
                      </Grid>
                      {authenticated ? (
                        <Grid item sm={6} xs={12}>
                          <Button
                            component={Link}
                            to={INDEX_PAGE_ROUTE_PATH}
                            color="inherit"
                            fullWidth
                            size="large"
                          >
                            <Typography variant="body2" noWrap>
                              Go to home page
                            </Typography>
                          </Button>
                        </Grid>
                      ) : null}
                    </>
                  );
                })()}
              </Grid>
            ) : null}
          </Container>
        </Box>
      </>
    );
  }
);

export default ErrorPage;
