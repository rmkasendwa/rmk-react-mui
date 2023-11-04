import '@infinite-debugger/rmk-js-extensions/Object';

import {
  Checkbox,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Stack,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import MuiBaseTable from '@mui/material/Table';
import { tableBodyClasses } from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow, { tableRowClasses } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, darken, lighten } from '@mui/system/colorManipulator';
import { SxProps } from '@mui/system/styleFunctionSx';
import clsx from 'clsx';
import { omit } from 'lodash';
import { Ref, useEffect, useMemo, useRef, useState } from 'react';

import { useGlobalConfiguration } from '../../../contexts/GlobalConfigurationContext';
import { useReactRouterDOMSearchParams } from '../../../hooks/ReactRouterDOM';
import { SortDirection, SortOptions } from '../../../models/Sort';
import { BLACK_COLOR } from '../../../theme';
import { sort } from '../../../utils/Sort';
import EllipsisMenuIconButton from '../../EllipsisMenuIconButton';
import Tooltip from '../../Tooltip';
import {
  BaseDataRow,
  CHECKBOX_COLUMN_ID,
  ELLIPSIS_MENU_TOOL_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  TableProps,
  tableSearchParamValidationSpec,
} from '../models';
import TableBody, { TableBodyProps } from '../TableBody';
import { tableBodyColumnClasses } from '../TableBodyColumn';
import { tableBodyRowClasses } from '../TableBodyRow';
import TableColumnToggleIconButton from '../TableColumnToggleIconButton';
import TableGroupCollapseTool from '../TableGroupCollapseTool';
import {
  expandTableColumnWidths,
  getColumnWidthStyles,
  getComputedTableProps,
  getTableMinWidth,
  mapTableColumnTypeToPrimitiveDataType,
} from '../utils';

export interface TableClasses {
  /** Styles applied to the root element. */
  root: string;
  columnDisplayToggle: string;
  startStickyColumnDivider: string;
  startStickyColumnDividerActive: string;
  emptyRowsCell: string;
}

export type TableClassKey = keyof TableClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableExtended: TableProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableExtended: keyof TableClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableExtended?: {
      defaultProps?: ComponentsProps['MuiTableExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableExtended'];
      variants?: ComponentsVariants['MuiTableExtended'];
    };
  }
}
//#endregion

export const getTableUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTableExtended', slot);
};

const slots: Record<TableClassKey, [TableClassKey]> = {
  root: ['root'],
  columnDisplayToggle: ['columnDisplayToggle'],
  startStickyColumnDivider: ['startStickyColumnDivider'],
  startStickyColumnDividerActive: ['startStickyColumnDividerActive'],
  emptyRowsCell: ['emptyRowsCell'],
};

export const tableClasses: TableClasses = generateUtilityClasses(
  'MuiTableExtended',
  Object.keys(slots) as TableClassKey[]
);

const TABLE_HEAD_ALPHA = 0.05;

