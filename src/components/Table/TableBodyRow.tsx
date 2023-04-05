import {
  Badge,
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Stack,
  Typography,
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
import { Fragment, useEffect, useMemo, useRef } from 'react';

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
  groupHeaderColumn: string;
}

export type TableBodyRowClassKey = keyof TableBodyRowClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyRow: TableBodyRowProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyRow: keyof TableBodyRowClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyRow?: {
      defaultProps?: ComponentsProps['MuiTableBodyRow'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyRow'];
      variants?: ComponentsVariants['MuiTableBodyRow'];
    };
  }
}

export interface TableBodyRowProps<DataRow extends BaseDataRow = any>
  extends Partial<Omit<MuiTableRowProps, 'defaultValue'>>,
    TableRowProps<DataRow> {
  enableSmallScreenOptimization?: boolean;
}

export function getTableBodyRowUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableBodyRow', slot);
}

export const tableBodyRowClasses: TableBodyRowClasses = generateUtilityClasses(
  'MuiTableBodyRow',
  ['root', 'smallScreen', 'groupHeaderColumn']
);

const slots = {
  root: ['root'],
  smallScreen: ['smallScreen'],
  groupHeaderColumn: ['groupHeaderColumn'],
};

export const TableBodyRow = <T extends BaseDataRow>(
  inProps: TableBodyRowProps<T>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableBodyRow' });
  const {
    columns: inputColumns,
    row,
    getRowProps,
    generateRowData,
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
  const generateRowDataRef = useRef(generateRowData);
  useEffect(() => {
    getRowPropsRef.current = getRowProps;
    generateRowDataRef.current = generateRowData;
  }, [generateRowData, getRowProps]);

  const { components, breakpoints, palette, spacing } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { rowProps } = useMemo(() => {
    return {
      rowProps: (() => {
        if (getRowPropsRef.current) {
          return getRowPropsRef.current(row) || {};
        }
        return {};
      })(),
      ...(() => {
        if (generateRowDataRef.current) {
          return Object.fromEntries(
            Object.entries(generateRowDataRef.current(row)).filter(
              ([, value]) => value != null
            )
          );
        }
        return {};
      })(),
    };
  }, [row]);

  const { sx: rowPropsSx, ...rowPropsRest } = rowProps;

  const isGroupHeader =
    row.GroupingProps && 'isGroupHeader' in row.GroupingProps;
  const isClickable = Boolean(onClickRow && !isGroupHeader);

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
    const [highestPriorityColumn, ...restColumns] = importantColumns;
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
          isGroupHeader && classes.groupHeaderColumn
        )}
        container
        onClick={() => {
          if (isClickable && onClickRow) {
            onClickRow(row);
          }
        }}
        sx={{
          alignItems: 'center',
          cursor: isClickable ? 'pointer' : 'inherit',
          py: 2,
          pl: `calc(${spacing(2)} + ${indentLevel * 24}px)`,
          pr: 1,
        }}
      >
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
          }}
        >
          <Stack
            sx={{
              gap: 1,
            }}
          >
            <TableBodyColumn
              key={String(id)}
              {...{ column, row, enableSmallScreenOptimization }}
              {...column}
              onClick={() => {
                if (
                  isClickable &&
                  onClickRow &&
                  propagateClickToParentRowClickEvent
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
            {(() => {
              if (!isGroupHeader && restColumns.length > 0) {
                return (
                  <Grid
                    container
                    sx={{
                      gap: 1,
                      flexWrap: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {restColumns.slice(0, 3).map((column, index) => {
                      const {
                        id,
                        sx,
                        decimalPlaces = rowDecimalPlaces,
                        textTransform = rowTextTransform,
                        defaultColumnValue = rowDefaultColumnValue,
                        editable = rowEditable,
                        dateFormat = defaultDateFormat,
                        dateTimeFormat = defaultDateTimeFormat,
                        defaultCountryCode = rowDefaultCountryCode,
                        noWrap = rowNoWrap,
                      } = column;
                      return (
                        <Fragment key={index}>
                          {index > 0 ? (
                            <Grid
                              item
                              sx={{
                                flex: 'none',
                              }}
                            >
                              &bull;
                            </Grid>
                          ) : null}
                          <Grid
                            item
                            sx={{
                              flex: 'none',
                            }}
                          >
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
                                sx,
                                enableSmallScreenOptimization,
                              }}
                              {...column}
                            />
                          </Grid>
                        </Fragment>
                      );
                    })}
                  </Grid>
                );
              }
            })()}
          </Stack>
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
                  }}
                  {...ellipsisMenuToolColumn}
                  column={ellipsisMenuToolColumn}
                  onClick={() => {
                    if (
                      isClickable &&
                      onClickRow &&
                      propagateClickToParentRowClickEvent
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
      className={clsx(classes.root, isGroupHeader && classes.groupHeaderColumn)}
      hover
      sx={{
        verticalAlign: 'top',
        cursor: isClickable ? 'pointer' : 'inherit',
        ...(() => {
          if (row.GroupingProps && 'isGroupHeader' in row.GroupingProps) {
            return {
              position: 'sticky',
              top: 48,
              zIndex: 2,
              boxShadow: `0 -1px 2px -1px ${palette.divider}`,
            };
          }
        })(),
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
            }}
            {...column}
            onClick={() => {
              if (
                isClickable &&
                onClickRow &&
                propagateClickToParentRowClickEvent
              ) {
                onClickRow(row);
              }
            }}
            sx={{
              ...getColumnPaddingStyles({
                index,
                columnCount: columns.length,
              }),
              ...getColumnWidthStyles({
                ...column,
                minWidth: minWidth ?? minColumnWidth,
              }),
              ...sx,
            }}
          />
        );
      })}
    </TableRow>
  );
};

export default TableBodyRow;
