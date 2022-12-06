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
import { forwardRef, isValidElement, useState } from 'react';
import * as yup from 'yup';

import { CountryCode } from '../../interfaces/Countries';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../../utils/PhoneNumberUtil';
import { mapTableColumnTypeToPrimitiveDataType } from '../../utils/Table';
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
    editable = false,
    onClick,
    row,
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

  const [editMode, setEditMode] = useState(false);
  const { palette } = useTheme();

  const columnValue = (() => {
    let columnValue = (() => {
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
      columnValue != null &&
      allowedDataTypes.includes(typeof columnValue)
    ) {
      switch (type) {
        case 'date':
          if (textTransform) {
            columnValue = formatDate(columnValue);
          }
          break;
        case 'dateTime':
          if (textTransform) {
            columnValue = formatDate(columnValue, true);
          }
          break;
        case 'time':
          if (textTransform) {
            const date = new Date(columnValue);
            columnValue = isNaN(date.getTime()) ? '' : format(date, 'hh:mm aa');
          }
          break;
        case 'currency':
        case 'percentage':
          columnValue = parseFloat(columnValue);
          columnValue = addThousandCommas(columnValue, decimalPlaces || true);
          break;
        case 'number':
          columnValue = addThousandCommas(columnValue);
          break;
        case 'phoneNumber':
          if (typeof columnValue === 'string') {
            const phoneNumber = isValidPhoneNumber(columnValue);
            if (phoneNumber) {
              columnValue = (
                <Link
                  href={`tel://${columnValue}`}
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
                    countryLabel={systemStandardPhoneNumberFormat(columnValue)}
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
            typeof columnValue === 'string' &&
            yup.string().email().isValidSync(columnValue)
          ) {
            columnValue = (
              <Link
                href={`mailto:${columnValue}`}
                underline="hover"
                color="inherit"
                noWrap
                sx={{ display: 'block', maxWidth: '100%' }}
              >
                {columnValue}
              </Link>
            );
          }
          break;
        case 'enum':
          if (textTransform) {
            columnValue = String(columnValue).toTitleCase(true);
          }
          break;
        case 'boolean':
          if (textTransform) {
            columnValue = columnValue ? 'Yes' : 'No';
          }
          break;
      }
    }
    if (columnValue == null) {
      columnValue = defaultColumnValue ?? <>&nbsp;</>;
    }
    return columnValue;
  })();

  const columnValueElement = (() => {
    if (isValidElement(columnValue)) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems={({ left: 'start', right: 'end' } as any)[align] || align}
        >
          {columnValue}
        </Box>
      );
    }
    return columnValue;
  })();

  return (
    <TableCell
      ref={ref}
      {...{ align }}
      className={clsx(classes.root)}
      onClick={(event) => {
        onClickColumn && onClickColumn(row);
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
        {...{ editable, editMode }}
        onChangeEditMode={(editMode) => setEditMode(editMode)}
        type={mapTableColumnTypeToPrimitiveDataType(type)}
      >
        {columnValueElement}
      </FieldValue>
    </TableCell>
  );
});

export default TableBodyColumn;
