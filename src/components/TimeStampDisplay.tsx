import '@infinite-debugger/rmk-js-extensions/String';

import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Tooltip,
  Typography,
  TypographyProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import differenceInHours from 'date-fns/differenceInHours';
import formatDate from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import formatRelative from 'date-fns/formatRelative';
import { forwardRef, useEffect, useState } from 'react';

export interface TimeStampDisplayClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimeStampDisplayClassKey = keyof TimeStampDisplayClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeStampDisplay: TimeStampDisplayProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeStampDisplay: keyof TimeStampDisplayClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeStampDisplay?: {
      defaultProps?: ComponentsProps['MuiTimeStampDisplay'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeStampDisplay'];
      variants?: ComponentsVariants['MuiTimeStampDisplay'];
    };
  }
}

export interface TimeStampDisplayProps extends TypographyProps {
  timestamp: number | string;
  showTooltip?: boolean;
  sentenceCase?: boolean;
  refreshTimeout?: number;
}

export function getTimeStampDisplayUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeStampDisplay', slot);
}

export const timeStampDisplayClasses: TimeStampDisplayClasses =
  generateUtilityClasses('MuiTimeStampDisplay', ['root']);

const slots = {
  root: ['root'],
};

export const TimeStampDisplay = forwardRef<
  HTMLDivElement,
  TimeStampDisplayProps
>(function TimeStampDisplay(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiTimeStampDisplay' });
  const {
    timestamp,
    showTooltip = true,
    sentenceCase = false,
    sx,
    className,
    refreshTimeout = 30000,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTimeStampDisplayUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const [date, setDate] = useState(new Date(timestamp));

  useEffect(() => {
    setDate(new Date(timestamp));
  }, [timestamp]);

  useEffect(() => {
    if (
      refreshTimeout > 0 &&
      Math.abs(differenceInHours(new Date(), new Date(timestamp))) <= 30
    ) {
      const interval = setInterval(() => {
        setDate(new Date(timestamp));
        if (Math.abs(differenceInHours(new Date(), new Date(timestamp))) > 30) {
          clearInterval(interval);
        }
      }, refreshTimeout);
      return () => {
        clearInterval(interval);
      };
    }
  }, [refreshTimeout, timestamp]);

  const formattedTimestamp = (() => {
    const today = new Date();
    if (Math.abs(differenceInHours(today, date)) <= 6) {
      return formatDistance(date, today, { addSuffix: true });
    }
    if (Math.abs(differenceInHours(today, date)) <= 30) {
      return formatRelative(date, today);
    }
    if (date.getFullYear() !== today.getFullYear()) {
      return formatDate(date, "MMM dd, yyyy 'at' hh:mm aa");
    }
    return formatDate(date, "MMM dd 'at' hh:mm aa");
  })();

  const displayElement = (
    <Typography
      ref={ref}
      className={clsx(classes.root)}
      component="span"
      variant="inherit"
      {...rest}
      sx={{
        cursor: 'default',
        ...sx,
      }}
    >
      {sentenceCase ? formattedTimestamp.toSentenceCase() : formattedTimestamp}
    </Typography>
  );

  if (showTooltip) {
    return (
      <Tooltip title={formatDate(date, "EEEE MMM dd, yyyy 'at' hh:mm:ss aa")}>
        {displayElement}
      </Tooltip>
    );
  }

  return displayElement;
});

export default TimeStampDisplay;
