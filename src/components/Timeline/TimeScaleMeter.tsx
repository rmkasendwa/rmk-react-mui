import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Stack,
  StackProps,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { omit } from 'lodash';
import { RefObject, forwardRef, useMemo, useState } from 'react';

import { useLoadOnScrollToBottom } from '../../hooks/InfiniteScroller';
import { TimeScaleRow } from './models';

export interface TimeScaleMeterClasses {
  /** Styles applied to the root element. */
  root: string;
  timeScaleLevel1: string;
  timeScaleLevel1Tick: string;
}

export type TimeScaleMeterClassKey = keyof TimeScaleMeterClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeScaleMeter: TimeScaleMeterProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeScaleMeter: keyof TimeScaleMeterClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeScaleMeter?: {
      defaultProps?: ComponentsProps['MuiTimeScaleMeter'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeScaleMeter'];
      variants?: ComponentsVariants['MuiTimeScaleMeter'];
    };
  }
}
//#endregion

export const getTimeScaleMeterUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTimeScaleMeter', slot);
};

const slots: Record<TimeScaleMeterClassKey, [TimeScaleMeterClassKey]> = {
  root: ['root'],
  timeScaleLevel1: ['timeScaleLevel1'],
  timeScaleLevel1Tick: ['timeScaleLevel1Tick'],
};

export const timeScaleMeterClasses: TimeScaleMeterClasses =
  generateUtilityClasses(
    'MuiTimeScaleMeter',
    Object.keys(slots) as TimeScaleMeterClassKey[]
  );

export interface TimeScaleMeterProps extends Partial<StackProps> {
  timeScaleRows: [TimeScaleRow[], TimeScaleRow[], TimeScaleRow[]];
  timeScaleWidth: number;
  scrollingAncenstorElementRef?: RefObject<HTMLElement | null | undefined>;
  leftOffset?: number;
  variant?: 'default' | 'compact';
}