export const useTable = <DataRow extends BaseDataRow>(
  inProps: TableProps<DataRow>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableExtended' });
  const {
    onClickRow,
    columns: columnsProp,
    rows = [],
    rowStartIndex = 0,
    labelPlural = 'Records',
    forEachRowProps,
    variant = 'plain',
    bordersVariant = 'rows',
    showHeaderRow = true,
    showDataRows = true,
    HeaderRowProps = {},
    SecondaryHeaderRowProps = {},
    decimalPlaces,
    textTransform,
    stickyHeader = false,
    TableBodyRowPlaceholderProps = {},
    TableHeadProps = {},
    ColumnDisplayToggleProps = {},
    defaultColumnValue,
    columnTypographyProps,
    minColumnWidth,
    editable,
    className,
    sortable = false,
    handleSortOperations = true,
    sortBy: sortByProp,
    onChangeSortBy,
    enableColumnDisplayToggle = false,
    selectedColumnIds: selectedColumnIdsProp,
    onChangeSelectedColumnIds,
    enableCheckboxRowSelectors = false,
    enableCheckboxAllRowSelector = false,
    allRowsChecked: allRowsCheckedProp = false,
    checkedRowIds: checkedRowIdsProp,
    onChangeCheckedRowIds: onChangeCheckedRowIdsProp,
    enableSmallScreenOptimization = false,
    showRowNumber = false,
    defaultCountryCode,
    currencyCode,
    noWrap,
    getDisplayingColumns,
    getEllipsisMenuToolProps,
    isGroupedTable = false,
    TableGroupingProps,
    getToolTipWrappedColumnNode,
    startStickyColumnIndex,
    showStartStickyColumnDivider = false,
    staticRows,
    onChangeMinWidth,
    lazyRows,
    controlZIndex = true,
    highlightRowOnHover = true,
    scrollableElementRef,
    id,
    clearSearchStateOnUnmount,
    sx,
    tableBodyRowHeight,
    ...rest
  } = omit(
    props,
    'lowercaseLabelPlural',
    'parentBackgroundColor',
    'emptyRowsLabel',
    'defaultDateFormat',
    'defaultDateTimeFormat'
  ) as typeof props;

  let {
    lowercaseLabelPlural,
    parentBackgroundColor,
    emptyRowsLabel,
    defaultDateFormat,
    defaultDateTimeFormat,
  } = props;

  const classes = composeClasses(
    slots,
    getTableUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: TableHeadPropsSx, ...TableHeadPropsRest } = TableHeadProps;
  const { sx: ColumnDisplayTogglePropsSx, ...ColumnDisplayTogglePropsRest } =
    ColumnDisplayToggleProps;
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());
  emptyRowsLabel || (emptyRowsLabel = `No ${lowercaseLabelPlural} found`);

  const { dateFormat: globalDateFormat, dateTimeFormat: globalDateTimeFormat } =
    useGlobalConfiguration();

  defaultDateFormat || (defaultDateFormat = globalDateFormat);
  defaultDateTimeFormat || (defaultDateTimeFormat = globalDateTimeFormat);

  //#region Refs
  const tableHeaderElementRef = useRef<HTMLTableSectionElement | null>(null);
  const onChangeSelectedColumnIdsRef = useRef(onChangeSelectedColumnIds);
  onChangeSelectedColumnIdsRef.current = onChangeSelectedColumnIds;
  const onChangeCheckedRowIdsRef = useRef(onChangeCheckedRowIdsProp);
  onChangeCheckedRowIdsRef.current = onChangeCheckedRowIdsProp;
  const onChangeMinWidthRef = useRef(onChangeMinWidth);
  onChangeMinWidthRef.current = onChangeMinWidth;
  const startStickyColumnDividerElementRef = useRef<HTMLDivElement | null>();
  //#endregion

  const {
    searchParams: { selectedColumns: searchParamSelectedColumns },
    setSearchParams,
  } = useReactRouterDOMSearchParams({
    mode: 'json',
    spec: tableSearchParamValidationSpec,
    id,
    clearSearchStateOnUnmount,
  });

  const serializedColumnIds = JSON.stringify(
    selectedColumnIdsProp || columnsProp.map(({ id }) => id)
  );
  const selectedColumnIds = useMemo(() => {
    if (searchParamSelectedColumns) {
      return searchParamSelectedColumns;
    }
    return JSON.parse(serializedColumnIds);
  }, [searchParamSelectedColumns, serializedColumnIds]);

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { sx: HeaderRowPropsSx, ...HeaderRowPropsRest } = HeaderRowProps;
  const { sx: SecondaryHeaderRowPropsSx, ...SecondaryHeaderRowPropsRest } =
    SecondaryHeaderRowProps;
  const [sortBy, setSortBy] = useState<SortOptions<DataRow>>([]);

  const [tableHeaderHeight, setTableHeaderHeight] = useState(49);
  useEffect(() => {
    if (tableHeaderElementRef.current) {
      const tableHeaderElement = tableHeaderElementRef.current;
      const observer = new ResizeObserver(() => {
        setTableHeaderHeight(tableHeaderElement.clientHeight);
      });
      observer.observe(tableHeaderElement);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const [allRowsChecked, setAllRowsChecked] = useState(allRowsCheckedProp);
  const [checkedRowIds, setCheckedRowIds] = useState<string[]>(() => {
    return checkedRowIdsProp || [];
  });

  useEffect(() => {
    setAllRowsChecked(allRowsCheckedProp);
  }, [allRowsCheckedProp]);

  useEffect(() => {
    if (checkedRowIdsProp && !onChangeCheckedRowIdsRef.current) {
      setCheckedRowIds((prevCheckedRowIds) => {
        if (prevCheckedRowIds.join('') !== checkedRowIdsProp.join('')) {
          return checkedRowIdsProp;
        }
        return prevCheckedRowIds;
      });
    }
  }, [checkedRowIdsProp]);

  useEffect(() => {
    onChangeCheckedRowIdsRef.current &&
      onChangeCheckedRowIdsRef.current(checkedRowIds, allRowsChecked);
  }, [allRowsChecked, checkedRowIds]);

  useEffect(() => {
    selectedColumnIds &&
      onChangeSelectedColumnIdsRef.current?.(selectedColumnIds);
  }, [selectedColumnIds]);

  parentBackgroundColor || (parentBackgroundColor = palette.background.paper);

  // Setting default column properties
  const { allColumns, stickyColumnWidths } = (() => {
    const computedColumns: typeof columnsProp = [];
    const { columns: allColumns } = getComputedTableProps(props);
    const stickyColumnWidths: number[] = [];
    let localStartStickyColumnIndex = startStickyColumnIndex;

    if (enableCheckboxRowSelectors) {
      const checkboxColumn = allColumns.find(
        ({ id }) => id === CHECKBOX_COLUMN_ID
      );
      if (checkboxColumn) {
        localStartStickyColumnIndex ?? (localStartStickyColumnIndex = 0);
        localStartStickyColumnIndex += 1;
        stickyColumnWidths.push(checkboxColumn.width || 60);
        computedColumns.push({
          ...checkboxColumn,
          label: enableCheckboxAllRowSelector ? (
            <Box
              sx={{
                width: 60,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Checkbox
                checked={allRowsChecked}
                onChange={(event) => {
                  setAllRowsChecked(event.target.checked);
                  setCheckedRowIds([]);
                }}
                color="default"
              />
            </Box>
          ) : null,
          getColumnValue: ({ id: baseId }) => {
            const id = String(baseId);
            const checked = allRowsChecked || checkedRowIds.includes(id);
            return (
              <Box
                sx={{
                  width: 60,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Checkbox
                  {...{ checked }}
                  color="default"
                  onChange={() => {
                    setCheckedRowIds((prevCheckedRowIds) => {
                      const nextCheckedRowIds = [...prevCheckedRowIds];
                      if (nextCheckedRowIds.includes(id)) {
                        nextCheckedRowIds.splice(
                          nextCheckedRowIds.indexOf(id),
                          1
                        );
                      } else {
                        nextCheckedRowIds.push(id);
                      }
                      return nextCheckedRowIds;
                    });
                  }}
                />
              </Box>
            );
          },
        });
      }
    }

    if (showRowNumber) {
      const numberColumn = allColumns.find(
        ({ id }) => id === ROW_NUMBER_COLUMN_ID
      );
      if (numberColumn) {
        localStartStickyColumnIndex ?? (localStartStickyColumnIndex = 0);
        localStartStickyColumnIndex += 1;
        stickyColumnWidths.push(numberColumn.width || 60);
        computedColumns.push({
          ...numberColumn,
          getColumnValue: (record) => {
            return `${1 + rowStartIndex + sortedRows.indexOf(record)}.`;
          },
        });
      }
    }

    if (startStickyColumnIndex != null) {
      stickyColumnWidths.push(
        ...columnsProp
          .slice(0, startStickyColumnIndex + 1)
          .map(({ width, minWidth }) => {
            return width ?? minWidth ?? minColumnWidth ?? 0;
          })
      );
    }

    computedColumns.push(...columnsProp);

    if (getEllipsisMenuToolProps) {
      const ellipsisMenuToolColumn = allColumns.find(
        ({ id }) => id === ELLIPSIS_MENU_TOOL_COLUMN_ID
      );
      if (ellipsisMenuToolColumn) {
        computedColumns.push({
          ...ellipsisMenuToolColumn,
          getColumnValue: (row) => {
            const ellipsisMenuToolProps = getEllipsisMenuToolProps(row);
            if (ellipsisMenuToolProps) {
              return (
                <Box>
                  <EllipsisMenuIconButton {...ellipsisMenuToolProps} />
                </Box>
              );
            }
          },
        });
      }
    }

    if (localStartStickyColumnIndex != null && !isSmallScreenSize) {
      computedColumns
        .slice(0, localStartStickyColumnIndex + 1)
        .forEach((column, index) => {
          const baseSx = { ...column.sx };
          const baseHeaderSx = { ...column.headerSx };
          const baseBodySx = { ...column.bodySx };
          column.sx = {
            ...baseSx,
            position: 'sticky',
            left: stickyColumnWidths
              .slice(0, index)
              .reduce((accumulator, width) => {
                return accumulator + width;
              }, 0),
          };
          column.headerSx = {
            ...(() => {
              if (controlZIndex) {
                return {
                  zIndex: 5,
                };
              }
            })(),
            ...baseHeaderSx,
          };
          column.bodySx = {
            ...(() => {
              if (controlZIndex) {
                return {
                  zIndex: 1,
                };
              }
            })(),
            ...baseBodySx,
          };
          column.opaque = true;
        });
    }

    return {
      allColumns: expandTableColumnWidths(computedColumns, {
        enableColumnDisplayToggle,
      }).map((column) => {
        const nextColumn = { ...column } as typeof column;
        const { setDefaultWidth = true } = column;
        nextColumn.type || (nextColumn.type = 'string');
        nextColumn.className = clsx(
          `MuiTableCell-${nextColumn.type}`,
          nextColumn.className
        );
        switch (nextColumn.type) {
          case 'currency':
          case 'percentage':
          case 'number':
            nextColumn.align ?? (nextColumn.align = 'right');
            if (!nextColumn.noHeaderTextSuffix) {
              switch (nextColumn.type) {
                case 'currency':
                  if (currencyCode) {
                    nextColumn.headerTextSuffix = ` (${currencyCode})`;
                  }
                  break;
                case 'percentage':
                  nextColumn.headerTextSuffix = ' (%)';
                  break;
              }
            }
            break;
          case 'boolean':
            nextColumn.align ?? (nextColumn.align = 'center');
            nextColumn.enumValues ?? (nextColumn.enumValues = ['Yes', 'No']);
            nextColumn.searchKeyMapper ||
              (nextColumn.searchKeyMapper = (searchValue) =>
                searchValue === 'Yes');
            break;
          case 'id':
            nextColumn.align = 'center';
            break;
          case 'phoneNumber':
            nextColumn.columnClassName = 'phone-number-column';
            !nextColumn.width && setDefaultWidth && (nextColumn.width = 220);
            break;
          case 'currencyInput':
            nextColumn.align = 'right';
            if (currencyCode) {
              nextColumn.headerTextSuffix = ` (${currencyCode})`;
            }
            break;
          case 'tool':
          case 'checkbox':
            nextColumn.locked = true;
            nextColumn.align = 'center';
            break;
        }

        // Date columns
        switch (nextColumn.type) {
          case 'date':
          case 'timestamp':
            !nextColumn.width && setDefaultWidth && (nextColumn.width = 220);
            break;
        }

        // Nowrap state
        switch (nextColumn.type) {
          case 'boolean':
          case 'checkbox':
          case 'currency':
          case 'date':
          case 'dateTime':
          case 'email':
          case 'enum':
          case 'id':
          case 'number':
          case 'percentage':
          case 'string':
          case 'time':
          case 'timestamp':
            nextColumn.noWrap ?? (nextColumn.noWrap = true);
            break;
        }

        return nextColumn;
      }),
      stickyColumnWidths,
    };
  })();

  const selectedColumns = [
    CHECKBOX_COLUMN_ID,
    ROW_NUMBER_COLUMN_ID,
    ...selectedColumnIds,
    ELLIPSIS_MENU_TOOL_COLUMN_ID,
  ]
    .map((selectedColumnId) => {
      return allColumns.find(({ id }) => id === selectedColumnId)!;
    })
    .filter((column) => column != null);

  const displayingColumns = (() => {
    if (getDisplayingColumns) {
      return getDisplayingColumns(selectedColumns);
    }
    return selectedColumns;
  })();

  const minWidth = getTableMinWidth(
    displayingColumns.map((column) => {
      const { minWidth } = column;
      return {
        ...column,
        minWidth: minWidth ?? minColumnWidth,
      };
    }),
    {
      enableColumnDisplayToggle,
    }
  );
  useEffect(() => {
    onChangeMinWidthRef.current?.(minWidth);
  }, [minWidth]);

  const sortedRows: typeof rows = [
    ...(staticRows || []),
    ...(() => {
      const sortedRows = (() => {
        if (handleSortOperations && sortBy.length > 0) {
          return rows.sort((a, b) => {
            return sort(a, b, sortBy);
          });
        }
        return rows;
      })();

      return sortedRows;
    })(),
  ];

  useEffect(() => {
    if (sortByProp) {
      setSortBy((prevSortBy) => {
        if (
          sortByProp.map(({ id }) => id).join('') !==
          prevSortBy.map(({ id }) => id).join('')
        ) {
          return sortByProp.map((sortOption) => {
            return {
              ...sortOption,
              sortDirection: sortOption.sortDirection || 'ASC',
            };
          });
        }
        return prevSortBy;
      });
    }
  }, [sortByProp]);

  //#region Track scrollable ancestor
  useEffect(() => {
    if (scrollableElementRef?.current) {
      const scrollableElement = scrollableElementRef.current;
      const scrollEventCallback = () => {
        if (startStickyColumnDividerElementRef.current) {
          if (scrollableElement.scrollLeft > 0) {
            startStickyColumnDividerElementRef.current.classList.add(
              classes.startStickyColumnDividerActive
            );
          } else {
            startStickyColumnDividerElementRef.current.classList.remove(
              classes.startStickyColumnDividerActive
            );
          }
        }
      };
      scrollableElement.addEventListener('scroll', scrollEventCallback);
      return () => {
        scrollableElement.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [classes.startStickyColumnDividerActive, scrollableElementRef]);
  //#endregion

  //#region Variants
  const variantStyles: SxProps<Theme> = {
    [`
      .${tableBodyClasses.root} tr.${tableRowClasses.hover}:not(.${tableBodyRowClasses.groupHeaderRow}):hover
    `]: {
      bgcolor: 'transparent',
      ...(() => {
        if (highlightRowOnHover) {
          return {
            [`.${tableCellClasses.root}:after`]: {
              bgcolor: alpha(palette.primary.main, 0.1),
            },
          };
        }
      })(),
    },
  };

  switch (variant) {
    case 'plain':
      break;
    case 'stripped':
      Object.merge(variantStyles, {
        [`.${tableBodyClasses.root} tr.${tableRowClasses.root}.odd:not(:hover)`]:
          {
            bgcolor: alpha(palette.text.primary, 0.02),
          },
        [`
          td.${tableCellClasses.root}:nth-of-type(odd)
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02),
        },
        [`tr.${tableRowClasses.root}`]: {
          [`
            td.${tableCellClasses.root}:nth-of-type(odd).${tableBodyColumnClasses.opaque}
          `]: {
            bgcolor: (palette.mode === 'light' ? darken : lighten)(
              parentBackgroundColor,
              0.02
            ),
          },
          [`
            td.${tableCellClasses.root}:nth-of-type(even).${tableBodyColumnClasses.opaque}
          `]: {
            bgcolor: parentBackgroundColor,
          },
          [`&.odd`]: {
            [`
              td.${tableCellClasses.root}:nth-of-type(odd).${tableBodyColumnClasses.opaque}
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.04
              ),
            },
            [`
              td.${tableCellClasses.root}:nth-of-type(even).${tableBodyColumnClasses.opaque}
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.02
              ),
            },
          },
        },
      });
      break;
    case 'stripped-rows':
      Object.merge(variantStyles, {
        [`tr.${tableRowClasses.root}`]: {
          [`&.odd`]: {
            bgcolor: alpha(palette.text.primary, 0.02),
            [`td.${tableBodyColumnClasses.opaque}`]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.02
              ),
            },
          },
          [`&.even`]: {
            [`td.${tableBodyColumnClasses.opaque}`]: {
              bgcolor: parentBackgroundColor,
            },
          },
        },
      });
      break;
    case 'stripped-columns':
      Object.merge(variantStyles, {
        [`
          td.${tableCellClasses.root}:nth-of-type(odd)
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02),
        },
        [`
          td.${tableCellClasses.root}:nth-of-type(odd).${tableBodyColumnClasses.opaque}
        `]: {
          bgcolor: (palette.mode === 'light' ? darken : lighten)(
            parentBackgroundColor,
            0.02
          ),
        },
        [`
          td.${tableCellClasses.root}:nth-of-type(even).${tableBodyColumnClasses.opaque}
        `]: {
          bgcolor: parentBackgroundColor,
        },
      });
      break;
  }
  //#endregion

  //#region Border variants
  const borderVariantStyles: SxProps<Theme> = {};

  if (
    (['square', 'columns'] as (typeof bordersVariant)[]).includes(
      bordersVariant
    )
  ) {
    Object.merge(borderVariantStyles, {
      [`
        th.${tableCellClasses.root},
        td.${tableCellClasses.root}
      `]: {
        [`
          &:not(:nth-last-of-type(2)):not(:nth-last-of-type(1)),
          &.${tableBodyColumnClasses.groupHeaderColumn}:not(:last-of-type)
        `]: {
          borderRightWidth: 1,
          borderRightStyle: 'solid',
        },
        [`&:not(:nth-last-of-type(2)):not(:nth-last-of-type(1)):not(:first-of-type)`]:
          {
            borderRightColor: alpha(palette.divider, 0.04),
          },
        [`&:last-of-type`]: {
          borderLeftWidth: 1,
          borderLeftStyle: 'solid',
          borderLeftColor: alpha(palette.divider, 0.04),
        },
        [`&:first-of-type`]: {
          borderRightColor: alpha(palette.divider, 0.1),
        },
      },
      [`
        th.${tableCellClasses.root}
      `]: {
        [`&:not(:nth-last-of-type(2)):not(:nth-last-of-type(1)):not(:first-of-type)`]:
          {
            borderRightColor: alpha(palette.divider, 0.08),
          },
        [`&:last-of-type`]: {
          borderLeftColor: alpha(palette.divider, 0.08),
        },
      },
    });
  }
  if (
    (['columns', 'none'] as (typeof bordersVariant)[]).includes(bordersVariant)
  ) {
    Object.merge(borderVariantStyles, {
      [`
        th.${tableCellClasses.root},
        td.${tableCellClasses.root}
      `]: {
        borderBottomWidth: 0,
      },
    });
  }
  //#endregion

  const optimizeForSmallScreen =
    enableSmallScreenOptimization && isSmallScreenSize;

  const tableHeaderRow = (() => {
    if (showHeaderRow && !optimizeForSmallScreen) {
      return (
        <>
          <TableRow {...HeaderRowPropsRest} sx={{ ...HeaderRowPropsSx }}>
            {displayingColumns.map((column, index) => {
              const {
                id,
                style,
                minWidth,
                sortable: columnSortable = sortable,
                headerSx,
                headerClassName,
                primaryHeaderSx,
                className,
                type,
                sx,
                getColumnValue,
                showHeaderText = true,
                wrapColumnContentInFieldValue = true,
                description,
              } = column;
              const isLastColumn = index === displayingColumns.length - 1;
              let label = column.label;
              column.headerTextSuffix &&
                (label = (
                  <>
                    {label} {column.headerTextSuffix}
                  </>
                ));
              const tableCell = (
                <TableCell
                  key={String(id)}
                  className={clsx(
                    className,
                    stickyHeader && tableBodyColumnClasses.opaque,
                    headerClassName
                  )}
                  {...{ style }}
                  sx={{
                    fontWeight: 'bold',
                    p: 0,
                    ...getColumnWidthStyles({
                      ...column,
                      minWidth: minWidth ?? minColumnWidth,
                    }),
                    position: 'relative',
                    bgcolor: 'transparent',
                    ...(() => {
                      if (stickyHeader) {
                        return {
                          position: 'sticky',
                          top: 0,
                          ...(() => {
                            if (controlZIndex) {
                              return {
                                zIndex: 1,
                              };
                            }
                          })(),
                        };
                      }
                    })(),
                    ...sx,
                    ...headerSx,
                    ...(primaryHeaderSx as any),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pl: (() => {
                        if (index <= 0) {
                          if (isGroupedTable) {
                            return 1;
                          }
                          return 3;
                        }
                        return 1.5;
                      })(),
                      pr: columnSortable
                        ? 3
                        : index < displayingColumns.length - 1
                        ? 1.5
                        : 3,
                      py: 1.5,
                      ...(() => {
                        if (enableColumnDisplayToggle && isLastColumn) {
                          return {
                            pr: 0,
                          };
                        }
                      })(),
                      ...(() => {
                        if (!showHeaderText || !label) {
                          return {
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                          };
                        }
                      })(),
                    }}
                  >
                    {(() => {
                      if (isGroupedTable && index === 0) {
                        return (
                          <TableGroupCollapseTool
                            groupCollapsed={
                              TableGroupingProps?.allGroupsCollapsed || false
                            }
                            onChangeGroupCollapsed={
                              TableGroupingProps?.onChangeAllGroupsCollapsed
                            }
                          />
                        );
                      }
                    })()}
                    {(() => {
                      if (showHeaderText) {
                        if (wrapColumnContentInFieldValue && label) {
                          return (
                            <Typography
                              component="div"
                              variant="body2"
                              sx={{ fontWeight: 'bold' }}
                              noWrap
                            >
                              {label}
                            </Typography>
                          );
                        }
                        return label;
                      }
                    })()}
                    {(() => {
                      if (
                        columnSortable &&
                        (!enableColumnDisplayToggle || !isLastColumn)
                      ) {
                        const sortDirection = (() => {
                          if (sortBy[0] && sortBy[0].id === id) {
                            return sortBy[0].sortDirection || 'ASC';
                          }
                        })();
                        return (
                          <Stack
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              height: '100%',
                              fontSize: 10,
                              lineHeight: 1,
                              color: alpha(palette.text.primary, 0.1),
                            }}
                          >
                            {(
                              ['ASC', 'DESC'] as [SortDirection, SortDirection]
                            ).map((baseSortDirection) => {
                              return (
                                <Box
                                  key={baseSortDirection}
                                  onClick={() => {
                                    const sortOptions: typeof sortBy = [
                                      {
                                        id,
                                        sortDirection: baseSortDirection,
                                        type: mapTableColumnTypeToPrimitiveDataType(
                                          type
                                        ),
                                        getSortValue: (row) => {
                                          const columnValue = (() => {
                                            if (getColumnValue) {
                                              return getColumnValue(
                                                row,
                                                column
                                              );
                                            }
                                            return row[id];
                                          })();
                                          const acceptableTypes = [
                                            'number',
                                            'string',
                                            'boolean',
                                          ];
                                          if (
                                            acceptableTypes.includes(
                                              typeof columnValue
                                            )
                                          ) {
                                            return columnValue as
                                              | number
                                              | string
                                              | boolean;
                                          }
                                          if (
                                            acceptableTypes.includes(
                                              typeof row[id]
                                            )
                                          ) {
                                            return row[id] as
                                              | number
                                              | string
                                              | boolean;
                                          }
                                          return '';
                                        },
                                      },
                                    ];
                                    setSortBy(sortOptions);
                                    onChangeSortBy &&
                                      onChangeSortBy(sortOptions);
                                  }}
                                  sx={{
                                    flex: 1,
                                    display: 'flex',
                                    px: 0.8,
                                    alignItems:
                                      baseSortDirection === 'ASC'
                                        ? 'end'
                                        : 'start',
                                    cursor: 'pointer',
                                    ...(() => {
                                      if (sortDirection === baseSortDirection) {
                                        return {
                                          color: palette.text.primary,
                                        };
                                      }
                                      return {
                                        '&:hover': {
                                          color: alpha(
                                            palette.text.primary,
                                            0.3
                                          ),
                                        },
                                      };
                                    })(),
                                  }}
                                >
                                  <span>
                                    {baseSortDirection === 'ASC' ? (
                                      <>&#9650;</>
                                    ) : (
                                      <>&#9660;</>
                                    )}
                                  </span>
                                </Box>
                              );
                            })}
                          </Stack>
                        );
                      }
                    })()}
                    <Box component="span" sx={{ flex: 1 }} />
                  </Box>
                </TableCell>
              );

              if (description) {
                return (
                  <Tooltip
                    key={String(id)}
                    title={description}
                    enterAtCursorPosition={false}
                    disableInteractive
                  >
                    {tableCell}
                  </Tooltip>
                );
              }

              return tableCell;
            })}
          </TableRow>
          {(() => {
            if (
              displayingColumns.some(
                ({ secondaryHeaderRowContent }) =>
                  secondaryHeaderRowContent != null
              )
            ) {
              return (
                <TableRow
                  {...SecondaryHeaderRowPropsRest}
                  sx={{ ...SecondaryHeaderRowPropsSx }}
                >
                  {displayingColumns.map((column, index) => {
                    const {
                      id,
                      style,
                      minWidth,
                      className,
                      sx,
                      headerSx,
                      secondaryHeaderSx,
                      secondaryHeaderRowContent,
                    } = column;
                    const isLastColumn = index === displayingColumns.length - 1;
                    return (
                      <TableCell
                        key={String(id)}
                        className={clsx(className)}
                        {...{ style }}
                        sx={{
                          fontWeight: 'bold',
                          p: 0,
                          ...getColumnWidthStyles({
                            ...column,
                            minWidth: minWidth ?? minColumnWidth,
                          }),
                          position: 'relative',
                          bgcolor: 'transparent',
                          ...sx,
                          ...headerSx,
                          ...(secondaryHeaderSx as any),
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            pl: (() => {
                              if (isGroupedTable) {
                                return 1;
                              }
                              if (index <= 0) {
                                return 3;
                              }
                              return 1.5;
                            })(),
                            pr: index < displayingColumns.length - 1 ? 1.5 : 3,
                            py: 1.5,
                            ...(() => {
                              if (enableColumnDisplayToggle && isLastColumn) {
                                return {
                                  pr: 0,
                                };
                              }
                            })(),
                          }}
                        >
                          {secondaryHeaderRowContent}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            }
          })()}
        </>
      );
    }
  })();

  const columnDisplayToggle = (() => {
    if (showHeaderRow && enableColumnDisplayToggle && !optimizeForSmallScreen) {
      const selectableColumns = allColumns.filter(({ id }) => {
        return !(
          ['checkbox', ELLIPSIS_MENU_TOOL_COLUMN_ID] as (typeof id)[]
        ).includes(id);
      });
      return (
        <Box
          {...ColumnDisplayTogglePropsRest}
          className={clsx(
            classes.columnDisplayToggle,
            ColumnDisplayTogglePropsRest.className
          )}
          sx={{
            position: 'sticky',
            left: 0,
            top: 0,
            height: 45,
            mb: '-45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            zIndex: 99,
            pointerEvents: 'none',
            minWidth,
            ...ColumnDisplayTogglePropsSx,
          }}
        >
          <Box
            sx={{
              bgcolor: parentBackgroundColor,
              borderTopLeftRadius: '50%',
              borderBottomLeftRadius: '50%',
              pointerEvents: 'auto',
              position: 'sticky',
              right: 0,
            }}
          >
            <Tooltip
              title="Edit columns"
              enterAtCursorPosition={false}
              disableInteractive
            >
              <TableColumnToggleIconButton
                {...{ selectedColumnIds }}
                columns={selectableColumns}
                onChangeSelectedColumnIds={(selectedColumnIds) => {
                  setSearchParams({
                    selectedColumns: selectedColumnIds,
                  });
                  onChangeSelectedColumnIds?.(selectedColumnIds);
                }}
                sx={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              />
            </Tooltip>
          </Box>
        </Box>
      );
    }
  })();

  const tableBodyProps: TableBodyProps<DataRow> = {
    optimizeForSmallScreen,
    rowStartIndex,
    tableHeaderHeight,
    displayingColumns,
    columnTypographyProps,
    decimalPlaces,
    defaultColumnValue,
    defaultCountryCode,
    defaultDateFormat,
    defaultDateTimeFormat,
    editable,
    minColumnWidth,
    noWrap,
    onClickRow,
    textTransform,
    enableSmallScreenOptimization,
    getToolTipWrappedColumnNode,
    forEachRowProps,
    showHeaderRow,
    tableBodyRowHeight,
    controlZIndex,
    emptyRowsLabel,
    scrollableElementRef,
    lazyRows,
    TableBodyRowPlaceholderProps,
    highlightRowOnHover,
    rows: sortedRows,
    EmptyRowsCellProps: {
      className: classes.emptyRowsCell,
    },
  };

  const baseTableElement = (() => {
    if (optimizeForSmallScreen) {
      return showDataRows ? <TableBody {...tableBodyProps} /> : null;
    }
    return (
      <MuiBaseTable
        {...omit(
          rest,
          'lowercaseLabelPlural',
          'parentBackgroundColor',
          'currencyCode',
          'emptyRowsLabel',
          'lowercaseLabelPlural',
          'parentBackgroundColor',
          'emptyRowsLabel',
          'defaultDateFormat',
          'defaultDateTimeFormat'
        )}
        ref={ref}
        className={clsx(classes.root, `Mui-table-${variant}`)}
        sx={{
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          minWidth,
          ...variantStyles,
          ...borderVariantStyles,
          ...sx,
          [`.${tableBodyColumnClasses.opaque}`]: {
            bgcolor: parentBackgroundColor,
          },
        }}
      >
        {tableHeaderRow ? (
          <TableHead
            {...TableHeadPropsRest}
            ref={tableHeaderElementRef}
            sx={{
              bgcolor: alpha(palette.text.primary, TABLE_HEAD_ALPHA),
              ...TableHeadPropsSx,
            }}
          >
            {tableHeaderRow}
          </TableHead>
        ) : null}
        {showDataRows ? <TableBody {...tableBodyProps} /> : null}
      </MuiBaseTable>
    );
  })();

  const tableElement = (() => {
    if (
      showHeaderRow &&
      !optimizeForSmallScreen &&
      (enableColumnDisplayToggle ||
        (showStartStickyColumnDivider && startStickyColumnIndex != null))
    ) {
      return (
        <>
          {columnDisplayToggle}
          {baseTableElement}
          {(() => {
            if (startStickyColumnIndex != null) {
              return (
                <Box
                  sx={{
                    position: 'absolute',
                    height: '100%',
                    left: 0,
                    top: 0,
                    zIndex: 99,
                    pointerEvents: 'none',
                    minWidth,
                  }}
                >
                  <Box
                    ref={startStickyColumnDividerElementRef}
                    className={clsx(classes.startStickyColumnDivider)}
                    sx={{
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      height: '100%',
                      pointerEvents: 'none',
                      [`&.${classes.startStickyColumnDividerActive}`]: {
                        width: stickyColumnWidths.reduce((a, b) => a + b, 0),
                        borderRight: `1px solid ${palette.divider}`,
                        boxShadow: `2px 0 10px -1px ${alpha(BLACK_COLOR, 0.2)}`,
                      },
                    }}
                  />
                </Box>
              );
            }
          })()}
        </>
      );
    }
    return baseTableElement;
  })();

  return {
    columnDisplayToggle,
    tableHeaderRow,
    baseTableElement,
    tableElement,
  };
};
