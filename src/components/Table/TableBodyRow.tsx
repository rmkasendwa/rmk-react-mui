import {
  Badge,
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Stack,
  Typography,
  badgeClasses,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  lighten,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import TableRow, {
  TableRowProps as MuiTableRowProps,
} from '@mui/material/TableRow';
import clsx from 'clsx';
import { result } from 'lodash';
import { useRef } from 'react';

import { isElementInteractive } from '../../utils/html';
import {
  BaseDataRow,
  DEFAULT_GROUP_LABEL,
  ELLIPSIS_MENU_TOOL_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  TableRowProps,
} from './models';
import TableBodyColumn from './TableBodyColumn';
import TableGroupCollapseTool from './TableGroupCollapseTool';
import { getColumnPaddingStyles, getColumnWidthStyles } from './utils';

export interface TableBodyRowClasses {
  /** Styles applied to the root element. */
  root: string;
  smallScreen: string;
  groupHeaderRow: string;
}

export type TableBodyRowClassKey = keyof TableBodyRowClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyRow: TableBodyRowProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyRow: keyof TableBodyRowClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyRow?: {
      defaultProps?: ComponentsProps['MuiTableBodyRow'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyRow'];
      variants?: ComponentsVariants['MuiTableBodyRow'];
    };
  }
}
//#endregion

export const getTableBodyRowUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTableBodyRow', slot);
};

const slots: Record<TableBodyRowClassKey, [TableBodyRowClassKey]> = {
  root: ['root'],
  smallScreen: ['smallScreen'],
  groupHeaderRow: ['groupHeaderRow'],
};

export const tableBodyRowClasses: TableBodyRowClasses = generateUtilityClasses(
  'MuiTableBodyRow',
  Object.keys(slots) as TableBodyRowClassKey[]
);

export interface TableBodyRowProps<DataRow extends BaseDataRow = any>
  extends Partial<Omit<MuiTableRowProps, 'defaultValue'>>,
    TableRowProps<DataRow> {
  enableSmallScreenOptimization?: boolean;
  applyCellWidthParameters?: boolean;
}

