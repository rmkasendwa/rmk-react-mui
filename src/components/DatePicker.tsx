import 'react-datepicker/dist/react-datepicker.css';

import {
  alpha,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  lighten,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef } from 'react';
import ReactDatePicker, {
  DatePickerProps as ReactDatePickerProps,
} from 'react-datepicker';

export interface DatePickerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type DatePickerClassKey = keyof DatePickerClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDatePicker: DatePickerProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDatePicker: keyof DatePickerClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDatePicker?: {
      defaultProps?: ComponentsProps['MuiDatePicker'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDatePicker'];
      variants?: ComponentsVariants['MuiDatePicker'];
    };
  }
}
//#endregion

export const getDatePickerUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiDatePicker', slot);
};

const slots: Record<DatePickerClassKey, [DatePickerClassKey]> = {
  root: ['root'],
};

export const datePickerClasses: DatePickerClasses = generateUtilityClasses(
  'MuiDatePicker',
  Object.keys(slots) as DatePickerClassKey[]
);

export type DatePickerProps = Partial<Pick<BoxProps, 'sx' | 'className'>> &
  Pick<
    ReactDatePickerProps,
    | 'selected'
    | 'minDate'
    | 'maxDate'
    | 'startDate'
    | 'endDate'
    | 'showTimeSelect'
    | 'showTimeInput'
  > &
  (
    | {
        selectsRange?: never;
        selectsMultiple?: never;
        onChange?: (
          date: Date | null,
          event?:
            | React.MouseEvent<HTMLElement>
            | React.KeyboardEvent<HTMLElement>
        ) => void;
      }
    | {
        selectsRange: true;
        selectsMultiple?: never;
        onChange?: (
          date: [Date | null, Date | null],
          event?:
            | React.MouseEvent<HTMLElement>
            | React.KeyboardEvent<HTMLElement>
        ) => void;
      }
    | {
        selectsRange?: never;
        selectsMultiple: true;
        onChange?: (
          date: Date[] | null,
          event?:
            | React.MouseEvent<HTMLElement>
            | React.KeyboardEvent<HTMLElement>
        ) => void;
      }
  );

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiDatePicker' });
    const {
      className,
      onChange,
      selected,
      minDate,
      maxDate,
      startDate,
      endDate,
      showTimeSelect,
      showTimeInput,
      selectsRange,
      selectsMultiple,
      sx,
    } = props;

    const classes = composeClasses(
      slots,
      getDatePickerUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();

    return (
      <Box
        ref={ref}
        className={clsx(classes.root)}
        sx={{
          ...sx,
          [`&>div`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          [`
          .react-datepicker,
          .react-datepicker__header,
          .react-datepicker__time-container,
          .react-datepicker__time,
          .react-datepicker-time__input
        `]: {
            bgcolor: palette.background.paper,
            color: palette.text.primary,
            borderColor: palette.divider,
          },
          '.react-datepicker__current-month': {
            borderBottom: `1px solid ${palette.divider}`,
            pb: 1,
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
            '&.react-datepicker__day--disabled': {
              color: palette.text.disabled,
            },
            '&:not(.react-datepicker__day--disabled):not(.react-datepicker__day--keyboard-selected):not(.react-datepicker__day--selected):not(.react-datepicker__time-list-item--selected):hover':
              {
                bgcolor: (palette.mode === 'dark' ? lighten : darken)(
                  palette.background.paper,
                  0.13
                ),
              },
          },
          [`
          .react-datepicker__day.react-datepicker__day--selected,
          .react-datepicker__day--in-range,
          .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected
        `]: {
            '&,&:hover': {
              bgcolor: palette.primary.main,
              color: palette.getContrastText(palette.primary.main),
            },
          },
          '.react-datepicker__day--keyboard-selected': {
            bgcolor: alpha(palette.primary.main, 0.3),
          },
          '.react-datepicker__month': {
            minWidth: 320,
            m: 0,
          },
          '.react-datepicker__week,.react-datepicker__day-names': {
            display: 'flex',
            '.react-datepicker__day,.react-datepicker__day-name': {
              width: 'auto',
              flex: 1,
              minWidth: '1.7rem',
            },
          },
          '.react-datepicker__input-time-container': {
            m: 0,
            py: 1.2,
            pl: 2,
            borderTop: `1px solid ${palette.divider}`,
          },
          '.react-datepicker-time__input': {
            borderWidth: 1,
            borderRadius: '4px',
          },
          '.react-datepicker__header__dropdown--select': {
            pt: 1,
          },
        }}
      >
        {(() => {
          const datePickerProps: ReactDatePickerProps = {
            peekNextMonth: true,
            showMonthDropdown: true,
            showYearDropdown: true,
            dropdownMode: 'select',
            inline: true,
            selected,
            minDate,
            maxDate,
            startDate,
            endDate,
            showTimeSelect,
            showTimeInput,
          };
          if (selectsRange) {
            return (
              <ReactDatePicker
                {...datePickerProps}
                {...{
                  selectsRange,
                  onChange,
                }}
              />
            );
          }

          if (selectsMultiple) {
            return (
              <ReactDatePicker
                {...datePickerProps}
                {...{
                  selectsMultiple,
                  onChange,
                }}
              />
            );
          }
          return (
            <ReactDatePicker
              {...datePickerProps}
              {...{
                onChange,
              }}
            />
          );
        })()}
      </Box>
    );
  }
);

export default DatePicker;
