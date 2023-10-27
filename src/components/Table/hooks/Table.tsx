import '@infinite-debugger/rmk-js-extensions/Object';

import {
  Checkbox,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Stack,
  Tooltip,
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
import TableBody, { tableBodyClasses } from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination, {
  TablePaginationProps,
} from '@mui/material/TablePagination';
import TableRow, { tableRowClasses } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, darken, lighten } from '@mui/system/colorManipulator';
import { SxProps } from '@mui/system/styleFunctionSx';
import clsx from 'clsx';
import { omit } from 'lodash';
import { Fragment, ReactNode, Ref, useEffect, useRef, useState } from 'react';

import { useGlobalConfiguration } from '../../../contexts/GlobalConfigurationContext';
import { SortDirection, SortOptions } from '../../../models/Sort';
import { BLACK_COLOR } from '../../../theme';
import { sort } from '../../../utils/Sort';
import DataTablePagination from '../../DataTablePagination';
import EllipsisMenuIconButton from '../../EllipsisMenuIconButton';
import RenderIfVisible from '../../RenderIfVisible';
import {
  BaseDataRow,
  CHECKBOX_COLUMN_ID,
  ELLIPSIS_MENU_TOOL_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  TableProps,
} from '../models';
import { tableBodyColumnClasses } from '../TableBodyColumn';
import TableBodyRow, { tableBodyRowClasses } from '../TableBodyRow';
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
};

export const tableClasses: TableClasses = generateUtilityClasses(
  'MuiTableExtended',
  Object.keys(slots) as TableClassKey[]
);

const TABLE_HEAD_ALPHA = 0.05;
const LAZY_ROWS_BUFFER_SIZE = 20;

