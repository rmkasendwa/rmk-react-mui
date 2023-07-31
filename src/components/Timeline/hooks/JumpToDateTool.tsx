import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { ReactNode } from 'react';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools/PopupTool';
import DatePicker, { DatePickerProps } from '../../DatePicker';

export interface JumpToDateToolProps
  extends Partial<Pick<DatePickerProps, 'minDate' | 'maxDate' | 'onChange'>>,
    Partial<Omit<PopupToolOptions, 'onChange'>> {
  selectedDate?: DatePickerProps['selected'];
  wrapDatePickerNode?: (datePickerNode: ReactNode) => ReactNode;
}

export const useJumpToDateTool = ({
  minDate,
  maxDate,
  onChange,
  selectedDate,
  wrapDatePickerNode,
  ...rest
}: JumpToDateToolProps = {}) => {
  const datePickerNode = (
    <DatePicker
      {...{ minDate, maxDate }}
      selected={selectedDate}
      onChange={(...args) => {
        onChange?.(...args);
      }}
    />
  );
  return usePopupTool({
    label: 'Jump to date',
    icon: <CalendarTodayIcon />,
    wrapBodyContentInCard: false,
    ...rest,
    bodyContent: wrapDatePickerNode
      ? wrapDatePickerNode(datePickerNode)
      : datePickerNode,
  });
};