export const TableBodyRow = <T extends BaseDataRow>(
  inProps: TableBodyRowProps<T>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableBodyRow' });
  const {
    columns: inputColumns,
    row,
    getRowProps,
    decimalPlaces: rowDecimalPlaces,
    textTransform: rowTextTransform = false,
    editable: rowEditable,
    onClickRow,
    sx,
    defaultColumnValue: rowDefaultColumnValue,
    columnTypographyProps,
    minColumnWidth,
    className,
    defaultDateFormat,
    defaultDateTimeFormat,
    defaultCountryCode: rowDefaultCountryCode,
    noWrap: rowNoWrap,
    enableSmallScreenOptimization = false,
    getToolTipWrappedColumnNode,
    opaque,
    applyCellWidthParameters = true,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTableBodyRowUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  // Refs
  const getRowPropsRef = useRef(getRowProps);
  getRowPropsRef.current = getRowProps;

  const { components, breakpoints, palette, spacing } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { rowProps } = (() => {
    return {
      rowProps: (() => {
        if (getRowPropsRef.current) {
          return getRowPropsRef.current(row) || {};
        }
        return {};
      })(),
    };
  })();

  const {
    sx: rowPropsSx,
    isClickable: rowPropsIsClickable = true,
    opaque: rowPropsOpaque,
    ...rowPropsRest
  } = rowProps;

  const isGroupHeader =
    row.GroupingProps && 'isGroupHeader' in row.GroupingProps;
  const isClickable = Boolean(
    rowPropsIsClickable && onClickRow && !isGroupHeader
  );

  if (enableSmallScreenOptimization && isSmallScreenSize) {
    const columns = (() => {
      if (row.GroupingProps) {
        if ('isGroupHeader' in row.GroupingProps) {
          const {
            groupLabel,
            groupCollapsed,
            childrenCount,
            onChangeGroupCollapsed,
          } = row.GroupingProps;
          const [firstColumn] = inputColumns;

          return [
            {
              ...firstColumn,
              getColumnValue: () => {
                return (
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      flexWrap: 'nowrap',
                    }}
                  >
                    <TableGroupCollapseTool
                      {...{ groupCollapsed, onChangeGroupCollapsed }}
                    />
                    <Typography
                      component="div"
                      variant="inherit"
                      noWrap
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      {groupLabel || DEFAULT_GROUP_LABEL}
                    </Typography>
                    <Badge
                      color="default"
                      badgeContent={childrenCount}
                      max={999}
                      sx={{
                        [`&>.${badgeClasses.badge}`]: {
                          position: 'relative',
                          transform: 'none',
                          bgcolor: (palette.mode === 'dark' ? lighten : darken)(
                            palette.background.paper,
                            0.1
                          ),
                          ml: 1,
                        },
                      }}
                    />
                  </Stack>
                );
              },
              isGroupHeaderColumn: true,
            },
          ] as typeof inputColumns;
        }
      }
      return inputColumns;
    })();

    const indentLevel = (() => {
      if (row.GroupingProps) {
        if ('isGroupHeader' in row.GroupingProps) {
          return row.GroupingProps.indentLevel;
        } else {
          return row.GroupingProps.parentGroupIndentLevel + 1;
        }
      }
      return 0;
    })();

    const importantColumns = columns.filter(
      ({ holdsPriorityInformation = true }) => {
        return holdsPriorityInformation;
      }
    );
    const [highestPriorityColumn] = importantColumns;
    const {
      id,
      sx,
      propagateClickToParentRowClickEvent = true,
      decimalPlaces = rowDecimalPlaces,
      textTransform = rowTextTransform,
      defaultColumnValue = rowDefaultColumnValue,
      editable = rowEditable,
      dateFormat = defaultDateFormat,
      dateTimeFormat = defaultDateTimeFormat,
      defaultCountryCode = rowDefaultCountryCode,
      noWrap = rowNoWrap,
      getColumnValue,
    } = highestPriorityColumn;
    const ellipsisMenuToolColumn = columns.find(({ id }) => {
      return id === ELLIPSIS_MENU_TOOL_COLUMN_ID;
    });
    const rowNumberColumn = columns.find(({ id }) => {
      return id === ROW_NUMBER_COLUMN_ID;
    });

    const shouldPropagateClickToParentRowClickEvent = (() => {
      if (typeof propagateClickToParentRowClickEvent === 'function') {
        return propagateClickToParentRowClickEvent(row);
      }
      return propagateClickToParentRowClickEvent;
    })();

    const column: typeof highestPriorityColumn = {
      ...highestPriorityColumn,
      columnTypographyProps,
      decimalPlaces,
      textTransform,
      defaultColumnValue,
      editable,
      dateFormat,
      dateTimeFormat,
      defaultCountryCode,
      noWrap,
      sx,
      getColumnValue: (row) => {
        return (
          <>
            {(() => {
              if (rowNumberColumn && rowNumberColumn.getColumnValue) {
                return (
                  <>
                    {rowNumberColumn.getColumnValue(row, rowNumberColumn)}&nbsp;
                  </>
                );
              }
            })()}
            {(() => {
              if (getColumnValue) {
                return getColumnValue(row, highestPriorityColumn);
              }
              return result(row, id);
            })()}
          </>
        );
      },
    };
    return (
      <Grid
        {...rest}
        className={clsx(
          classes.root,
          classes.smallScreen,
          isGroupHeader && classes.groupHeaderRow
        )}
        container
        onClick={(event) => {
          if (
            isClickable &&
            onClickRow &&
            !isElementInteractive(event.target as HTMLElement)
          ) {
            onClickRow(row);
          }
        }}
        sx={{
          alignItems: 'center',
          cursor: isClickable ? 'pointer' : 'inherit',
          py: 1,
          pl: `calc(${spacing(2)} + ${indentLevel * 24}px)`,
          ...(() => {
            if (!ellipsisMenuToolColumn) {
              return {
                pr: 1,
              };
            }
          })(),
        }}
      >
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
          }}
        >
          <TableBodyColumn
            key={String(id)}
            {...{
              column,
              row,
              enableSmallScreenOptimization,
              getToolTipWrappedColumnNode,
            }}
            {...{
              opaque: opaque ?? rowPropsOpaque,
            }}
            {...column}
            onClick={(event) => {
              if (
                isClickable &&
                onClickRow &&
                !isElementInteractive(event.target as HTMLElement) &&
                shouldPropagateClickToParentRowClickEvent
              ) {
                onClickRow(row);
              }
            }}
            columnTypographyProps={{
              noWrap,
              sx: {
                fontSize: 16,
              },
            }}
          />
        </Grid>
        {(() => {
          if (ellipsisMenuToolColumn) {
            const {
              id,
              sx,
              propagateClickToParentRowClickEvent = true,
              decimalPlaces = rowDecimalPlaces,
              textTransform = rowTextTransform,
              defaultColumnValue = rowDefaultColumnValue,
              editable = rowEditable,
              dateFormat = defaultDateFormat,
              dateTimeFormat = defaultDateTimeFormat,
              defaultCountryCode = rowDefaultCountryCode,
              noWrap = rowNoWrap,
            } = ellipsisMenuToolColumn;

            const shouldPropagateClickToParentRowClickEvent = (() => {
              if (typeof propagateClickToParentRowClickEvent === 'function') {
                return propagateClickToParentRowClickEvent(row);
              }
              return propagateClickToParentRowClickEvent;
            })();

            return (
              <Grid item>
                <TableBodyColumn
                  key={String(id)}
                  {...({} as any)}
                  {...{
                    row,
                    columnTypographyProps,
                    decimalPlaces,
                    textTransform,
                    defaultColumnValue,
                    editable,
                    dateFormat,
                    dateTimeFormat,
                    defaultCountryCode,
                    noWrap,
                    sx,
                    enableSmallScreenOptimization,
                    getToolTipWrappedColumnNode,
                  }}
                  {...{
                    opaque: opaque ?? rowPropsOpaque,
                  }}
                  {...ellipsisMenuToolColumn}
                  column={ellipsisMenuToolColumn}
                  onClick={(event) => {
                    if (
                      isClickable &&
                      onClickRow &&
                      !isElementInteractive(event.target as HTMLElement) &&
                      shouldPropagateClickToParentRowClickEvent
                    ) {
                      onClickRow(row);
                    }
                  }}
                />
              </Grid>
            );
          }
        })()}
      </Grid>
    );
  }

  const columns = (() => {
    if (row.GroupingProps) {
      if ('isGroupHeader' in row.GroupingProps) {
        const {
          groupLabel,
          indentLevel,
          groupCollapsed,
          onChangeGroupCollapsed,
          childrenCount,
        } = row.GroupingProps;
        const [firstColumn, secondColumn, ...restColumns] = inputColumns;

        return [
          {
            ...firstColumn,
            getColumnValue: () => {
              return (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                  }}
                >
                  {(() => {
                    if (indentLevel > 0) {
                      return (
                        <Box
                          sx={{
                            width: indentLevel * 24,
                            flex: 'none',
                          }}
                        />
                      );
                    }
                  })()}
                  <TableGroupCollapseTool
                    {...{ groupCollapsed, onChangeGroupCollapsed }}
                  />
                  <Typography
                    component="div"
                    variant="inherit"
                    noWrap
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {groupLabel || DEFAULT_GROUP_LABEL}
                  </Typography>
                  <Badge
                    color="default"
                    badgeContent={childrenCount}
                    max={999}
                    sx={{
                      '&>.MuiBadge-badge': {
                        position: 'relative',
                        transform: 'none',
                        bgcolor: (palette.mode === 'dark' ? lighten : darken)(
                          palette.background.paper,
                          0.1
                        ),
                        ml: 1,
                      },
                    }}
                  />
                </Stack>
              );
            },
            isGroupHeaderColumn: true,
          },
          {
            ...secondColumn,
            isGroupHeaderColumn: true,
            showBodyContent: false,
            opaque: true,
            colSpan: restColumns.length + 1,
          },
        ] as typeof inputColumns;
      } else {
        const { parentGroupIndentLevel } = row.GroupingProps;
        const [firstColumn, ...restColumns] = inputColumns;
        const { getColumnValue, id } = firstColumn;
        return [
          {
            ...firstColumn,
            getColumnValue: (localRow, column) => {
              return (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                  }}
                >
                  <>
                    <Box
                      sx={{
                        width: (parentGroupIndentLevel + 1) * 24,
                        flex: 'none',
                      }}
                    />
                    {(() => {
                      if (getColumnValue) {
                        return getColumnValue(localRow, column);
                      }
                      return result(row, id);
                    })()}
                  </>
                </Stack>
              );
            },
          } as typeof firstColumn,
          ...restColumns,
        ];
      }
    }
    return inputColumns;
  })();

  return (
    <TableRow
      {...rowPropsRest}
      {...rest}
      className={clsx(
        classes.root,
        className,
        rowPropsRest?.className,
        isGroupHeader && classes.groupHeaderRow
      )}
      hover
      sx={{
        verticalAlign: 'top',
        cursor: isClickable ? 'pointer' : 'inherit',
        ...(components?.MuiTableBodyRow?.styleOverrides?.root as any),
        ...rowPropsSx,
        ...sx,
      }}
    >
      {columns.map((column, index) => {
        const {
          id,
          sx,
          minWidth,
          propagateClickToParentRowClickEvent = true,
          decimalPlaces = rowDecimalPlaces,
          textTransform = rowTextTransform,
          defaultColumnValue = rowDefaultColumnValue,
          editable = rowEditable,
          dateFormat = defaultDateFormat,
          dateTimeFormat = defaultDateTimeFormat,
          defaultCountryCode = rowDefaultCountryCode,
          noWrap = rowNoWrap,
        } = column;

        const shouldPropagateClickToParentRowClickEvent = (() => {
          if (typeof propagateClickToParentRowClickEvent === 'function') {
            return propagateClickToParentRowClickEvent(row);
          }
          return propagateClickToParentRowClickEvent;
        })();

        return (
          <TableBodyColumn
            key={String(id)}
            {...({} as any)}
            {...{
              column,
              row,
              columnTypographyProps,
              decimalPlaces,
              textTransform,
              defaultColumnValue,
              editable,
              dateFormat,
              dateTimeFormat,
              defaultCountryCode,
              noWrap,
              getToolTipWrappedColumnNode,
            }}
            opaque={opaque ?? rowPropsOpaque}
            {...column}
            onClick={(event) => {
              if (
                isClickable &&
                onClickRow &&
                !isElementInteractive(event.target as HTMLElement) &&
                shouldPropagateClickToParentRowClickEvent
              ) {
                onClickRow(row);
              }
            }}
            sx={{
              ...getColumnPaddingStyles({
                index,
                columnCount: columns.length,
              }),
              ...(() => {
                if (applyCellWidthParameters) {
                  return getColumnWidthStyles({
                    ...column,
                    minWidth: minWidth ?? minColumnWidth,
                  });
                }
              })(),
              ...sx,
            }}
          />
        );
      })}
    </TableRow>
  );
};

export default TableBodyRow;
