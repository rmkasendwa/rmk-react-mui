import { formatDate } from '@infinite-debugger/rmk-utils/dates';
import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Link,
  TableCell,
  TableCellProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { format } from 'date-fns';
import { forwardRef, isValidElement, useEffect, useState } from 'react';
import * as yup from 'yup';

import { CountryCode } from '../../interfaces/Countries';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../../utils/PhoneNumberUtil';
import { mapTableColumnTypeToExoticDataType } from '../../utils/Table';
import CountryFieldValue from '../CountryFieldValue';
import EllipsisMenuIconButton, {
  EllipsisMenuIconButtonProps,
} from '../EllipsisMenuIconButton';
import FieldValue from '../FieldValue';
import { TableColumn } from './Table';

export interface TableBodyColumnClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableBodyColumnClassKey = keyof TableBodyColumnClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyColumn: TableBodyColumnProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyColumn: keyof TableBodyColumnClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyColumn?: {
      defaultProps?: ComponentsProps['MuiTableBodyColumn'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyColumn'];
      variants?: ComponentsVariants['MuiTableBodyColumn'];
    };
  }
}

const allowedDataTypes = ['number', 'string', 'boolean'];

const toolTypes = [
  'tool',
  'input',
  'currencyInput',
  'selectInput',
  'dateInput',
  'phoneInput',
  'rowAdder',
  'percentageInput',
  'numberInput',
  'fragment',
  'checkbox',
];

export interface TableBodyColumnProps<RowObject = any>
  extends TableColumn,
    Partial<Pick<TableCellProps, 'onClick'>> {
  column: TableColumn<RowObject>;
  row: RowObject;
}

export function getTableBodyColumnUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableBodyColumn', slot);
}

export const tableBodyColumnClasses: TableBodyColumnClasses =
  generateUtilityClasses('MuiTableBodyColumn', ['root']);

const slots = {
  root: ['root'],
};

export const TableBodyColumn = forwardRef<
  HTMLElement,
  TableBodyColumnProps<any>