export const useTable = <DataRow extends BaseDataRow>(
  inProps: TableProps<DataRow>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableExtended' });
  const {
    onClickRow,
    columns: columnsProp,
    rows = [],
    filterdRowCount,
    totalRowCount,
    rowStartIndex = 0,
    labelPlural = 'Records',
    labelSingular,
    rowsPerPage: rowsPerPageProp = 10,
    pageIndex: pageIndexProp = 0,
    onChangePage,
    onRowsPerPageChange,
    forEachRowProps,
    variant = 'plain',
    bordersVariant = 'rows',
    paging = true,
    showHeaderRow = true,
    showDataRows = true,
    HeaderRowProps = {},
    SecondaryHeaderRowProps = {},
    decimalPlaces,
    textTransform,
    paginationType = 'default',
    PaginationProps = {},
    stickyHeader = false,
    TableBodyRowPlaceholderProps = {},
    PaginatedTableWrapperProps = {},
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
    rowsPerPageOptions: rowsPerPageOptionsProp = [10, 25, 50, 100],
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
    staticRows,
    onChangeMinWidth,
    lazyRows = rows.length > LAZY_ROWS_BUFFER_SIZE,
    controlZIndex = true,
    highlightRowOnHover = true,
    sx,
    ...rest
  } = props;

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

  const {
    sx: TableBodyRowPlaceholderPropsSx,
    ...TableBodyRowPlaceholderPropsRest
  } = TableBodyRowPlaceholderProps;
  const {
    sx: PaginatedTableWrapperPropsSx,
    ...PaginatedTableWrapperPropsRest
  } = PaginatedTableWrapperProps;
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
  const columnsRef = useRef(columnsProp);
  columnsRef.current = columnsProp;
  const onChangeSelectedColumnIdsRef = useRef(onChangeSelectedColumnIds);
  onChangeSelectedColumnIdsRef.current = onChangeSelectedColumnIds;
  const onChangeCheckedRowIdsRef = useRef(onChangeCheckedRowIdsProp);
  onChangeCheckedRowIdsRef.current = onChangeCheckedRowIdsProp;
  const onChangeMinWidthRef = useRef(onChangeMinWidth);
  onChangeMinWidthRef.current = onChangeMinWidth;
  //#endregion

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { sx: HeaderRowPropsSx, ...HeaderRowPropsRest } = HeaderRowProps;
  const { sx: SecondaryHeaderRowPropsSx, ...SecondaryHeaderRowPropsRest } =
    SecondaryHeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageProp);
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

  const baseSelectedColumnIds = (() => {
    if (selectedColumnIdsProp) {
      return selectedColumnIdsProp;
    }
    return columnsProp.map(({ id }) => String(id) as any);
  })();

  const [localSelectedColumnIds, setLocalSelectedColumnIds] = useState<
    NonNullable<typeof selectedColumnIdsProp>
  >(baseSelectedColumnIds);

  const serializedLocalSelectedColumnIds = JSON.stringify(
    localSelectedColumnIds
  );
  const serializedBaseSelectedColumnIds = JSON.stringify(baseSelectedColumnIds);
  useEffect(() => {
    if (serializedLocalSelectedColumnIds !== serializedBaseSelectedColumnIds) {
      setLocalSelectedColumnIds(JSON.parse(serializedBaseSelectedColumnIds));
    }
  }, [serializedBaseSelectedColumnIds, serializedLocalSelectedColumnIds]);

  const selectedColumnIds = (() => {
    if (onChangeSelectedColumnIdsRef.current && selectedColumnIdsProp) {
      return selectedColumnIdsProp;
    }
    return localSelectedColumnIds;
  })();

  useEffect(() => {
    onChangeSelectedColumnIdsRef.current &&
      onChangeSelectedColumnIdsRef.current(selectedColumnIds);
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
            return `${
              1 + rowStartIndex + pageRows.indexOf(record) + pageIndex
            }.`;
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
            nextColumn.align = 'right';
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
            nextColumn.align = 'center';
            nextColumn.enumValues = ['Yes', 'No'];
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

  const pageRows: typeof rows = [
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

      return totalRowCount || !paging
        ? sortedRows
        : sortedRows.slice(
            pageIndex * rowsPerPage,
            pageIndex * rowsPerPage + rowsPerPage
          );
    })(),
  ];

  useEffect(() => {
    setPageIndex(pageIndexProp);
  }, [pageIndexProp]);

  useEffect(() => {
    setRowsPerPage(rowsPerPageProp);
  }, [rowsPerPageProp]);

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

  const handleChangePage = (e: any, newPage: number) => {
    setPageIndex(newPage);
    onChangePage && onChangePage(newPage);
  };

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
              } = column;
              const isLastColumn = index === displayingColumns.length - 1;
              let label = column.label;
              column.headerTextSuffix &&
                (label = (
                  <>
                    {label} {column.headerTextSuffix}
                  </>
                ));
              return (
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

  const tableBodyRows = (() => {
    if (showDataRows) {
      if (optimizeForSmallScreen) {
        return pageRows.reduce((accumulator, row, index) => {
          const rowNumber = rowStartIndex + 1 + index;
          const { GroupingProps } = row;
          const compositeId = (() => {
            if (GroupingProps && 'isGroupHeader' in GroupingProps) {
              return GroupingProps.groupId;
            }
            return row.id;
          })();
          accumulator.push({
            id: compositeId,
            element: (
              <Fragment key={compositeId}>
                {index > 0 ? <Divider /> : null}
                <TableBodyRow
                  {...{
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
                    row,
                    textTransform,
                    enableSmallScreenOptimization,
                    getToolTipWrappedColumnNode,
                  }}
                  columns={displayingColumns}
                  getRowProps={forEachRowProps}
                  className={clsx(rowNumber % 2 === 0 ? 'even' : 'odd')}
                  applyCellWidthParameters={!showHeaderRow}
                  sx={{
                    [`&.${tableBodyRowClasses.groupHeaderRow}`]: {
                      boxShadow: `0 -1px 2px -1px ${palette.divider}`,
                      td: {
                        position: 'sticky',
                        top: tableHeaderHeight,
                        ...(() => {
                          if (controlZIndex) {
                            return {
                              zIndex: 2,
                            };
                          }
                        })(),
                      },
                    },
                  }}
                />
              </Fragment>
            ),
          });
          return accumulator;
        }, [] as { id: string; element: ReactNode }[]);
      }
      return pageRows.reduce((accumulator, row, index) => {
        const rowNumber = rowStartIndex + 1 + index;
        const { GroupingProps } = row;
        const compositeId = (() => {
          if (GroupingProps && 'isGroupHeader' in GroupingProps) {
            return GroupingProps.groupId;
          }
          return row.id;
        })();
        accumulator.push({
          id: compositeId,
          element: (
            <TableBodyRow
              {...{
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
                row,
                textTransform,
                getToolTipWrappedColumnNode,
              }}
              key={compositeId}
              columns={displayingColumns}
              getRowProps={forEachRowProps}
              className={clsx(rowNumber % 2 === 0 ? 'even' : 'odd')}
              applyCellWidthParameters={!showHeaderRow}
              sx={{
                [`&.${tableBodyRowClasses.groupHeaderRow}`]: {
                  boxShadow: `0 -1px 2px -1px ${palette.divider}`,
                  td: {
                    position: 'sticky',
                    top: tableHeaderHeight,
                    ...(() => {
                      if (controlZIndex) {
                        return {
                          zIndex: 1,
                          '&:first-of-type': {
                            zIndex: 2,
                          },
                        };
                      }
                    })(),
                  },
                },
              }}
            />
          ),
        });
        return accumulator;
      }, [] as { id: string; element: ReactNode }[]);
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
            <Tooltip title="Edit columns" disableInteractive>
              <TableColumnToggleIconButton
                {...{ selectedColumnIds }}
                columns={selectableColumns}
                onChangeSelectedColumnIds={(selectedColumnIds) => {
                  if (
                    !onChangeSelectedColumnIds ||
                    selectedColumnIdsProp == null
                  ) {
                    setLocalSelectedColumnIds(selectedColumnIds);
                  }
                  onChangeSelectedColumnIds &&
                    onChangeSelectedColumnIds(selectedColumnIds);
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

  const paginationElement = (() => {
    if (paging) {
      const filteredCount = filterdRowCount || totalRowCount || rows.length;
      if (filteredCount >= 0) {
        const paginationProps: Pick<
          TablePaginationProps,
          'onRowsPerPageChange' | 'page' | 'rowsPerPage' | 'rowsPerPageOptions'
        > = {
          page: pageIndex,
          rowsPerPageOptions: [
            ...new Set([...rowsPerPageOptionsProp, rowsPerPageProp]),
          ].sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b;
            }
            return 0;
          }),
          rowsPerPage,
          onRowsPerPageChange: (event) => {
            handleChangePage(null, 0);
            setRowsPerPage(+event.target.value);
            onRowsPerPageChange && onRowsPerPageChange(+event.target.value);
          },
        };
        if (paginationType === 'classic') {
          return (
            <DataTablePagination
              {...{
                labelPlural,
                labelSingular,
                lowercaseLabelPlural,
                filteredCount,
              }}
              totalCount={totalRowCount || rows.length}
              {...paginationProps}
              PaginationProps={{
                ...PaginationProps,
                onChange: (e, pageNumber) => {
                  handleChangePage(e, pageNumber - 1);
                },
              }}
              postCountTools={[
                ...(() => {
                  if (checkedRowIds.length > 0) {
                    return [
                      <Typography
                        key="selectedItems"
                        variant="body2"
                        sx={{ fontSize: 'inherit' }}
                      >
                        {checkedRowIds.length} selected
                      </Typography>,
                    ];
                  }
                  return [];
                })(),
              ]}
            />
          );
        }
        return (
          <TablePagination
            component="div"
            count={totalRowCount || rows.length}
            {...paginationProps}
            onPageChange={handleChangePage}
            showFirstButton
            showLastButton
          />
        );
      }
    }
  })();

  const getTableBodyRowElements = () => {
    if (tableBodyRows) {
      if (!lazyRows) {
        return tableBodyRows.map(({ element }) => element);
      }
      const pageRowElementsToProcess = [...tableBodyRows];
      const pageRowElementPlaceholders: ReactNode[] = [];
      while (pageRowElementsToProcess.length > 0) {
        const bufferedPageRows = pageRowElementsToProcess.splice(
          0,
          LAZY_ROWS_BUFFER_SIZE
        );
        const bufferedPageRowElements = bufferedPageRows.map(({ element }) => {
          return element;
        });
        const placeholderElementKey = bufferedPageRows
          .map(({ id }) => {
            return id;
          })
          .join(';');
        const baseHeight = (() => {
          if (
            typeof (TableBodyRowPlaceholderPropsSx as any)?.height === 'number'
          ) {
            return (TableBodyRowPlaceholderPropsSx as any).height;
          }
          return optimizeForSmallScreen ? 65 : 41;
        })();
        pageRowElementPlaceholders.push(
          <RenderIfVisible
            {...TableBodyRowPlaceholderPropsRest}
            key={placeholderElementKey}
            component={optimizeForSmallScreen ? 'div' : 'tr'}
            displayPlaceholder={false}
            unWrapChildrenIfVisible
            initialVisible={pageRowElementPlaceholders.length === 0}
            sx={{
              ...TableBodyRowPlaceholderPropsSx,
              height: baseHeight * bufferedPageRowElements.length,
            }}
          >
            {bufferedPageRowElements}
          </RenderIfVisible>
        );
      }
      return pageRowElementPlaceholders;
    }
  };

  const baseTableElement = (() => {
    if (optimizeForSmallScreen) {
      if (!tableBodyRows) {
        return null;
      }
      return (
        <Box
          sx={{
            ...(() => {
              if (highlightRowOnHover) {
                return {
                  [`.${tableBodyRowClasses.root}:hover`]: {
                    bgcolor: alpha(palette.primary.main, 0.1),
                  },
                };
              }
            })(),
          }}
        >
          {(() => {
            if (tableBodyRows.length > 0) {
              return getTableBodyRowElements();
            }
            return (
              <Box
                sx={{
                  p: 2,
                }}
              >
                <Typography variant="body2" align="center">
                  {emptyRowsLabel}
                </Typography>
              </Box>
            );
          })()}
        </Box>
      );
    }
    return (
      <MuiBaseTable
        {...omit(
          rest,
          'lowercaseLabelPlural',
          'parentBackgroundColor',
          'currencyCode',
          'emptyRowsLabel',
          'scrollableElement',
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
            ref={tableHeaderElementRef}
            sx={{
              bgcolor: alpha(palette.text.primary, TABLE_HEAD_ALPHA),
            }}
          >
            {tableHeaderRow}
          </TableHead>
        ) : null}
        {tableBodyRows
          ? (() => {
              return (
                <TableBody>
                  {(() => {
                    if (tableBodyRows.length > 0) {
                      return getTableBodyRowElements();
                    }
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={displayingColumns.length}
                          align="center"
                        >
                          <Typography variant="body2">
                            {emptyRowsLabel}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              );
            })()
          : null}
      </MuiBaseTable>
    );
  })();

  const tableElement = (() => {
    if (paging && !optimizeForSmallScreen) {
      return (
        <Box
          {...PaginatedTableWrapperPropsRest}
          sx={{
            ...PaginatedTableWrapperPropsSx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              overflow: 'auto',
              flex: 1,
              minHeight: 0,
              position: 'relative',
            }}
          >
            {columnDisplayToggle}
            {baseTableElement}
          </Box>
          {stickyHeader ? <Divider /> : null}
          {paginationElement}
        </Box>
      );
    }

    if (
      showHeaderRow &&
      (enableColumnDisplayToggle || startStickyColumnIndex != null)
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
                    sx={{
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: stickyColumnWidths.reduce((a, b) => a + b, 0),
                      pointerEvents: 'none',
                      borderRight: `1px solid ${palette.divider}`,
                      boxShadow: `2px 0 10px -1px ${alpha(BLACK_COLOR, 0.2)}`,
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
    tableBodyRows,
    paginationElement,
    baseTableElement,
    tableElement,
  };
};
