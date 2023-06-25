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
import { ReactNode, forwardRef } from 'react';

export interface TimeScaleMeterClasses {
  /** Styles applied to the root element. */
  root: string;
  timeScaleLevel1: string;
  timeScaleLevel1Tick: string;
}

export type TimeScaleMeterClassKey = keyof TimeScaleMeterClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeScaleMeter: TimeScaleMeterProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeScaleMeter: keyof TimeScaleMeterClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeScaleMeter?: {
      defaultProps?: ComponentsProps['MuiTimeScaleMeter'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeScaleMeter'];
      variants?: ComponentsVariants['MuiTimeScaleMeter'];
    };
  }
}

export interface TimeScaleMeterProps extends Partial<StackProps> {
  timeScaleRows: [
    { id: string; label: ReactNode }[],
    { id: string; label: ReactNode }[],
    { id: string; label: ReactNode }[]
  ];
}

export function getTimeScaleMeterUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeScaleMeter', slot);
}

export const timeScaleMeterClasses: TimeScaleMeterClasses =
  generateUtilityClasses('MuiTimeScaleMeter', [
    'root',
    'timeScaleLevel1',
    'timeScaleLevel1Tick',
  ]);

const slots = {
  root: ['root'],
  timeScaleLevel1: ['timeScaleLevel1'],
  timeScaleLevel1Tick: ['timeScaleLevel1Tick'],
};

export const TimeScaleMeter = forwardRef<HTMLDivElement, TimeScaleMeterProps>(
  function TimeScaleMeter(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTimeScaleMeter' });
    const { className, timeScaleRows, sx, ...rest } = props;

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

    const { palette } = useTheme();

    const [topTimeScaleRow, middleTimeScaleRow, bottomTimeScaleRow] =
      timeScaleRows;

    return (
      <Stack
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          width: '100%',
          bgcolor: palette.background.paper,
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: 56,
            alignItems: 'center',
          }}
        >
          {topTimeScaleRow.map(({ id, label }) => {
            return (
              <Box
                key={id}
                className={clsx(classes.timeScaleLevel1)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  className={clsx(classes.timeScaleLevel1Tick)}
                  sx={{
                    position: 'sticky',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          {middleTimeScaleRow.map(({ id, label }) => {
            return (
              <Box
                key={id}
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  minWidth: 0,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          {bottomTimeScaleRow.map(({ id, label }) => {
            return (
              <Box
                key={id}
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  minWidth: 0,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: 12,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Stack>
    );
  }
);

export default TimeScaleMeter;
