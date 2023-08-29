import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  TableCell,
  TableCellProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import DataDropdownField from '../../InputFields/DataDropdownField';
import { BaseDataRow } from '../../Table';
import {
  Condition,
  DateFilterOperator,
  dateFilterOperatorToValueOptionsMap,
} from '../models';

export interface DateFilterConditionRowValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type DateFilterConditionRowValueClassKey =
  keyof DateFilterConditionRowValueClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDateFilterConditionRowValue: DateFilterConditionRowValueProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDateFilterConditionRowValue: keyof DateFilterConditionRowValueClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDateFilterConditionRowValue?: {
      defaultProps?: ComponentsProps['MuiDateFilterConditionRowValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDateFilterConditionRowValue'];
      variants?: ComponentsVariants['MuiDateFilterConditionRowValue'];
    };
  }
}
//#endregion

export const getDateFilterConditionRowValueUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiDateFilterConditionRowValue', slot);
};

const slots: Record<
  DateFilterConditionRowValueClassKey,
  [DateFilterConditionRowValueClassKey]
> = {
  root: ['root'],
};

export const dateFilterConditionRowValueClasses: DateFilterConditionRowValueClasses =
  generateUtilityClasses(
    'MuiDateFilterConditionRowValue',
    Object.keys(slots) as DateFilterConditionRowValueClassKey[]
  );

export interface DateFilterConditionRowValueProps<
  RecordRow extends BaseDataRow = any
> extends Partial<TableCellProps> {
  condition: Condition<RecordRow>;
}

export const DateFilterConditionRowValue = forwardRef<
  HTMLTableCellElement,
  DateFilterConditionRowValueProps
>(function DateFilterConditionRowValue(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDateFilterConditionRowValue',
  });
  const { className, condition, ...rest } = props;

  const classes = composeClasses(
    slots,
    getDateFilterConditionRowValueUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  if (condition.operator) {
    return (
      <TableCell ref={ref} {...rest} className={clsx(classes.root)}>
        <DataDropdownField
          placeholder="Select"
          variant="text"
          value={condition.value as any}
          options={dateFilterOperatorToValueOptionsMap[
            condition.operator as DateFilterOperator
          ].map((label) => {
            return {
              label,
              value: label,
            };
          })}
        />
      </TableCell>
    );
  }

  return null;
});

export default DateFilterConditionRowValue;
