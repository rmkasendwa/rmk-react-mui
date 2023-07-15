import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools/PopupTool';
import DatePicker, { DatePickerProps } from '../../DatePicker';

export interface JumpToDateToolProps
  extends Partial<Pick<DatePickerProps, 'minDate' | 'maxDate' | 'onChange'>>,
    Partial<Omit<PopupToolOptions, 'onChange'>> {
  selectedDate?: DatePickerProps['selected'];
}

export const useJumpToDateTool = ({
  minDate,
  maxDate,
  onChange,
  selectedDate,
  ...rest
}: JumpToDateToolProps = {}) => {
  return usePopupTool({
    label: 'Jump to date',
    icon: <CalendarTodayIcon />,
    wrapBodyContentInCard: false,
    ...rest,
    bodyContent: (
      <DatePicker
        {...{ minDate, maxDate }}
        selected={selectedDate}
        onChange={(...args) => {
          onChange?.(...args);
        }}
      />
    ),
  });
};