>(function TableBodyColumn(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiTableBodyColumn' });
  const {
    className,
    id,
    align = 'left',
    sx,
    onClickColumn,
    bodySx,
    getColumnValue,
    textTransform,
    type,
    columnTypographyProps = {},
    defaultColumnValue,
    decimalPlaces,
    column,
    onClick,
    row,
    fieldValueEditor,
    onFieldValueUpdated,
    editable = false,
    editField,
    getEditField,
    editMode: editModeProp,
    validationRules,
  } = props;

  const classes = composeClasses(
    slots,
    getTableBodyColumnUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { ...columnTypographyPropsRest } = columnTypographyProps;

  const [editMode, setEditMode] = useState(editModeProp ?? false);
  const { palette } = useTheme();

  useEffect(() => {
    if (editModeProp != null) {
      setEditMode(editModeProp);
    }
  }, [editModeProp]);

  const { baseColumnValue, formattedColumnValue } = (() => {
    let formattedColumnValue = (() => {
      if (getColumnValue) {
        if (type === 'ellipsisMenuTool') {
          const { options, ...rest } =
            (getColumnValue(row, column) as EllipsisMenuIconButtonProps) || {};
          if (options && options.length > 0) {
            return (
              <Box>
                <EllipsisMenuIconButton options={options} {...rest} />
              </Box>
            );
          }
          return defaultColumnValue;
        }
        return getColumnValue(row, column);
      }
      return (row as any)[id];
    })();
    if (type && toolTypes.includes(type)) {
      switch (type) {
        case 'input':
          // TODO: Implment this
          break;
        case 'currencyInput':
          // TODO: Implment this
          break;
        case 'percentageInput':
          // TODO: Implment this
          break;
        case 'numberInput':
          // TODO: Implment this
          break;
        case 'dropdownInput':
          // TODO: Implment this
          break;
        case 'dateInput':
          // TODO: Implment this
          break;
        case 'phonenumberInput':
          // TODO: Implment this
          break;
        case 'rowAdder':
          // TODO: Implment this
          break;
        case 'checkbox':
          // TODO: Implment this
          break;
      }
    } else if (
      formattedColumnValue != null &&
      allowedDataTypes.includes(typeof formattedColumnValue)
    ) {
      switch (type) {
        case 'date':
          if (textTransform) {
            formattedColumnValue = formatDate(formattedColumnValue);
          }
          break;
        case 'dateTime':
          if (textTransform) {
            formattedColumnValue = formatDate(formattedColumnValue, true);
          }
          break;
        case 'time':
          if (textTransform) {
            const date = new Date(formattedColumnValue);
            formattedColumnValue = isNaN(date.getTime())
              ? ''
              : format(date, 'hh:mm aa');
          }
          break;
        case 'currency':
        case 'percentage':
          formattedColumnValue = parseFloat(formattedColumnValue);
          formattedColumnValue = addThousandCommas(
            formattedColumnValue,
            decimalPlaces || true
          );
          break;
        case 'number':
          formattedColumnValue = addThousandCommas(formattedColumnValue);
          break;
        case 'phoneNumber':
          if (typeof formattedColumnValue === 'string') {
            const phoneNumber = isValidPhoneNumber(formattedColumnValue);
            if (phoneNumber) {
              formattedColumnValue = (
                <Link
                  href={`tel://${formattedColumnValue}`}
                  underline="none"
                  color="inherit"
                  noWrap
                  sx={{ display: 'block', maxWidth: '100%' }}
                >
                  <CountryFieldValue
                    countryCode={
                      PhoneNumberUtil.getRegionCodeForCountryCode(
                        phoneNumber.getCountryCode()!
                      ) as CountryCode
                    }
                    countryLabel={systemStandardPhoneNumberFormat(
                      formattedColumnValue
                    )}
                    FieldValueProps={{
                      noWrap: true,
                      sx: {
                        fontWeight: 'normal',
                        whiteSpace: 'nowrap',
                        color: 'inherit',
                      },
                    }}
                  />
                </Link>
              );
            }
          }
          break;
        case 'email':
          if (
            typeof formattedColumnValue === 'string' &&
            yup.string().email().isValidSync(formattedColumnValue)
          ) {
            formattedColumnValue = (
              <Link
                href={`mailto:${formattedColumnValue}`}
                underline="hover"
                color="inherit"
                noWrap
                sx={{ display: 'block', maxWidth: '100%' }}
              >
                {formattedColumnValue}
              </Link>
            );
          }
          break;
        case 'enum':
          if (textTransform) {
            formattedColumnValue =
              String(formattedColumnValue).toTitleCase(true);
          }
          break;
        case 'boolean':
          if (textTransform) {
            formattedColumnValue = formattedColumnValue ? 'Yes' : 'No';
          }
          break;
      }
    }
    if (formattedColumnValue == null) {
      formattedColumnValue = defaultColumnValue ?? <>&nbsp;</>;
    }
    return { formattedColumnValue, baseColumnValue: (row as any)[id] };
  })();

  const formattedColumnValueElement = (() => {
    if (isValidElement(formattedColumnValue)) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems={({ left: 'start', right: 'end' } as any)[align] || align}
        >
          {formattedColumnValue}
        </Box>
      );
    }
    return formattedColumnValue;
  })();

  return (
    <TableCell
      ref={ref}
      {...{ align }}
      className={clsx(classes.root)}
      onClick={(event) => {
        onClickColumn && onClickColumn(row, column);
        onClick && onClick(event);
      }}
      sx={{
        py: 1,
        px: 3,
        cursor: onClickColumn ? 'pointer' : 'inherit',
        position: 'relative',
        overflow: 'hidden',
        ['&:before']: {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: `calc(100% + 1px)`,
          pointerEvents: 'none',
        },
        ...(() => {
          if (type === 'ellipsisMenuTool') {
            return {
              bgcolor: palette.background.paper,
            };
          }
        })(),
        ...(() => {
          if (editMode) {
            return {
              p: 0,
            };
          }
        })(),
        ...sx,
        ...(bodySx as any),
      }}
    >
      <FieldValue
        {...columnTypographyPropsRest}
        {...{
          editable,
          editMode,
          fieldValueEditor,
          onFieldValueUpdated,
          editField,
          validationRules,
        }}
        editField={(() => {
          if (getEditField) {
            return getEditField(row, column);
          }
          return editField;
        })()}
        editableValue={baseColumnValue}
        onChangeEditMode={(editMode) => setEditMode(editMode)}
        type={mapTableColumnTypeToExoticDataType(type)}
      >
        {formattedColumnValueElement}
      </FieldValue>
    </TableCell>
  );
});

export default TableBodyColumn;
