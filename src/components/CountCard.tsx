import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Link,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { omit } from 'lodash';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { Link as RouterLink } from 'react-router-dom';

import {
  CacheableDataFinderOptions,
  useCacheableData,
} from '../hooks/DataFetching';
import Card, { CardProps } from './Card';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';

export interface CountCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CountCardClassKey = keyof CountCardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCountCard: CountCardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCountCard: keyof CountCardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCountCard?: {
      defaultProps?: ComponentsProps['MuiCountCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCountCard'];
      variants?: ComponentsVariants['MuiCountCard'];
    };
  }
}

export interface CountCardProps extends Partial<CardProps> {
  countFinder: (options: CacheableDataFinderOptions) => Promise<number>;
  labelPlural?: string;
  labelSingular?: string;
  CountProps?: Partial<LoadingTypographyProps>;
  LabelProps?: Partial<LoadingTypographyProps>;
  pathToViewCountedRecords?: string;
}

export function getCountCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCountCard', slot);
}

export const countCardClasses: CountCardClasses = generateUtilityClasses(
  'MuiCountCard',
  ['root']
);

const slots = {
  root: ['root'],
};

export const CountCard = forwardRef<HTMLDivElement, CountCardProps>(
  function CountCard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCountCard' });
    const {
      countFinder,
      title,
      className,
      CardBodyProps = {},
      CountProps = {},
      LabelProps = {},
      pathToViewCountedRecords,
      sx,
      ...rest
    } = omit(props, 'labelPlural', 'labelSingular');

    let { labelPlural, labelSingular } = props;

    const classes = composeClasses(
      slots,
      getCountCardUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: CardBodyPropsSx, ...CardBodyPropsRest } = CardBodyProps;
    const { sx: CountPropsSx, ...CountPropsRest } = CountProps;
    const { sx: LabelPropsSx, ...LabelPropsRest } = LabelProps;

    const { palette } = useTheme();

    //#region Card size detection
    const cardElementRef = useRef<HTMLDivElement | null>(null);
    const [cardElementDimension, setCardElementDimension] = useState(0);
    const isSmallScreen = cardElementDimension <= 350;
    useEffect(() => {
      if (cardElementRef.current) {
        const cardElement = cardElementRef.current;
        const windowResizeCallback = () => {
          const { offsetHeight, offsetWidth } = cardElement;
          setCardElementDimension(Math.min(offsetHeight, offsetWidth));
        };
        window.addEventListener('resize', windowResizeCallback);
        windowResizeCallback();
        return () => {
          window.removeEventListener('resize', windowResizeCallback);
        };
      } else {
        setCardElementDimension(0);
      }
    }, []);
    //#endregion

    if (!labelPlural) {
      if (typeof title === 'string') {
        labelPlural = title;
      } else {
        labelPlural = 'Records';
      }
    }
    if (!labelSingular && labelPlural) {
      labelSingular = labelPlural.replace(/s$/, '');
    }

    const {
      data: count,
      load,
      loading,
      errorMessage,
    } = useCacheableData(countFinder);

    return (
      <Card
        ref={mergeRefs([cardElementRef, ref])}
        {...rest}
        {...{ title, load, loading, errorMessage }}
        className={clsx(classes.root)}
        sx={{
          ...sx,
          display: 'flex',
          flexDirection: 'column',
        }}
        CardBodyProps={{
          ...CardBodyPropsRest,
          sx: {
            ...CardBodyPropsSx,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          },
        }}
      >
        {(() => {
          const sx: typeof CountPropsSx = {
            ...CountPropsSx,
            fontWeight: 400,
            lineHeight: 1,
            width: '100%',
            ...(() => {
              if (isSmallScreen && cardElementDimension > 0) {
                return {
                  fontSize: Math.floor(cardElementDimension / 2.5),
                };
              }
              return {
                fontSize: 144,
              };
            })(),
          };
          const children = count != null ? addThousandCommas(count) : '--';
          if (pathToViewCountedRecords) {
            return (
              <Link
                color="primary"
                {...CountPropsRest}
                component={RouterLink}
                to={pathToViewCountedRecords}
                underline="none"
                noWrap
                align="center"
                sx={{
                  ...sx,
                  display: 'block',
                }}
              >
                {children}
              </Link>
            );
          }
          return (
            <LoadingTypography
              color="primary"
              {...CountPropsRest}
              noWrap
              align="center"
              {...{ sx }}
            >
              {children}
            </LoadingTypography>
          );
        })()}
        <LoadingTypography
          {...LabelPropsRest}
          noWrap
          align="center"
          sx={{
            color: alpha(palette.text.secondary, 0.38),
            width: '100%',
            ...LabelPropsSx,
            ...(() => {
              if (isSmallScreen && cardElementDimension > 0) {
                return {
                  fontSize: Math.floor(cardElementDimension / 8.75),
                };
              }
              return {
                fontSize: 40,
              };
            })(),
          }}
        >
          {(() => {
            if (count === 1) {
              return labelSingular;
            }
            return labelPlural;
          })()}
        </LoadingTypography>
      </Card>
    );
  }
);

export default CountCard;
