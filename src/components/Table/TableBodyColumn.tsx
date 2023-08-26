import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
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
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import formatDate from 'date-fns/format';
import { result } from 'lodash';
import { forwardRef, useEffect, useState } from 'react';
import * as yup from 'yup';

import FieldValue from '../FieldValue';
import PhoneNumberFieldValue from '../PhoneNumberFieldValue';
import TimeStampDisplay from '../TimeStampDisplay';
import { BaseDataRow, TableColumn } from './models';
import { mapTableColumnTypeToExoticDataType } from './utils';

export interface TableBodyColumnClasses {
  /** Styles applied to the root element. */
  root: string;
  groupHeaderColumn: string;
  opaque: string;
}

export type TableBodyColumnClassKey = keyof TableBodyColumnClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyColumn: TableBodyColumnProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyColumn: keyof TableBodyColumnClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyColumn?: {
      defaultProps?: ComponentsProps['MuiTableBodyColumn'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyColumn'];
      variants?: ComponentsVariants['MuiTableBodyColumn'];
    };
  }
}
//#endregion

export const getTableBodyColumnUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTableBodyColumn', slot);
};

const slots: Record<TableBodyColumnClassKey, [TableBodyColumnClassKey]> = {
  root: ['root'],
  groupHeaderColumn: ['groupHeaderColumn'],
  opaque: ['opaque'],
};

export const tableBodyColumnClasses: TableBodyColumnClasses =
  generateUtilityClasses(
    'MuiTableBodyColumn',
    Object.keys(slots) as TableBodyColumnClassKey[]
  );

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

export interface TableBodyColumnProps<DataRow extends BaseDataRow = any>
  extends TableColumn,
    Partial<Pick<TableCellProps, 'onClick'>> {
  column: TableColumn<DataRow>;
  row: DataRow;
  enableSmallScreenOptimization?: boolean;
}

export const TableBodyColumn = forwardRef<any, TableBodyColumnProps<any>>(
  function TableBodyColumn(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTableBodyColumn' });
    const { className, id, align = 'left', sx, column } = props;

    const {
      onClickColumn,
      bodySx,
      getColumnValue,
      textTransform,
      type,
      columnTypographyProps = {},
      getColumnTypographyProps,
      defaultColumnValue,
      decimalPlaces,
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
      enableSmallScreenOptimization = false,
      showBodyContent = true,
      colSpan,
      isGroupHeaderColumn = false,
      opaque,
      getToolTipWrappedColumnNode,
      wrapColumnContentInFieldValue = true,
    } = { ...props, ...column };

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
    const { breakpoints } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

    useEffect(() => {
      if (editModeProp != null) {
        setEditMode(editModeProp);
      }
    }, [editModeProp]);

    const { baseColumnValue, formattedColumnValue } = (() => {
      if (!showBodyContent) {
        return {
          baseColumnValue: null,
          formattedColumnValue: null,
        };
      }
      let formattedColumnValue = (() => {
        if (getColumnValue) {
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
                createDateWithoutTimezoneOffset(formattedColumnValue),
                dateFormat
              );
            }
            break;
          case 'dateTime':
            if (textTransform && dateTimeFormat) {
              formattedColumnValue = formatDate(
                createDateWithoutTimezoneOffset(formattedColumnValue),
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
                <TimeStampDisplay
                  timestamp={formattedColumnValue}
                  sentenceCase
                />
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

    const tableColumnNode = (() => {
      const tableColumnContentElement = (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            ...(() => {
              if (!enableSmallScreenOptimization || !isSmallScreenSize) {
                return {
                  alignItems:
                    ({ left: 'start', right: 'end' } as any)[align] || align,
                };
              }
            })(),
            minWidth: 0,
          }}
        >
          {(() => {
            if (formattedColumnValue) {
              if (wrapColumnContentInFieldValue) {
                return (
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
                    showDefaultValue={false}
                    sx={{
                      ...columnTypographyPropsSx,
                    }}
                  >
                    {formattedColumnValue}
                  </FieldValue>
                );
              }
              return formattedColumnValue;
            }
          })()}
        </Box>
      );

      if (enableSmallScreenOptimization && isSmallScreenSize) {
        return tableColumnContentElement;
      }

      return (
        <TableCell
          ref={ref}
          {...{ align, colSpan }}
          className={clsx([
            classes.root,
            isGroupHeaderColumn && classes.groupHeaderColumn,
            opaque && classes.opaque,
          ])}
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
          {tableColumnContentElement}
        </TableCell>
      );
    })();

    if (getToolTipWrappedColumnNode) {
      return getToolTipWrappedColumnNode(tableColumnNode, row);
    }

    return tableColumnNode;
  }
);

export default TableBodyColumn;
