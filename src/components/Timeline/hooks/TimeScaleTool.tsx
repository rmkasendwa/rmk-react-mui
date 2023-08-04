import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EastIcon from '@mui/icons-material/East';
import {
  Box,
  Button,
  Stack,
  Typography,
  outlinedInputClasses,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import formatDate from 'date-fns/format';
import { omit } from 'lodash';
import { ReactNode, useState } from 'react';

import { usePopupTool } from '../../../hooks/Tools/PopupTool';
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

export interface TimeScaleToolProps {
  selectedTimeScale: TimeScaleOption;
  supportedTimeScales?: TimeScaleOption[];
  onSelectTimeScale?: SelectTimeScaleCallbackFunction;
  label?: ReactNode;
}

export const useTimeScaleTool = ({
  selectedTimeScale,
  supportedTimeScales = [...timeScaleOptions],
  onSelectTimeScale,
  label = 'Timescale',
}: TimeScaleToolProps) => {
  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));
  const [isCustomDatesSelected, setIsCustomDatesSelected] = useState(false);

  const dataDropdownProps: DataDropdownFieldProps = {
    placeholder: label as string,
    size: 'small',
    value: isCustomDatesSelected ? CUSTOM_DATE_OPTION_LABEL : selectedTimeScale,
    onChange: (event) => {
      if (event.target.value === CUSTOM_DATE_OPTION_LABEL) {
        setIsCustomDatesSelected(true);
      } else {
        onSelectTimeScale?.((event.target.value as any) || null);
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
  if (isCustomDatesSelected) {
    buttonElementWidth += 50;
  }

  const buttonElement = (
    <Button
      color="inherit"
      variant={isCustomDatesSelected ? 'text' : 'contained'}
      size="small"
      disableRipple
      sx={{
        minWidth: 0,
        p: 0,
      }}
    >
      <DataDropdownField
        {...dataDropdownProps}
        options={[...supportedTimeScales, CUSTOM_DATE_OPTION_LABEL].map(
          (timeScaleOption) => {
            return {
              value: timeScaleOption,
              label: timeScaleOption,
            };
          }
        )}
        sx={{
          width: buttonElementWidth,
        }}
      />
    </Button>
  );

  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const datePickerNode = (
    <DatePicker
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      selectsRange={true as any}
      onChange={(dates: any) => {
        const [start, end] = dates as [Date, Date | null];
        setStartDate(start);
        setEndDate(end);
      }}
    />
  );
  const {
    popupElement: fromButtonPopupElement,
    ref: fromButtonAnchorRef,
    ...fromButtonPropsRest
  } = usePopupTool({
    label: 'From',
    type: 'button',
    wrapBodyContentInCard: false,
    bodyContent: datePickerNode,
  });

  const customDatesElementsNode = (
    <>
      <Box
        sx={{
          width: 10,
        }}
      />
      <Button
        ref={fromButtonAnchorRef}
        {...omit(fromButtonPropsRest, 'title', 'extraToolProps')}
        startIcon={<CalendarTodayIcon />}
        variant="contained"
        color="inherit"
        sx={{
          minWidth: 80,
          maxWidth: 100,
        }}
      >
        <Typography variant="inherit" component="div" noWrap>
          {formatDate(startDate, 'MM/dd/yy')}
        </Typography>
      </Button>
      {fromButtonPopupElement}
      <EastIcon />
      <Button
        startIcon={<CalendarTodayIcon />}
        variant="contained"
        color="inherit"
        sx={{
          minWidth: 80,
          maxWidth: 100,
        }}
      >
        <Typography variant="inherit" component="div" noWrap>
          {endDate ? formatDate(endDate, 'MM/dd/yy') : 'Select'}
        </Typography>
      </Button>
    </>
  );

  let elementMaxWidth =
    buttonElementWidth +
    (typeof label === 'string' ? label.length * 5 : 60) +
    4;
  let collapsedElementMaxWidth = buttonElementWidth;

  if (isCustomDatesSelected) {
    const customDatesElementsNodeWidth = 4 + 10 + 4 + 100 + 4 + 24 + 4 + 100;
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
        {!isSmallScreenSize ? (
          <Typography variant="body2">{label}:</Typography>
        ) : null}
        {buttonElement}
        {isCustomDatesSelected ? customDatesElementsNode : null}
      </Stack>
    ),
    elementMaxWidth,
    collapsedElement: <Tooltip title={label}>{buttonElement}</Tooltip>,
    collapsedElementMaxWidth,
  } as ElementTool;
};
