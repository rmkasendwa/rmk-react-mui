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
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import { PaginationProps } from '@mui/material/Pagination';
import { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import MuiBaseTable, {
  TableProps as MuiBaseTableProps,
} from '@mui/material/Table';
import TableBody, { tableBodyClasses } from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination, {
  TablePaginationProps,
} from '@mui/material/TablePagination';
import TableRow, {
  TableRowProps as MuiTableRowProps,
  tableRowClasses,
} from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, darken, lighten } from '@mui/system/colorManipulator';
import { SxProps } from '@mui/system/styleFunctionSx';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { SortBy, SortDirection, SortOptions } from '../../interfaces/Sort';
import {
  BaseTableRow,
  GetRowProps,
  TableColumn,
  TableRowProps,
} from '../../interfaces/Table';
import { sort } from '../../utils/Sort';
import {
  expandTableColumnWidths,
  getColumnWidthStyles,
  getTableMinWidth,
  mapTableColumnTypeToPrimitiveDataType,
} from '../../utils/Table';
import DataTablePagination from '../DataTablePagination';
import RenderIfVisible, { RenderIfVisibleProps } from '../RenderIfVisible';
import TableBodyRow from './TableBodyRow';
import TableColumnToggleIconButton, {
  TableColumnToggleIconButtonProps,
} from './TableColumnToggleIconButton';

export type {
  ForEachDerivedColumnConfiguration,
  TableColumn,
  TableColumnEnumValue,
} from '../../interfaces/Table';

export interface TableClasses {
  /** Styles applied to the root element. */
  root: string;
  columnDisplayToggle: string;
}

export type TableClassKey = keyof TableClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableExtended: TableProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableExtended: keyof TableClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableExtended?: {
      defaultProps?: ComponentsProps['MuiTableExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableExtended'];
      variants?: ComponentsVariants['MuiTableExtended'];
    };
  }
}

export type TableVariant =
  | 'stripped'
  | 'stripped-rows'
  | 'stripped-columns'
  | 'plain';

export type TableBordersVariant = 'square' | 'rows' | 'columns' | 'none';

export interface TableProps<RowObject extends Record<string, any> = any>
  extends Partial<Pick<MuiBaseTableProps, 'onClick' | 'sx' | 'className'>>,
    Pick<
      TableRowProps<RowObject>,
      | 'columnTypographyProps'
      | 'columns'
      | 'decimalPlaces'
      | 'defaultColumnValue'
      | 'defaultCountryCode'
      | 'defaultDateFormat'
      | 'defaultDateTimeFormat'
      | 'editable'
      | 'generateRowData'
      | 'minColumnWidth'
      | 'noWrap'
      | 'onClickRow'
      | 'textTransform'
    >,
    Pick<
      TableColumnToggleIconButtonProps<RowObject>,
      'selectedColumnIds' | 'onChangeSelectedColumnIds'
    >,
    Partial<Pick<TablePaginationProps, 'rowsPerPageOptions'>> {
  rows?: RowObject[];
  rowStartIndex?: number;
  rowsPerPage?: number;
  pageIndex?: number;
  filterdRowCount?: number;
  totalRowCount?: number;
  labelPlural?: string;
  labelSingular?: string;
  lowercaseLabelPlural?: string;
  emptyRowsLabel?: ReactNode;
  variant?: TableVariant;
  bordersVariant?: TableBordersVariant;
  onChangePage?: (pageIndex: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  forEachRowProps?: GetRowProps<RowObject>;
  paging?: boolean;
  showHeaderRow?: boolean;
  showDataRows?: boolean;
  HeaderRowProps?: Partial<MuiTableRowProps>;
  currencyCode?: string;
  paginationType?: 'default' | 'classic';
  PaginationProps?: PaginationProps;
  stickyHeader?: boolean;
  TableBodyRowPlaceholderProps?: Partial<RenderIfVisibleProps>;
  PaginatedTableWrapperProps?: Partial<BoxProps>;
  parentBackgroundColor?: string;

  // Sort props
  sortable?: boolean;
  handleSortOperations?: boolean;
  sortBy?: SortBy<RowObject>;
  onChangeSortBy?: (sortOptions: SortOptions<RowObject>) => void;

  // Removable columns
  enableColumnDisplayToggle?: boolean;
  ColumnDisplayToggleProps?: Partial<BoxProps>;

  // Checkboxes
  enableCheckboxRowSelectors?: boolean;
  enableCheckboxAllRowSelector?: boolean;
  allRowsChecked?: boolean;
  checkedRowIds?: string[];
  onChangeCheckedRowIds?: (
    checkedRowIds: string[],
    allRowsChecked: boolean
  ) => void;
}

const OPAQUE_BG_CLASS_NAME = `MuiTableCell-opaque`;
const TABLE_HEAD_ALPHA = 0.05;

export function getTableUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableExtended', slot);
}