export const TimeScaleMeter = forwardRef<HTMLDivElement, TimeScaleMeterProps>(
  function TimeScaleMeter(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTimeScaleMeter' });
    const {
      className,
      timeScaleRows,
      timeScaleWidth,
      scrollingAncenstorElementRef,
      leftOffset = 0,
      variant = 'default',
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getTimeScaleMeterUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const [
      timeScaleLevel1TickMinTextDisplayWidth,
      setTimeScaleLevel1TickMinTextDisplayWidth,
    ] = useState(50);
    const [
      timeScaleLevel2TickMinTextDisplayWidth,
      setTimeScaleLevel2TickMinTextDisplayWidth,
    ] = useState(40);
    const [
      timeScaleLevel3TickMinTextDisplayWidth,
      setTimeScaleLevel3TickMinTextDisplayWidth,
    ] = useState(40);

    const { palette } = useTheme();

    const [baseTimeScaleLevel1, baseTimeScaleLevel2, baseTimeScaleLevel3] =
      timeScaleRows;

    const {
      timeScaleLevel1,
      timeScaleLevel1TickWidth,
      timeScaleLevel2,
      timeScaleLevel2TickWidth,
      timeScaleLevel3,
      timeScaleLevel3TickWidth,
    } = useMemo(() => {
      const timeScaleLevel1TickWidth =
        timeScaleWidth / baseTimeScaleLevel1.length;
      const timeScaleLevel2TickWidth =
        timeScaleWidth / baseTimeScaleLevel2.length;
      const timeScaleLevel3TickWidth =
        timeScaleWidth / baseTimeScaleLevel3.length;

      const getTimeScaleTicks = (
        baseTimeScaleTicks: TimeScaleRow[],
        tickWidth: number,
        minTickWidth: number
      ) => {
        let lastTickWithLabelIndex = 0;
        return baseTimeScaleTicks.map(
          ({ label, showLabel, ...rest }, index) => {
            const prevLastTickWithLabelIndex = lastTickWithLabelIndex;
            const mergeableTicksIndex = Math.ceil(
              1 / (tickWidth / minTickWidth)
            );
            const shouldShowLabel = showLabel ?? true;
            label && shouldShowLabel && (lastTickWithLabelIndex = index);
            return {
              ...rest,
              showLabel,
              ...(() => {
                if (
                  index % mergeableTicksIndex === 0 ||
                  (index - prevLastTickWithLabelIndex) * tickWidth >=
                    minTickWidth
                ) {
                  return {
                    label,
                  };
                }
              })(),
            } as TimeScaleRow;
          }
        );
      };

      return {
        timeScaleLevel1: getTimeScaleTicks(
          baseTimeScaleLevel1,
          timeScaleLevel1TickWidth,
          timeScaleLevel1TickMinTextDisplayWidth
        ),
        timeScaleLevel1TickWidth,
        timeScaleLevel2: getTimeScaleTicks(
          baseTimeScaleLevel2,
          timeScaleLevel2TickWidth,
          timeScaleLevel2TickMinTextDisplayWidth
        ),
        timeScaleLevel2TickWidth,
        timeScaleLevel3: getTimeScaleTicks(
          baseTimeScaleLevel3,
          timeScaleLevel3TickWidth,
          timeScaleLevel3TickMinTextDisplayWidth
        ),
        timeScaleLevel3TickWidth,
      };
    }, [
      baseTimeScaleLevel1,
      baseTimeScaleLevel2,
      baseTimeScaleLevel3,
      timeScaleLevel1TickMinTextDisplayWidth,
      timeScaleLevel2TickMinTextDisplayWidth,
      timeScaleLevel3TickMinTextDisplayWidth,
      timeScaleWidth,
    ]);

    const [offsets, setOffsets] = useState({
      timeScaleLevel1Offset: 0,
      timeScaleLevel2Offset: 0,
      timeScaleLevel3Offset: 0,
    });

    useLoadOnScrollToBottom({
      elementRef: scrollingAncenstorElementRef,
      onChangeScrollLength({ scrollLeft }) {
        const scrollOffset = Math.max(scrollLeft - leftOffset, 0);
        setOffsets({
          timeScaleLevel1Offset: Math.floor(
            scrollOffset / timeScaleLevel1TickWidth
          ),
          timeScaleLevel2Offset: Math.floor(
            scrollOffset / timeScaleLevel2TickWidth
          ),
          timeScaleLevel3Offset: Math.floor(
            scrollOffset / timeScaleLevel3TickWidth
          ),
        });
      },
      revalidationKey: `${timeScaleLevel1TickWidth}-${timeScaleLevel2TickWidth}-${timeScaleLevel3TickWidth}`,
    });

    const [timeScaleLevel1Limit, timeScaleLevel2Limit, timeScaleLevel3Limit] =
      useMemo(() => {
        const scrollingAncenstorElement = scrollingAncenstorElementRef?.current;
        return [
          timeScaleLevel1TickWidth,
          timeScaleLevel2TickWidth,
          timeScaleLevel3TickWidth,
        ].map((tickWidth) => {
          if (scrollingAncenstorElement?.offsetWidth && tickWidth) {
            return (
              Math.ceil(scrollingAncenstorElement.offsetWidth / tickWidth) + 1
            );
          }
          return 1;
        });
      }, [
        scrollingAncenstorElementRef,
        timeScaleLevel1TickWidth,
        timeScaleLevel2TickWidth,
        timeScaleLevel3TickWidth,
      ]);

    const {
      timeScaleLevel1Offset,
      timeScaleLevel2Offset,
      timeScaleLevel3Offset,
    } = offsets;

    const displayableTimeScaleLevel1 = timeScaleLevel1.slice(
      timeScaleLevel1Offset,
      timeScaleLevel1Offset + timeScaleLevel1Limit
    );
    const displayableTimeScaleLevel2 = timeScaleLevel2.slice(
      timeScaleLevel2Offset,
      timeScaleLevel2Offset + timeScaleLevel2Limit
    );
    const displayableTimeScaleLevel3 = timeScaleLevel3.slice(
      timeScaleLevel3Offset,
      timeScaleLevel3Offset + timeScaleLevel3Limit
    );

    return (
      <Stack
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          width: '100%',
          minHeight: 50,
          justifyContent: 'end',
          ...sx,
        }}
      >
        {(() => {
          switch (variant) {
            case 'default':
              return (
                <Box
                  sx={{
                    display: 'flex',
                    height: 56,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: timeScaleLevel1TickWidth * timeScaleLevel1Offset,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  />
                  {displayableTimeScaleLevel1.map(
                    ({ id, label, sx, ...rest }) => {
                      return (
                        <Box
                          {...omit(rest, 'showLabel')}
                          key={id}
                          className={clsx(classes.timeScaleLevel1)}
                          sx={{
                            ...sx,
                            width: timeScaleLevel1TickWidth,
                            minWidth: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Box
                            className={clsx(classes.timeScaleLevel1Tick)}
                            sx={{
                              position: 'sticky',
                            }}
                          >
                            <Typography
                              ref={(element) => {
                                if (element) {
                                  setTimeScaleLevel1TickMinTextDisplayWidth(
                                    (prevWidth) => {
                                      return Math.max(
                                        prevWidth,
                                        element.offsetWidth + 10
                                      );
                                    }
                                  );
                                }
                              }}
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }
                  )}
                </Box>
              );
          }
        })()}
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Box
            sx={{
              width: timeScaleLevel2TickWidth * timeScaleLevel2Offset,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          />
          {displayableTimeScaleLevel2.map(
            ({ id, label, showLabel = true, sx, ...rest }, index) => {
              return (
                <Box
                  {...rest}
                  key={id}
                  sx={{
                    ...sx,
                    width: timeScaleLevel2TickWidth,
                    minWidth: 0,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showLabel ? (
                    <Typography
                      ref={(element) => {
                        if (element) {
                          setTimeScaleLevel2TickMinTextDisplayWidth(
                            (prevWidth) => {
                              return Math.max(
                                prevWidth,
                                element.offsetWidth + 10
                              );
                            }
                          );
                        }
                      }}
                      variant="body2"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        ...(() => {
                          if (
                            variant === 'compact' &&
                            timeScaleLevel2Offset + index > 0
                          ) {
                            return {
                              transform: 'translateX(-50%)',
                            };
                          }
                        })(),
                      }}
                    >
                      {label}
                    </Typography>
                  ) : null}
                </Box>
              );
            }
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Box
            sx={{
              width: timeScaleLevel3TickWidth * timeScaleLevel3Offset,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          />
          {displayableTimeScaleLevel3.map(({ id, label, sx, ...rest }) => {
            return (
              <Box
                {...omit(rest, 'showLabel')}
                key={id}
                sx={{
                  ...(() => {
                    if (variant === 'compact') {
                      return {
                        borderLeft: `1px solid ${palette.divider}`,
                        height: 11,
                      };
                    }
                    return {
                      height: 24,
                    };
                  })(),
                  ...sx,
                  width: timeScaleLevel3TickWidth,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {(() => {
                  if (variant === 'default' && label) {
                    return (
                      <Typography
                        ref={(element) => {
                          if (element) {
                            setTimeScaleLevel3TickMinTextDisplayWidth(
                              (prevWidth) => {
                                return Math.max(
                                  prevWidth,
                                  element.offsetWidth + 10
                                );
                              }
                            );
                          }
                        }}
                        variant="body2"
                        sx={{
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </Typography>
                    );
                  }
                })()}
              </Box>
            );
          })}
        </Box>
      </Stack>
    );
  }
);

export default TimeScaleMeter;
