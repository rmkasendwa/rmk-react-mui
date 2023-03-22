import 'react-datepicker/dist/react-datepicker.css';

import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import {
  Box,
  ClickAwayListener,
  Grow,
  Popper,
  darken,
  lighten,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { format } from 'date-fns';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DatePicker from 'react-datepicker';

import { useLoadingContext } from '../../contexts/LoadingContext';
import { isDescendant } from '../../utils/html';
import FieldValueDisplay from '../FieldValueDisplay';
import ModalPopup from '../ModalPopup';
import TextField, { TextFieldProps } from './TextField';

export interface DateInputFieldProps extends TextFieldProps {
  value?: string;
  minDate?: string;
  maxDate?: string;
  enableTimeSelector?: boolean;
  displayFormat?: string;
}

export const DateInputField = forwardRef<HTMLDivElement, DateInputFieldProps>(
  function DateInputField(
    {
      value,
      id,
      name,
      label,
      onChange,
      minDate: minDateProp,
      maxDate: maxDateProp,
      showClearButton = true,
      enableTimeSelector = false,
      displayFormat = '',
      disabled,
      sx,
      enableLoadingState = true,
      ...rest
    },
    ref
  ) {
    if (!displayFormat) {
      if (enableTimeSelector) {
        displayFormat = 'MMM dd, yyyy hh:mm aa';
      } else {
        displayFormat = 'MMM dd, yyyy';
      }
    }
    const anchorRef = useRef<HTMLInputElement>(null);
    const poperElementWrapperRef = useRef<HTMLDivElement>(null);
    const { palette, breakpoints } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);
    const { locked } = useLoadingContext();

    const triggerChangeEvent = useCallback(
      (inputValue: any) => {
        const event: any = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: {
            id,
            name,
            value: inputValue,
          },
        });
        onChange && onChange(event);
      },
      [id, name, onChange]
    );

    const { minDate, maxDate } = useMemo(() => {
      const minDate = minDateProp ? new Date(minDateProp) : null;
      const maxDate = maxDateProp ? new Date(maxDateProp) : null;
      if (minDate) {
        minDate.setHours(0, 0, 0, 0);
      }
      if (maxDate) {
        maxDate.setHours(0, 0, 0, 0);
      }
      return { minDate, maxDate };
    }, [maxDateProp, minDateProp]);

    useEffect(() => {
      setSelectedDate(value ? new Date(value) : null);
    }, [value]);

    if (enableLoadingState && locked) {
      return (
        <FieldValueDisplay
          {...({} as any)}
          {...rest.FieldValueDisplayProps}
          {...{ label }}
          value={(() => {
            if (value) {
              return format(new Date(value), displayFormat);
            }
          })()}
        />
      );
    }

    const selectDateIconButton = (
      <IconButton
        {...{ disabled }}
        onClick={() => setOpen(true)}
        sx={{ p: 0.4, ml: -0.5 }}
      >
        <EventIcon />
      </IconButton>
    );

    return (
      <>
        <TextField
          ref={ref}
          {...rest}
          {...{ id, name, disabled, label, enableLoadingState }}
          value={selectedDate ? format(selectedDate, displayFormat) : ''}
          InputProps={{
            startAdornment: disabled ? (
              selectDateIconButton
            ) : (
              <Tooltip title="Choose a date">{selectDateIconButton}</Tooltip>
            ),
            endAdornment: (() => {
              if (showClearButton && selectedDate && !disabled) {
                return (
                  <Tooltip title="Clear">
                    <IconButton
                      className="date-input-clear-button"
                      onClick={() => {
                        setSelectedDate(null);
                        triggerChangeEvent('');
                      }}
                      sx={{ p: 0.4 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                );
              }
            })(),
            ref: anchorRef,
          }}
          onClick={() => {
            setOpen(true);
          }}
          sx={{
            '& .date-input-clear-button': {
              visibility: 'hidden',
            },
            '&:hover .date-input-clear-button': {
              visibility: 'visible',
            },
            ...sx,
          }}
        />
        {(() => {
          const datePickerElement = (
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                if (date) {
                  const selectedDate =
                    date &&
                    (!minDate || date >= minDate) &&
                    (!maxDate || date <= maxDate)
                      ? date
                      : null;
                  setSelectedDate(selectedDate);
                  triggerChangeEvent(
                    (() => {
                      if (selectedDate) {
                        if (enableTimeSelector) {
                          return selectedDate.toISOString();
                        }
                        return format(selectedDate, 'yyyy-MM-dd');
                      }
                      return '';
                    })()
                  );
                } else {
                  setSelectedDate(null);
                }
              }}
              inline
              showTimeSelect={enableTimeSelector}
            />
          );
          if (isSmallScreenSize) {
            return (
              <ModalPopup
                {...{ open }}
                onClose={() => {
                  setOpen(false);
                }}
                CardProps={{
                  sx: {
                    maxHeight: 'none',
                  },
                }}
                CardBodyProps={{
                  sx: {
                    p: 0,
                  },
                }}
                disableEscapeKeyDown={false}
                disableAutoFocus={false}
                showHeaderToolbar={false}
                enableCloseOnBackdropClick
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {datePickerElement}
              </ModalPopup>
            );
          }
          return (
            <Popper
              {...{ open }}
              anchorEl={anchorRef.current}
              transition
              placement="bottom-start"
              sx={{
                zIndex: 1400,
              }}
            >
              {({ TransitionProps }) => {
                return (
                  <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: '0 0 0' }}
                  >
                    <Box
                      ref={poperElementWrapperRef}
                      sx={{
                        [`
                          .react-datepicker,
                          .react-datepicker__header,
                          .react-datepicker__time-container,
                          .react-datepicker__time
                        `]: {
                          bgcolor: palette.background.paper,
                          color: palette.text.primary,
                          borderColor: palette.divider,
                        },
                        [`
                          .react-datepicker__current-month,
                          .react-datepicker-time__header,
                          .react-datepicker-year-header,
                          .react-datepicker__day-name,
                          .react-datepicker__day,
                          .react-datepicker__time-name
                        `]: {
                          color: palette.text.primary,
                        },
                        [`
                          .react-datepicker__day,
                          .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item
                        `]: {
                          color: palette.text.primary,
                          '&:hover': {
                            bgcolor: (palette.mode === 'dark'
                              ? lighten
                              : darken)(palette.background.paper, 0.13),
                          },
                        },
                        [`
                          .react-datepicker__day.react-datepicker__day--selected,
                          .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected
                        `]: {
                          '&,&:hover': {
                            bgcolor: palette.primary.main,
                            color: palette.getContrastText(
                              palette.primary.main
                            ),
                          },
                        },
                      }}
                    >
                      <ClickAwayListener
                        onClickAway={(event) => {
                          if (poperElementWrapperRef.current) {
                            setOpen(
                              isDescendant(
                                poperElementWrapperRef.current,
                                event.target as any
                              )
                            );
                          }
                        }}
                      >
                        {datePickerElement}
                      </ClickAwayListener>
                    </Box>
                  </Grow>
                );
              }}
            </Popper>
          );
        })()}
      </>
    );
  }
);

export default DateInputField;