export const tableClasses: TableClasses = generateUtilityClasses(
  'MuiTableExtended',
  ['root', 'columnDisplayToggle']
);

const slots = {
  root: ['root'],
  columnDisplayToggle: ['columnDisplayToggle'],
};

export const BaseTable = <T extends BaseTableRow>(
  inProps: TableProps<T>,
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
    generateRowData,
    variant = 'plain',
    bordersVariant = 'rows',
    paging = true,
    showHeaderRow = true,
    showDataRows = true,
    HeaderRowProps = {},
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
    defaultDateFormat = 'MMM dd, yyyy',
    defaultDateTimeFormat = 'MMM dd, yyyy hh:mm aa',
    defaultCountryCode,
    currencyCode,
    noWrap,
    sx,
    ...rest
  } = props;

  let { lowercaseLabelPlural, parentBackgroundColor, emptyRowsLabel } = props;

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
    sx: tableBodyRowPlaceholderPropsSx,
    ...tableBodyRowPlaceholderPropsRest
  } = TableBodyRowPlaceholderProps;
  const {
    sx: PaginatedTableWrapperPropsSx,
    ...PaginatedTableWrapperPropsRest
  } = PaginatedTableWrapperProps;
  const { sx: ColumnDisplayTogglePropsSx, ...ColumnDisplayTogglePropsRest } =
    ColumnDisplayToggleProps;
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());
  emptyRowsLabel || (emptyRowsLabel = `No ${lowercaseLabelPlural} found`);

  // Refs
  const columnsRef = useRef(columnsProp);
  const onChangeSelectedColumnIdsRef = useRef(onChangeSelectedColumnIds);
  const onChangeCheckedRowIdsRef = useRef(onChangeCheckedRowIdsProp);
  useEffect(() => {
    columnsRef.current = columnsProp;
    onChangeSelectedColumnIdsRef.current = onChangeSelectedColumnIds;
    onChangeCheckedRowIdsRef.current = onChangeCheckedRowIdsProp;
  }, [columnsProp, onChangeCheckedRowIdsProp, onChangeSelectedColumnIds]);

  const { palette } = useTheme();
  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageProp);
  const [sortBy, setSortBy] = useState<SortOptions<T>>([]);

  /*******************
   * Checkbox state. *
   * *****************
   */
  const [allRowsChecked, setAllRowsChecked] = useState(allRowsCheckedProp);
  const [checkedRowIds, setCheckedRowIds] = useState<string[]>(
    checkedRowIdsProp || []
  );
  const checkboxColumn: TableColumn<T> = {
    id: 'checkbox' as any,
    label: enableCheckboxAllRowSelector ? (
      <Checkbox
        checked={allRowsChecked}
        onChange={(event) => {
          setAllRowsChecked(event.target.checked);
          setCheckedRowIds([]);
        }}
        color="default"
      />
    ) : null,
    getColumnValue: ({ id: baseId }) => {
      const id = String(baseId);
      const checked = allRowsChecked || checkedRowIds.includes(id);
      return (
        <Checkbox
          {...{ checked }}
          color="default"
          onChange={() => {
            setCheckedRowIds((prevCheckedRowIds) => {
              const nextCheckedRowIds = [...prevCheckedRowIds];
              if (nextCheckedRowIds.includes(id)) {
                nextCheckedRowIds.splice(nextCheckedRowIds.indexOf(id), 1);
              } else {
                nextCheckedRowIds.push(id);
              }
              return nextCheckedRowIds;
            });
          }}
        />
      );
    },
    width: 40,
    sx: {
      '&,>div': {
        p: 0,
      },
    },
  };
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

  /********************************
   * Column toggling state state. *
   * *******************************/
  const baseSelectedColumnIds = useMemo(() => {
    if (selectedColumnIdsProp) {
      return selectedColumnIdsProp;
    }
    return columnsProp.map(({ id }) => String(id) as any);
  }, [columnsProp, selectedColumnIdsProp]);
  const [selectedColumnIds, setSelectedColumnIds] = useState<
    NonNullable<typeof selectedColumnIdsProp>
  >(baseSelectedColumnIds);
  useEffect(() => {
    if (selectedColumnIdsProp && !onChangeSelectedColumnIdsRef.current) {
      setSelectedColumnIds((prevSelectedColumnIds) => {
        if (prevSelectedColumnIds.join('') !== selectedColumnIdsProp.join('')) {
          return selectedColumnIdsProp;
        }
        return prevSelectedColumnIds;
      });
    }
  }, [selectedColumnIdsProp]);
  useEffect(() => {
    onChangeSelectedColumnIdsRef.current &&
      onChangeSelectedColumnIdsRef.current(selectedColumnIds);
  }, [selectedColumnIds]);

  parentBackgroundColor || (parentBackgroundColor = palette.background.paper);

  // Setting default column properties
  const columns = useMemo(() => {
    return expandTableColumnWidths(columnsProp, {
      enableColumnDisplayToggle,
    }).map((column) => {
      const nextColumn = { ...column } as typeof column;
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
        case 'ellipsisMenuTool':
          nextColumn.opaque = true;
          nextColumn.defaultColumnValue ||
            (nextColumn.defaultColumnValue = <>&nbsp;</>);
          nextColumn.propagateClickToParentRowClickEvent = false;
          nextColumn.sx = {
            position: 'sticky',
            p: 0,
            right: 0,
            ...nextColumn.sx,
          };
          break;
      }
      nextColumn.className = clsx(
        nextColumn.opaque ? OPAQUE_BG_CLASS_NAME : null
      );

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
    });
  }, [columnsProp, currencyCode, enableColumnDisplayToggle]);

  const displayingColumns = [
    ...(() => {
      if (enableCheckboxRowSelectors) {
        return [checkboxColumn];
      }
      return [];
    })(),
    ...(() => {
      if (selectedColumnIdsProp && onChangeSelectedColumnIds) {
        return selectedColumnIdsProp;
      }
      return selectedColumnIds;
    })()
      .map((selectedColumnId) => {
        return columns.find(({ id }) => id === selectedColumnId)!;
      })
      .filter((column) => column != null),
  ];

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

  const pageRows: typeof rows = (() => {
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
  })();

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

  /************
   * Variants *
   * **********
   */
  const variantStyles: SxProps<Theme> = {
    [`.${tableBodyClasses.root} tr.${tableRowClasses.hover}:hover`]: {
      bgcolor: 'transparent',
      [`.${tableCellClasses.root}:before`]: {
        bgcolor: alpha(palette.primary.main, 0.1),
      },
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
            td.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}
          `]: {
            bgcolor: (palette.mode === 'light' ? darken : lighten)(
              parentBackgroundColor,
              0.02
            ),
          },
          [`
            td.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}
          `]: {
            bgcolor: parentBackgroundColor,
          },
          [`&.odd`]: {
            [`
              td.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.04
              ),
            },
            [`
              td.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}
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
            [`td.${OPAQUE_BG_CLASS_NAME}`]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.02
              ),
            },
          },
          [`&.even`]: {
            [`td.${OPAQUE_BG_CLASS_NAME}`]: {
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
          td.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}
        `]: {
          bgcolor: (palette.mode === 'light' ? darken : lighten)(
            parentBackgroundColor,
            0.02
          ),
        },
        [`
          td.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}
        `]: {
          bgcolor: parentBackgroundColor,
        },
      });
      break;
  }

  /*******************
   * Border variants *
   * *****************
   */
  const borderVariantStyles: SxProps<Theme> = {};

  if (
    (['square', 'columns'] as typeof bordersVariant[]).includes(bordersVariant)
  ) {
    Object.merge(borderVariantStyles, {
      [`
        th.${tableCellClasses.root},
        td.${tableCellClasses.root}
      `]: {
        [`&:not(:nth-last-of-type(2)):not(:nth-last-of-type(1))`]: {
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
    (['columns', 'none'] as typeof bordersVariant[]).includes(bordersVariant)
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

  const tableElement = (
    <MuiBaseTable
      {...omit(
        rest,
        'lowercaseLabelPlural',
        'parentBackgroundColor',
        'currencyCode',
        'emptyRowsLabel'
      )}
      ref={ref}
      {...{ stickyHeader }}
      className={clsx(classes.root, `Mui-table-${variant}`)}
      sx={{
        tableLayout: 'fixed',
        minWidth,
        ...variantStyles,
        ...borderVariantStyles,
        ...sx,
        [`.${OPAQUE_BG_CLASS_NAME}`]: {
          bgcolor: parentBackgroundColor,
        },
      }}
    >
      {showHeaderRow ? (
        <TableHead
          sx={{
            bgcolor: alpha(palette.text.primary, TABLE_HEAD_ALPHA),
          }}
        >
          <TableRow {...restHeaderRowProps} sx={{ ...headerRowPropsSx }}>
            {displayingColumns.map((column, index) => {
              const {
                id,
                style,
                minWidth,
                sortable: columnSortable = sortable,
                headerSx,
                className,
                type,
                sx,
                getColumnValue,
                showHeaderText = true,
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
                    stickyHeader && OPAQUE_BG_CLASS_NAME
                  )}
                  {...{ style }}
                  sx={{
                    fontWeight: 'bold',
                    p: 0,
                    ...getColumnWidthStyles({
                      ...column,
                      minWidth: minWidth ?? minColumnWidth,
                    }),
                    position: stickyHeader ? 'sticky' : 'relative',
                    bgcolor: 'transparent',
                    ...sx,
                    ...(headerSx as any),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pl: index <= 0 ? 3 : 1.5,
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
                    {showHeaderText && label ? (
                      <>
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{ fontWeight: 'bold' }}
                          noWrap
                        >
                          {label}
                        </Typography>
                        {(() => {
                          if (columnSortable) {
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
                                  right: (() => {
                                    if (
                                      isLastColumn &&
                                      enableColumnDisplayToggle
                                    ) {
                                      return 42;
                                    }
                                    return 0;
                                  })(),
                                  height: '100%',
                                  fontSize: 10,
                                  lineHeight: 1,
                                  color: alpha(palette.text.primary, 0.1),
                                }}
                              >
                                {(
                                  ['ASC', 'DESC'] as [
                                    SortDirection,
                                    SortDirection
                                  ]
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
                                          if (
                                            sortDirection === baseSortDirection
                                          ) {
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
                      </>
                    ) : null}
                    <Box component="span" sx={{ flex: 1 }} />
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
      ) : null}
      {showDataRows ? (
        <TableBody>
          {(() => {
            if (pageRows.length > 0) {
              return pageRows.map((row, index) => {
                const classNames = [];
                const rowNumber = rowStartIndex + 1 + index;
                if (rowNumber % 2 === 0) {
                  classNames.push('even');
                } else {
                  classNames.push('odd');
                }
                return (
                  <RenderIfVisible
                    {...tableBodyRowPlaceholderPropsRest}
                    key={row.id}
                    component="tr"
                    displayPlaceholder={false}
                    unWrapChildrenIfVisible
                    sx={{
                      height: 41,
                      ...tableBodyRowPlaceholderPropsSx,
                    }}
                  >
                    <TableBodyRow
                      {...{
                        columnTypographyProps,
                        decimalPlaces,
                        defaultColumnValue,
                        defaultCountryCode,
                        defaultDateFormat,
                        defaultDateTimeFormat,
                        editable,
                        generateRowData,
                        minColumnWidth,
                        noWrap,
                        onClickRow,
                        row,
                        textTransform,
                      }}
                      columns={displayingColumns}
                      getRowProps={forEachRowProps}
                      className={classNames.join(' ')}
                    />
                  </RenderIfVisible>
                );
              });
            }
            return (
              <TableRow>
                <TableCell colSpan={displayingColumns.length} align="center">
                  <Typography variant="body2">{emptyRowsLabel}</Typography>
                </TableCell>
              </TableRow>
            );
          })()}
        </TableBody>
      ) : null}
    </MuiBaseTable>
  );

  const columnDisplayToggle = (() => {
    if (showHeaderRow && enableColumnDisplayToggle) {
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
              PopperProps={{
                sx: {
                  pointerEvents: 'none',
                },
              }}
            >
              <TableColumnToggleIconButton
                {...{ columns, selectedColumnIds }}
                onChangeSelectedColumnIds={(selectedColumnIds) => {
                  if (selectedColumnIdsProp && onChangeSelectedColumnIds) {
                    onChangeSelectedColumnIds(selectedColumnIds);
                  } else {
                    setSelectedColumnIds(selectedColumnIds);
                  }
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

  if (paging) {
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
          {tableElement}
        </Box>
        {stickyHeader ? <Divider /> : null}
        {(() => {
          const filteredCount = filterdRowCount || totalRowCount || rows.length;
          if (filteredCount >= 0) {
            const paginationProps: Pick<
              TablePaginationProps,
              | 'onRowsPerPageChange'
              | 'page'
              | 'rowsPerPage'
              | 'rowsPerPageOptions'
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
        })()}
      </Box>
    );
  }

  if (showHeaderRow && enableColumnDisplayToggle) {
    return (
      <>
        {columnDisplayToggle}
        {tableElement}
      </>
    );
  }

  return tableElement;
};

export const Table = forwardRef(BaseTable) as <T extends Record<string, any>>(
  p: TableProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default Table;
