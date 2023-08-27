import '@infinite-debugger/rmk-js-extensions/String';

import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
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

import { useGlobalConfiguration } from '../contexts/GlobalConfigurationContext';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import Tooltip from './Tooltip';

export interface TimeStampDisplayClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimeStampDisplayClassKey = keyof TimeStampDisplayClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimeStampDisplay: TimeStampDisplayProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimeStampDisplay: keyof TimeStampDisplayClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimeStampDisplay?: {
      defaultProps?: ComponentsProps['MuiTimeStampDisplay'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimeStampDisplay'];
      variants?: ComponentsVariants['MuiTimeStampDisplay'];
    };
  }
}
//#endregion

export const getTimeStampDisplayUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTimeStampDisplay', slot);
};

const slots: Record<TimeStampDisplayClassKey, [TimeStampDisplayClassKey]> = {
  root: ['root'],
};

export const timeStampDisplayClasses: TimeStampDisplayClasses =
  generateUtilityClasses(
    'MuiTimeStampDisplay',
    Object.keys(slots) as TimeStampDisplayClassKey[]
  );

export interface TimeStampDisplayProps extends LoadingTypographyProps {
  timestamp: number | string;
  showTooltip?: boolean;
  sentenceCase?: boolean;
  refreshTimeout?: number;
}

export const TimeStampDisplay = forwardRef<HTMLElement, TimeStampDisplayProps>(
  function TimeStampDisplay(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiTimeStampDisplay',
    });
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

    const [date, setDate] = useState(() => {
      return createDateWithoutTimezoneOffset(timestamp);
    });

    const {
      shortDateFormat: globalShortDateFormat,
      dateFormat: globalDateFormat,
      timeFormat: globalTimeFormat,
    } = useGlobalConfiguration();

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
          if (
            Math.abs(differenceInHours(new Date(), new Date(timestamp))) > 30
          ) {
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
        return formatDate(date, `${globalDateFormat} 'at' ${globalTimeFormat}`);
      }
      return formatDate(
        date,
        `${globalShortDateFormat} 'at' ${globalTimeFormat}`
      );
    })();

    const displayElement = (
      <LoadingTypography
        ref={ref}
        className={clsx(classes.root)}
        {...{ component: 'span' as any }}
        variant="inherit"
        {...rest}
        sx={{
          cursor: 'default',
          ...sx,
        }}
      >
        {sentenceCase
          ? formattedTimestamp.toSentenceCase()
          : formattedTimestamp}
      </LoadingTypography>
    );

    if (showTooltip) {
      return (
        <Tooltip
          title={formatDate(
            date,
            `EEEE ${globalDateFormat} 'at' ${globalTimeFormat}`
          )}
        >
          {displayElement}
        </Tooltip>
      );
    }

    return displayElement;
  }
);

export default TimeStampDisplay;
