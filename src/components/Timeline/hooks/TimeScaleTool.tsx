import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EastIcon from '@mui/icons-material/East';
import {
  Box,
  Button,
  Stack,
  Typography,
  alpha,
  buttonClasses,
  outlinedInputClasses,
  useTheme,
} from '@mui/material';
import formatDate from 'date-fns/format';
import { omit } from 'lodash';
import { MutableRefObject, ReactNode, useEffect, useRef } from 'react';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools/PopupTool';
import DatePicker from '../../DatePicker';
import DataDropdownField, {
  DataDropdownFieldProps,
  dataDropdownFieldClasses,
} from '../../InputFields/DataDropdownField';
import { ElementTool } from '../../SearchSyncToolbar';
import Tooltip from '../../Tooltip';
import { TimeScaleOption, timeScaleOptions } from '../models';

export const CUSTOM_DATE_OPTION_LABEL = 'Custom Dates';

export type SelectTimeScaleCallbackFunction = (
  timeScale: TimeScaleOption | null
) => void;

export type SelectCustomDates = {
  startDate?: string;
  endDate?: string;
};

export type SelectCustomDatesTimeScaleCallbackFunction = (
  isCustomDatesTimeScaleSelected?: boolean,
  selectedCustomDates?: SelectCustomDates
) => void;

export interface TimeScaleToolProps {
  selectedTimeScale?: TimeScaleOption;
  supportedTimeScales?: TimeScaleOption[];
  label?: ReactNode;
  wrapStartDatePickerNode?: (datePickerNode: ReactNode) => ReactNode;
  wrapEndDatePickerNode?: (datePickerNode: ReactNode) => ReactNode;
  isCustomDatesTimeScaleSelected?: boolean;

  onSelectTimeScale?: SelectTimeScaleCallbackFunction;
  onSelectTimeScaleFunctionRef?: MutableRefObject<
    SelectTimeScaleCallbackFunction | undefined
  >;

  onSelectCustomDatesTimeScale?: SelectCustomDatesTimeScaleCallbackFunction;
  onSelectCustomDatesTimeScaleFunctionRef?: MutableRefObject<
    SelectCustomDatesTimeScaleCallbackFunction | undefined
  >;

  selectedCustomDates?: SelectCustomDates;
  DatePickerToolProps?: Partial<Omit<PopupToolOptions, 'onChange'>>;
  minDate?: string | number | Date;
  maxDate?: string | number | Date;
  startDateRef?: MutableRefObject<Date | null>;
  endDateRef?: MutableRefObject<Date | null>;
}

