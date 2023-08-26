import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import { omit } from 'lodash';
import { ReactNode } from 'react';

import { PopupToolOptions, usePopupTool } from '../../../hooks/Tools/PopupTool';
import DatePicker, { DatePickerProps } from '../../DatePicker';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiJumpToDateTool: JumpToDateToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiJumpToDateTool?: {
      defaultProps?: ComponentsProps['MuiJumpToDateTool'];
      variants?: ComponentsVariants['MuiJumpToDateTool'];
    };
  }
}
//#endregion

export interface JumpToDateToolProps
  extends Partial<Pick<DatePickerProps, 'minDate' | 'maxDate' | 'onChange'>>,
    Partial<Omit<PopupToolOptions, 'onChange'>> {
  selectedDate?: DatePickerProps['selected'];
  wrapDatePickerNode?: (datePickerNode: ReactNode) => ReactNode;
}

export const useJumpToDateTool = (inProps: JumpToDateToolProps = {}) => {
  const props = useThemeProps({ props: inProps, name: 'MuiJumpToDateTool' });
  const {
    minDate,
    maxDate,
    onChange,
    selectedDate,
    wrapDatePickerNode,
    ...rest
  } = props;
  const datePickerNode = (
    <DatePicker
      {...{ minDate, maxDate }}
      selected={selectedDate}
      onChange={(...args) => {
        onChange?.(...args);
      }}
    />
  );
  const tool = usePopupTool({
    label: 'Jump to date',
    icon: <CalendarTodayIcon />,
    wrapBodyContentInCard: false,
    ...rest,
    bodyContent: wrapDatePickerNode
      ? wrapDatePickerNode(datePickerNode)
      : datePickerNode,
  });
  return omit(tool, 'open', 'setOpen');
};
