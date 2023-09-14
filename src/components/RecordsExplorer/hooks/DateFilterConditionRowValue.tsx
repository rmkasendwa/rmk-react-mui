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
import hashIt from 'hash-it';
import { forwardRef } from 'react';

import DataDropdownField from '../../InputFields/DataDropdownField';
import DateInputField from '../../InputFields/DateInputField';
import NumberInputField from '../../InputFields/NumberInputField';
import { BaseDataRow } from '../../Table';
import {
  Condition,
  ConditionGroup,
  DateFilterOperator,
  DateFilterOperatorValue,
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
  selectedConditionGroup: ConditionGroup<RecordRow>;
  onChangeSelectedConditionGroup: (
    conditionGroup: ConditionGroup<RecordRow> | null
  ) => void;
}

export const DateFilterConditionRowValue = forwardRef<
  HTMLTableCellElement,
  DateFilterConditionRowValueProps
>(function DateFilterConditionRowValue(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDateFilterConditionRowValue',
  });
  const {
    className,
    condition,
    selectedConditionGroup,
    onChangeSelectedConditionGroup,
    ...rest
  } = props;

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

  const index = selectedConditionGroup.conditions.findIndex(
    (currentCondition) => {
      return hashIt(currentCondition) === hashIt(condition);
    }
  );

  const nextSelectedConditionGroup = JSON.parse(
    JSON.stringify(selectedConditionGroup)
  ) as typeof selectedConditionGroup;

  if (condition.operator) {
    const conditionValue = condition.value as DateFilterOperatorValue;
    const { numberOfDays, selectedDate } = condition;
    return (
      <>
        <TableCell ref={ref} {...rest} className={clsx(classes.root)}>
          <DataDropdownField
            placeholder="Select"
            variant="text"
            value={conditionValue}
            options={(
              dateFilterOperatorToValueOptionsMap[
                condition.operator as DateFilterOperator
              ] || []
            ).map((label) => {
              return {
                label,
                value: label,
              };
            })}
            showClearButton={false}
            onChange={(event) => {
              if (event.target.value) {
                nextSelectedConditionGroup.conditions[index].value = event
                  .target.value as any;
                onChangeSelectedConditionGroup(nextSelectedConditionGroup);
              }
            }}
          />
        </TableCell>
        {(() => {
          switch (conditionValue) {
            case 'number of days ago':
            case 'number of days from now':
            case 'the next number of days':
            case 'the past number of days':
              return (
                <TableCell ref={ref} {...rest} className={clsx(classes.root)}>
                  <NumberInputField
                    placeholder="Enter days"
                    value={numberOfDays}
                    decimalPlaces={0}
                    onChange={(event) => {
                      if (event.target.value) {
                        nextSelectedConditionGroup.conditions[
                          index
                        ].numberOfDays = event.target.value as any;
                        onChangeSelectedConditionGroup(
                          nextSelectedConditionGroup
                        );
                      }
                    }}
                    sx={{
                      width: 120,
                    }}
                  />
                </TableCell>
              );
            case 'exact date':
              return (
                <TableCell ref={ref} {...rest} className={clsx(classes.root)}>
                  <DateInputField
                    placeholder="Select a date"
                    value={selectedDate}
                    onChange={(event) => {
                      if (event.target.value) {
                        nextSelectedConditionGroup.conditions[
                          index
                        ].selectedDate = event.target.value as any;
                        onChangeSelectedConditionGroup(
                          nextSelectedConditionGroup
                        );
                      }
                    }}
                    sx={{
                      width: 150,
                    }}
                  />
                </TableCell>
              );
          }
        })()}
      </>
    );
  }

  return null;
});

export default DateFilterConditionRowValue;