export const useTimeScaleTool = ({
  selectedTimeScale,
  supportedTimeScales = [...timeScaleOptions],
  label = 'Timescale',
  wrapStartDatePickerNode,
  wrapEndDatePickerNode,
  isCustomDatesTimeScaleSelected,

  onSelectTimeScale,
  onSelectTimeScaleFunctionRef,

  onSelectCustomDatesTimeScale,
  onSelectCustomDatesTimeScaleFunctionRef,

  selectedCustomDates: {
    startDate: startDateString,
    endDate: endDateString,
  } = {},
  DatePickerToolProps,
  minDate,
  maxDate,
  startDateRef,
  endDateRef,
}: TimeScaleToolProps) => {
  const shouldOpenFromDatePickerRef = useRef(false);
  const { palette } = useTheme();

  const startDate = (() => {
    if (startDateString) {
      return createDateWithoutTimezoneOffset(startDateString);
    }
    return new Date();
  })();
  const endDate = (() => {
    if (endDateString) {
      return createDateWithoutTimezoneOffset(endDateString);
    }
  })();

  const startDatePickerNode = (
    <DatePicker
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      selectsRange={true as any}
      onChange={(dates: any) => {
        const [startDate] = dates as [Date, Date | null];
        (
          onSelectCustomDatesTimeScale ||
          onSelectCustomDatesTimeScaleFunctionRef?.current
        )?.(isCustomDatesTimeScaleSelected ?? false, {
          startDate: formatDate(startDate, 'yyyy-MM-dd'),
          endDate: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
        });
      }}
      minDate={(() => {
        if (minDate) {
          return createDateWithoutTimezoneOffset(minDate);
        }
      })()}
      maxDate={(() => {
        if (endDate) {
          return endDate;
        }
        if (maxDate) {
          return createDateWithoutTimezoneOffset(maxDate);
        }
      })()}
    />
  );
  const {
    popupElement: fromButtonPopupElement,
    ref: fromButtonAnchorRef,
    open: fromButtonPopupElementOpen,
    setOpen: fromButtonPopupElementSetOpen,
    ...fromButtonPropsRest
  } = usePopupTool({
    label: 'From',
    wrapBodyContentInCard: false,
    ...DatePickerToolProps,
    type: 'button',
    bodyContent: wrapStartDatePickerNode
      ? wrapStartDatePickerNode(startDatePickerNode)
      : startDatePickerNode,
  });

  const endDatePickerNode = (
    <DatePicker
      selected={endDate}
      startDate={startDate}
      endDate={endDate}
      selectsRange={true as any}
      onChange={(dates: any) => {
        const [, endDate] = dates as [Date, Date | null];
        onSelectCustomDatesTimeScale?.(
          isCustomDatesTimeScaleSelected ?? false,
          {
            startDate: startDate
              ? formatDate(startDate, 'yyyy-MM-dd')
              : undefined,
            endDate: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
          }
        );
      }}
      minDate={(() => {
        if (startDate) {
          return startDate;
        }
        if (minDate) {
          return createDateWithoutTimezoneOffset(minDate);
        }
      })()}
      maxDate={(() => {
        if (maxDate) {
          return createDateWithoutTimezoneOffset(maxDate);
        }
      })()}
    />
  );
  const {
    popupElement: toButtonPopupElement,
    ref: toButtonAnchorRef,
    open: toButtonPopupElementOpen,
    ...toButtonPropsRest
  } = usePopupTool({
    label: 'To',
    wrapBodyContentInCard: false,
    ...DatePickerToolProps,
    type: 'button',
    bodyContent: wrapEndDatePickerNode
      ? wrapEndDatePickerNode(endDatePickerNode)
      : endDatePickerNode,
  });

  const dataDropdownProps: DataDropdownFieldProps = {
    placeholder: label as string,
    size: 'small',
    value: isCustomDatesTimeScaleSelected
      ? CUSTOM_DATE_OPTION_LABEL
      : selectedTimeScale,
    onChange: (event) => {
      onSelectCustomDatesTimeScale?.(
        event.target.value === CUSTOM_DATE_OPTION_LABEL,
        (() => {
          if (startDateString && endDateString) {
            return {
              startDate: startDateString,
              endDate: endDateString,
            };
          }
          if (startDateRef?.current && endDateRef?.current) {
            return {
              startDate: formatDate(startDateRef.current, 'yyyy-MM-dd'),
              endDate: formatDate(endDateRef.current, 'yyyy-MM-dd'),
            };
          }
        })()
      );
      if (event.target.value === CUSTOM_DATE_OPTION_LABEL) {
        shouldOpenFromDatePickerRef.current = true;
      } else {
        (onSelectTimeScale || onSelectTimeScaleFunctionRef?.current)?.(
          (event.target.value as any) || null
        );
      }
    },
    showClearButton: false,
    InputProps: {
      sx: {
        height: 32,
        pr: 0.5,
        [`.${outlinedInputClasses.notchedOutline}`]: {
          border: 'none',
        },
      },
    },
    WrapperProps: {
      sx: {
        [`.${dataDropdownFieldClasses.selectedOptionsWrapper}`]: {
          top: 3,
          width: 'calc(100% - 22px) !important',
        },
      },
    },
    enableLoadingState: false,
  };

  let buttonElementWidth = 90;
  if (isCustomDatesTimeScaleSelected) {
    buttonElementWidth += 50;
  }

  const buttonElement = (
    <Button
      color="inherit"
      variant={isCustomDatesTimeScaleSelected ? 'text' : 'contained'}
      size="small"
      disableRipple
      sx={{
        minWidth: 0,
        p: 0,
      }}
    >
      <DataDropdownField
        {...dataDropdownProps}
        options={[
          ...supportedTimeScales,
          ...(() => {
            if (
              onSelectCustomDatesTimeScale ||
              isCustomDatesTimeScaleSelected
            ) {
              return [CUSTOM_DATE_OPTION_LABEL];
            }
            return [];
          })(),
        ].map((timeScaleOption) => {
          return {
            value: timeScaleOption,
            label: timeScaleOption,
          };
        })}
        sx={{
          width: buttonElementWidth,
        }}
      />
    </Button>
  );

  const customDatesElementsNode = (
    <>
      <Box
        sx={{
          width: 10,
        }}
      />
      <Button
        ref={fromButtonAnchorRef}
        {...omit(
          fromButtonPropsRest,
          'title',
          'extraToolProps',
          'open',
          'setOpen'
        )}
        startIcon={<CalendarTodayIcon />}
        variant="contained"
        color="inherit"
        sx={{
          minWidth: 80,
          maxWidth: 110,
          ...(() => {
            if (fromButtonPopupElementOpen) {
              return {
                [`&.${buttonClasses.colorInherit},&.${buttonClasses.colorInherit}:hover`]:
                  {
                    bgcolor: alpha(palette.primary.main, 0.15),
                  },
              };
            }
          })(),
        }}
      >
        <Typography variant="inherit" component="div" noWrap>
          {formatDate(startDate, 'MM/dd/yy')}
        </Typography>
      </Button>
      {fromButtonPopupElement}
      <EastIcon
        sx={{
          fontSize: 18,
        }}
      />
      <Button
        ref={toButtonAnchorRef}
        {...omit(
          toButtonPropsRest,
          'title',
          'extraToolProps',
          'open',
          'setOpen'
        )}
        startIcon={<CalendarTodayIcon />}
        variant="contained"
        color="inherit"
        sx={{
          minWidth: 80,
          maxWidth: 110,
          ...(() => {
            if (toButtonPopupElementOpen) {
              return {
                [`&.${buttonClasses.colorInherit},&.${buttonClasses.colorInherit}:hover`]:
                  {
                    bgcolor: alpha(palette.primary.main, 0.15),
                  },
              };
            }
          })(),
        }}
      >
        <Typography variant="inherit" component="div" noWrap>
          {endDate ? formatDate(endDate, 'MM/dd/yy') : 'Select'}
        </Typography>
      </Button>
      {toButtonPopupElement}
    </>
  );

  useEffect(() => {
    if (isCustomDatesTimeScaleSelected && shouldOpenFromDatePickerRef.current) {
      fromButtonPopupElementSetOpen(true);
      shouldOpenFromDatePickerRef.current = false;
    }
  }, [fromButtonPopupElementSetOpen, isCustomDatesTimeScaleSelected]);

  let elementMaxWidth = buttonElementWidth;
  let collapsedElementMaxWidth = buttonElementWidth;

  elementMaxWidth += (typeof label === 'string' ? label.length * 5 : 60) + 4;
  if (isCustomDatesTimeScaleSelected) {
    const customDatesElementsNodeWidth = 4 + 10 + 4 + 110 + 4 + 24 + 4 + 110;
    elementMaxWidth += customDatesElementsNodeWidth;
    collapsedElementMaxWidth += customDatesElementsNodeWidth;
  }

  return {
    element: (
      <Stack
        direction="row"
        sx={{
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {!isCustomDatesTimeScaleSelected ? (
          <Typography variant="body2">{label}:</Typography>
        ) : null}
        {buttonElement}
        {isCustomDatesTimeScaleSelected ? customDatesElementsNode : null}
      </Stack>
    ),
    elementMaxWidth,
    collapsedElement: (
      <Stack
        direction="row"
        sx={{
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        <Tooltip title={label}>{buttonElement}</Tooltip>
        {isCustomDatesTimeScaleSelected ? customDatesElementsNode : null}
      </Stack>
    ),
    collapsedElementMaxWidth,
  } as ElementTool;
};
