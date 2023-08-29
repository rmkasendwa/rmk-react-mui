import {
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
import { forwardRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { useLoadingContext } from '../contexts/LoadingContext';
import Tooltip from './Tooltip';

export interface LoadingTypographyClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type LoadingTypographyClassKey = keyof LoadingTypographyClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiLoadingTypography: LoadingTypographyProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiLoadingTypography: keyof LoadingTypographyClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiLoadingTypography?: {
      defaultProps?: ComponentsProps['MuiLoadingTypography'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiLoadingTypography'];
      variants?: ComponentsVariants['MuiLoadingTypography'];
    };
  }
}
//#endregion

export const getLoadingTypographyUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiLoadingTypography', slot);
};

const slots: Record<LoadingTypographyClassKey, [LoadingTypographyClassKey]> = {
  root: ['root'],
};

export const loadingTypographyClasses: LoadingTypographyClasses =
  generateUtilityClasses(
    'MuiLoadingTypography',
    Object.keys(slots) as LoadingTypographyClassKey[]
  );

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
    Pick<SkeletonProps, 'animation'> {
  /**
   * Whether to enable the loading state. If `true`, the loading state will be enabled.
   *
   * @default true
   */
  enableLoadingState?: boolean;

  /**
   * The html component tag used for the root node.
   */
  component?: string;

  /**
   * Whether to show the tooltip when the text overflows.
   *
   * @default true
   */
  showTooltipOnOverflow?: boolean;
}

/**
 * A wrapper for the `Typography` component that adds a loading state.
 * It can be used to display a skeleton preview of the text while the text is loading.
 * It can also be used to display an error message when the text fails to load.
 * It can also be used to display a tooltip when the text overflows.
 */
export const LoadingTypography = forwardRef<
  HTMLElement,
  LoadingTypographyProps
>(function LoadingTypography(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiLoadingTypography' });
  const {
    className,
    children,
    animation = 'pulse',
    enableLoadingState = true,
    showTooltipOnOverflow = true,
    sx,
    ...rest
  } = props;

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
  const [hasTextOverflow, setHasTextOverflow] = useState(false);

  const typographyElement = (
    <Typography
      ref={mergeRefs([
        ref,
        (el) => {
          if (hasTextOverflow && el && rest.noWrap) {
            setHasTextOverflow(
              el.offsetWidth < el.scrollWidth ||
                el.offsetHeight < el.scrollHeight
            );
          }
        },
      ])}
      component="div"
      {...rest}
      className={clsx(classes.root)}
      sx={{
        ...sx,
        ...(() => {
          if (enableLoadingState && (loading || errorMessage)) {
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
        if (enableLoadingState && (loading || errorMessage)) {
          return (
            <Typography
              {...rest}
              component="span"
              variant="inherit"
              sx={{
                fontSize: '0.75em',
                ...sx,
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

  if (showTooltipOnOverflow && hasTextOverflow) {
    return (
      <Tooltip
        title={children}
        PopperProps={{
          sx: {
            'a,a:hover': {
              textDecoration: 'none',
              color: 'inherit !important',
            },
          },
        }}
        disableInteractive
      >
        {typographyElement}
      </Tooltip>
    );
  }

  return typographyElement;
});

export default LoadingTypography;
