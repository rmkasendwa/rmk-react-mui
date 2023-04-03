import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SkeletonProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  keyframes,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';

export interface LoadingTypographyClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type LoadingTypographyClassKey = keyof LoadingTypographyClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiLoadingTypography: LoadingTypographyProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiLoadingTypography: keyof LoadingTypographyClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiLoadingTypography?: {
      defaultProps?: ComponentsProps['MuiLoadingTypography'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiLoadingTypography'];
      variants?: ComponentsVariants['MuiLoadingTypography'];
    };
  }
}

export const pulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

export const waveAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export interface LoadingTypographyProps
  extends Omit<TypographyProps, 'ref'>,
    Pick<SkeletonProps, 'animation'> {}

export function getLoadingTypographyUtilityClass(slot: string): string {
  return generateUtilityClass('MuiLoadingTypography', slot);
}

export const loadingTypographyClasses: LoadingTypographyClasses =
  generateUtilityClasses('MuiLoadingTypography', ['root']);

const slots = {
  root: ['root'],
};

export const LoadingTypography = forwardRef<
  HTMLElement,
  LoadingTypographyProps
>(function LoadingTypography(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiLoadingTypography' });
  const { className, children, animation = 'pulse', sx, ...rest } = props;

  const classes = composeClasses(
    slots,
    getLoadingTypographyUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { palette } = useTheme();
  const { loading, errorMessage } = useLoadingContext();

  const typographyElement = (
    <Typography
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        ...sx,
        ...(() => {
          if (loading || errorMessage) {
            return {
              borderRadius: '4px',
              '&,*': {
                color: 'transparent !important',
              },
              ...(() => {
                switch (animation) {
                  case 'pulse':
                    return {
                      display: 'inline',
                      bgcolor: alpha(palette.text.disabled, 0.05),
                      ...(() => {
                        if (loading) {
                          return {
                            animation: `1.5s ease-in-out 0.5s infinite normal none running ${pulseAnimation}`,
                          };
                        }
                      })(),
                    };
                  case 'wave':
                    return {
                      position: 'relative',
                      overflow: 'hidden',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        transform: 'translateX(-100%)',
                        inset: 0,
                        background: `linear-gradient(90deg, transparent, ${alpha(
                          palette.text.disabled,
                          0.08
                        )}, transparent)`,
                        ...(() => {
                          if (loading) {
                            return {
                              animation: `1.6s linear 0.5s infinite normal none running ${waveAnimation}`,
                            };
                          }
                        })(),
                      },
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    };
                }
              })(),
            };
          }
        })(),
      }}
    >
      {(() => {
        if (loading || errorMessage) {
          return (
            <Typography
              component="span"
              variant="inherit"
              sx={{
                fontSize: '0.75em',
                lineHeight: 2.5,
              }}
            >
              {children}
            </Typography>
          );
        }
        return children;
      })()}
    </Typography>
  );

  if (loading || errorMessage) {
    return <Box>{typographyElement}</Box>;
  }

  return typographyElement;
});

export default LoadingTypography;
