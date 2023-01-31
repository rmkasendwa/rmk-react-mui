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
import { forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { INDEX_PAGE_ROUTE_PATH } from '../route-paths';
import HtmlHead from './HtmlHead';

export interface ResourceNotFoundPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ResourceNotFoundPageClassKey = keyof ResourceNotFoundPageClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiResourceNotFoundPage: ResourceNotFoundPageProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiResourceNotFoundPage: keyof ResourceNotFoundPageClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiResourceNotFoundPage?: {
      defaultProps?: ComponentsProps['MuiResourceNotFoundPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiResourceNotFoundPage'];
      variants?: ComponentsVariants['MuiResourceNotFoundPage'];
    };
  }
}

export interface ResourceNotFoundPageProps
  extends Pick<BoxProps, 'className' | 'sx'> {
  showDefaultPageLinks?: boolean;
}

export function getResourceNotFoundPageUtilityClass(slot: string): string {
  return generateUtilityClass('MuiResourceNotFoundPage', slot);
}

export const resourceNotFoundPageClasses: ResourceNotFoundPageClasses =
  generateUtilityClasses('MuiResourceNotFoundPage', ['root']);

const slots = {
  root: ['root'],
};

export const ResourceNotFoundPage = forwardRef<
  HTMLDivElement,
  ResourceNotFoundPageProps
>(function ResourceNotFoundPage(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiResourceNotFoundPage',
  });
  const { className, showDefaultPageLinks = true, ...rest } = props;

  const classes = composeClasses(
    slots,
    getResourceNotFoundPageUtilityClass,
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
      <HtmlHead title="Error 404 (Not Found)!!1" />
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
            Sorry, this page is not available
          </Typography>
          <Typography variant="body1">
            The requested URL{' '}
            <Typography
              component="strong"
              variant="inherit"
              sx={{
                color: palette.error.main,
                wordBreak: 'break-all',
              }}
            >
              {window.location.href}
            </Typography>{' '}
            was not found on this server.
          </Typography>
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
            }}
          >
            <Typography
              sx={{
                fontSize: 120,
                fontWeight: 'bold',
                color: palette.error.main,
              }}
            >
              404
            </Typography>
          </Box>
          {showDefaultPageLinks ? (
            <Grid container spacing={3} maxWidth={600}>
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
            </Grid>
          ) : null}
        </Container>
      </Box>
    </>
  );
});

export default ResourceNotFoundPage;
