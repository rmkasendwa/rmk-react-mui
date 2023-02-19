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
import formatDate from 'date-fns/format';
import { result } from 'lodash';
import { forwardRef, useEffect, useState } from 'react';
import * as yup from 'yup';

import { mapTableColumnTypeToExoticDataType } from '../../utils/Table';
import EllipsisMenuIconButton, {
  EllipsisMenuIconButtonProps,
} from '../EllipsisMenuIconButton';
import FieldValue from '../FieldValue';
import PhoneNumberFieldValue from '../PhoneNumberFieldValue';
import TimeStampDisplay from '../TimeStampDisplay';
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

export interface TableBodyColumnProps<
  RowObject extends Record<string, any> = any
> extends TableColumn,
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
    getColumnTypographyProps,
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
    getEditableColumnValue,
    validationRules,
    dateFormat,
    dateTimeFormat,
    defaultCountryCode,
    noWrap,
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

  const { sx: columnTypographyPropsSx, ...columnTypographyPropsRest } = {
    ...columnTypographyProps,
    ...(() => {
      if (getColumnTypographyProps) {
        return getColumnTypographyProps(row);
      }
    })(),
  };

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
      return result(row, id) as any;
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
          if (textTransform && dateFormat) {
            formattedColumnValue = formatDate(
              new Date(formattedColumnValue),
              dateFormat
            );
          }
          break;
        case 'dateTime':
          if (textTransform && dateTimeFormat) {
            formattedColumnValue = formatDate(
              new Date(formattedColumnValue),
              dateTimeFormat
            );
          }
          break;
        case 'time':
          if (textTransform) {
            const date = new Date(formattedColumnValue);
            formattedColumnValue = isNaN(date.getTime())
              ? ''
              : formatDate(date, 'hh:mm aa');
          }
          break;
        case 'timestamp':
          if (
            (textTransform && typeof formattedColumnValue === 'string') ||
            typeof formattedColumnValue === 'number'
          ) {
            formattedColumnValue = (
              <TimeStampDisplay timestamp={formattedColumnValue} sentenceCase />
            );
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
            formattedColumnValue = (
              <PhoneNumberFieldValue
                phoneNumber={formattedColumnValue}
                countryCode={defaultCountryCode}
              />
            );
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: ({ left: 'start', right: 'end' } as any)[align] || align,
          minWidth: 0,
        }}
      >
        <FieldValue
          {...{
            editable,
            editMode,
            onFieldValueUpdated,
            editField,
            validationRules,
            noWrap,
          }}
          {...columnTypographyPropsRest}
          editField={(() => {
            if (getEditField) {
              return getEditField(row, column);
            }
            return editField;
          })()}
          editableValue={(() => {
            const editableValue = (() => {
              if (getEditableColumnValue) {
                return getEditableColumnValue(row, column);
              }
              return baseColumnValue;
            })();
            return editableValue ?? null;
          })()}
          fieldValueEditor={(() => {
            if (fieldValueEditor) {
              return (updatedValue) => {
                return fieldValueEditor(row, updatedValue, column);
              };
            }
          })()}
          onChangeEditMode={(editMode) => setEditMode(editMode)}
          type={mapTableColumnTypeToExoticDataType(type)}
          sx={{
            ...columnTypographyPropsSx,
          }}
        >
          {formattedColumnValue}
        </FieldValue>
      </Box>
    </TableCell>
  );
});

export default TableBodyColumn;
