import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Stack,
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
  Ref,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../../contexts/GlobalConfigurationContext';
import { SortBy, SortDirection, SortOptions } from '../../interfaces/Sort';
import {
  BaseTableRow,
  GetRowProps,
  TableRowProps,
} from '../../interfaces/Table';
import { sort } from '../../utils/Sort';
import { getColumnWidthStyles, getTableMinWidth } from '../../utils/Table';
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

export interface TableProps<T = any>
  extends Partial<Pick<MuiBaseTableProps, 'onClick' | 'sx' | 'className'>>,
    Pick<
      TableRowProps<T>,
      | 'columns'
      | 'generateRowData'
      | 'decimalPlaces'
      | 'textTransform'
      | 'onClickRow'
      | 'defaultColumnValue'
      | 'columnTypographyProps'
      | 'minColumnWidth'
    >,
    Pick<
      TableColumnToggleIconButtonProps,
      'selectedColumnIds' | 'onChangeSelectedColumnIds'
    > {
  rows: T[];
  rowStartIndex?: number;
  rowsPerPage?: number;
  pageIndex?: number;
  filterdRowCount?: number;
  totalRowCount?: number;
  labelPlural?: string;
  labelSingular?: string;
  lowercaseLabelPlural?: string;
  variant?: TableVariant;
  onChangePage?: (pageIndex: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  forEachRowProps?: GetRowProps;
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
  sortBy?: SortBy<T>;
  onChangeSortBy?: (sortOptions: SortOptions<T>) => void;

  // Removable columns
  enableColumnDisplayToggle?: boolean;
}

const OPAQUE_BG_CLASS_NAME = `MuiTableCell-opaque`;
const TABLE_HEAD_ALPHA = 0.05;

export function getTableUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableExtended', slot);
}

export const tableClasses: TableClasses = generateUtilityClasses(
  'MuiTableExtended',
  ['root']
);

const slots = {
  root: ['root'],
};

export const BaseTable = <T extends BaseTableRow>(
  inProps: TableProps<T>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableExtended' });
  const {
    onClickRow,
    columns: columnsProp,
    rows,
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
    defaultColumnValue,
    columnTypographyProps,
    minColumnWidth,
    className,
    sortable = false,
    handleSortOperations = true,
    sortBy: sortByProp,
    onChangeSortBy,
    enableColumnDisplayToggle = false,
    selectedColumnIds: selectedColumnIdsProp,
    onChangeSelectedColumnIds,
    sx,
    ...rest
  } = props;

  let { lowercaseLabelPlural, parentBackgroundColor, currencyCode } = props;

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
  lowercaseLabelPlural || (lowercaseLabelPlural = labelPlural.toLowerCase());

  // Refs
  const columnsRef = useRef(columnsProp);
  useEffect(() => {
    columnsRef.current = columnsProp;
  }, [columnsProp]);

  const { palette } = useTheme();
  const { sx: headerRowPropsSx, ...restHeaderRowProps } = HeaderRowProps;
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { currencyCode: defaultCurrencyCode } = useContext(
    GlobalConfigurationContext
  );
  const [sortBy, setSortBy] = useState<SortOptions<T>>([]);

  parentBackgroundColor || (parentBackgroundColor = palette.background.paper);
  currencyCode || (currencyCode = defaultCurrencyCode);

  // Setting default column properties
  const columns = useMemo(() => {
    return columnsProp.map((column, index) => {
      const isLastColumn = index === columnsProp.length - 1;
      const nextColumn = { ...column } as typeof column;
      nextColumn.type || (nextColumn.type = 'string');
      nextColumn.className = clsx(
        `MuiTableCell-${nextColumn.type}`,
        nextColumn.className
      );
      switch (nextColumn.type) {
        case 'date':
        case 'time':
          nextColumn.width || (nextColumn.width = 150);
          break;
        case 'currency':
        case 'percentage':
        case 'number':
          nextColumn.align = 'right';
          if (!nextColumn.noHeaderTextAfter) {
            switch (nextColumn.type) {
              case 'currency':
                if (currencyCode) {
                  nextColumn.headerTextAfter = ` (${currencyCode})`;
                }
                break;
              case 'percentage':
                nextColumn.headerTextAfter = ' (%)';
                break;
            }
          }
          break;
        case 'boolean':
          nextColumn.align = 'center';
          nextColumn.enumValues = ['Yes', 'No'];
          nextColumn.width || (nextColumn.width = 150);
          nextColumn.searchKeyMapper ||
            (nextColumn.searchKeyMapper = (searchValue) =>
              searchValue === 'Yes');
          break;
        case 'id':
          nextColumn.align = 'center';
          nextColumn.width || (nextColumn.width = 100);
          break;
        case 'phoneNumber':
          nextColumn.width || (nextColumn.width = 195);
          nextColumn.columnClassName = 'phone-number-column';
          break;
        case 'currencyInput':
          nextColumn.align = 'right';
          if (currencyCode) {
            nextColumn.headerTextAfter = ` (${currencyCode})`;
          }
          break;
        case 'tool':
        case 'checkbox':
          nextColumn.locked = true;
          nextColumn.align = 'center';
          break;
        case 'ellipsisMenuTool':
          nextColumn.width = 40;
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
      const extraWidth = (() => {
        if (isLastColumn && enableColumnDisplayToggle) {
          return 44;
        }
        return 0;
      })();

      nextColumn.minWidth && (nextColumn.minWidth += extraWidth);
      nextColumn.width && (nextColumn.width += extraWidth);

      return nextColumn;
    });
  }, [columnsProp, currencyCode, enableColumnDisplayToggle]);

  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(
    selectedColumnIdsProp || columns.map(({ id }) => String(id))
  );

  const displayingColumns = useMemo(() => {
    return selectedColumnIds
      .map((selectedColumnId) => {
        return columns.find(({ id }) => id === selectedColumnId)!;
      })
      .filter((column) => column != null);
  }, [columns, selectedColumnIds]);

  const minWidth = useMemo(() => {
    return getTableMinWidth(
      displayingColumns.map((column) => {
        const { minWidth } = column;
        return {
          ...column,
          minWidth: minWidth ?? minColumnWidth,
        };
      })
    );
  }, [displayingColumns, minColumnWidth]);

  const pageRows: typeof rows = useMemo(() => {
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
  }, [
    handleSortOperations,
    pageIndex,
    paging,
    rows,
    rowsPerPage,
    sortBy,
    totalRowCount,
  ]);

  useEffect(() => {
    onChangeSelectedColumnIds && onChangeSelectedColumnIds(selectedColumnIds);
  }, [onChangeSelectedColumnIds, selectedColumnIds]);

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
      Object.assign(variantStyles, {
        [`.${tableBodyClasses.root} tr.${tableRowClasses.root}.odd:not(:hover)`]:
          {
            bgcolor: alpha(palette.text.primary, 0.02),
          },
        [`
          th.${tableCellClasses.root}:nth-of-type(odd)>div
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02 + TABLE_HEAD_ALPHA),
        },
        [`
          td.${tableCellClasses.root}:nth-of-type(odd)
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02),
        },
        [`tr.${tableRowClasses.root}`]: {
          [`
            th.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}>div
          `]: {
            bgcolor: (palette.mode === 'light' ? darken : lighten)(
              parentBackgroundColor,
              0.02 + TABLE_HEAD_ALPHA
            ),
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
            th.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}>div
          `]: {
            bgcolor: (palette.mode === 'light' ? darken : lighten)(
              parentBackgroundColor,
              TABLE_HEAD_ALPHA
            ),
          },
          [`
            td.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}
          `]: {
            bgcolor: parentBackgroundColor,
          },
          [`&.odd`]: {
            [`
              th.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}>div
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.04 + TABLE_HEAD_ALPHA
              ),
            },
            [`
              td.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.04
              ),
            },
            [`
              th.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}>div
            `]: {
              bgcolor: (palette.mode === 'light' ? darken : lighten)(
                parentBackgroundColor,
                0.02 + TABLE_HEAD_ALPHA
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
      Object.assign(variantStyles, {
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
      Object.assign(variantStyles, {
        [`
          th.${tableCellClasses.root}:nth-of-type(odd)>div
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02 + TABLE_HEAD_ALPHA),
        },
        [`
          td.${tableCellClasses.root}:nth-of-type(odd)
        `]: {
          bgcolor: alpha(palette.text.primary, 0.02),
        },
        [`
          th.${tableCellClasses.root}:nth-of-type(odd).${OPAQUE_BG_CLASS_NAME}>div
        `]: {
          bgcolor: (palette.mode === 'light' ? darken : lighten)(
            parentBackgroundColor,
            0.02 + TABLE_HEAD_ALPHA
          ),
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
          th.${tableCellClasses.root}:nth-of-type(even).${OPAQUE_BG_CLASS_NAME}>div
        `]: {
          bgcolor: (palette.mode === 'light' ? darken : lighten)(
            parentBackgroundColor,
            TABLE_HEAD_ALPHA
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

  const tableElement = (
    <MuiBaseTable
      {...omit(
        rest,
        'lowercaseLabelPlural',
        'parentBackgroundColor',
        'currencyCode'
      )}
      ref={ref}
      {...{ stickyHeader }}
      className={clsx(classes.root, `Mui-table-${variant}`)}
      sx={{
        tableLayout: 'fixed',
        minWidth,
        ...variantStyles,
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
                align,
                style,
                minWidth,
                sortable: columnSortable = sortable,
                headerSx,
                className,
                type,
                sx,
                getColumnValue,
              } = column;
              const isLastColumn = index === displayingColumns.length - 1;
              let label = column.label;
              column.headerTextAfter &&
                (label = (
                  <>
                    {label} {column.headerTextAfter}
                  </>
                ));
              return (
                <TableCell
                  key={String(id)}
                  className={clsx(
                    className,
                    stickyHeader && OPAQUE_BG_CLASS_NAME
                  )}
                  {...{ style, align }}
                  sx={{
                    fontWeight: 'bold',
                    p: 0,
                    ...getColumnWidthStyles({
                      ...column,
                      minWidth: minWidth ?? minColumnWidth,
                    }),
                    position: stickyHeader ? 'sticky' : 'relative',
                    bgcolor: 'transparent',
                    ...style,
                    ...sx,
                    ...(headerSx as any),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pl: align === 'center' || index <= 0 ? 3 : 1.5,
                      pr: columnSortable
                        ? 3
                        : index < displayingColumns.length - 1
                        ? 1.5
                        : 3,
                      py: 1.5,
                      ...(() => {
                        if (!label) {
                          return {
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                          };
                        }
                        return {};
                      })(),
                    }}
                  >
                    {label ? (
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
                                      return 32;
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
                                            type: (() => {
                                              switch (type) {
                                                case 'number':
                                                case 'numberInput':
                                                case 'percentage':
                                                case 'percentageInput':
                                                case 'currency':
                                                case 'currencyInput':
                                                  return 'number';
                                                case 'date':
                                                case 'time':
                                                case 'dateTime':
                                                case 'dateInput':
                                                  return 'date';
                                                case 'boolean':
                                                  return 'boolean';
                                                default:
                                                  return 'string';
                                              }
                                            })(),
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
                                              if (
                                                [
                                                  'number',
                                                  'string',
                                                  'boolean',
                                                ].includes(typeof columnValue)
                                              ) {
                                                return columnValue as
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
                    {(() => {
                      if (enableColumnDisplayToggle && isLastColumn) {
                        return (
                          <Box
                            sx={{
                              height: 0,
                              position: 'sticky',
                              right: 6,
                              mr: '-20px',
                            }}
                          >
                            <TableColumnToggleIconButton
                              {...{ columns, selectedColumnIds }}
                              onChangeSelectedColumnIds={(
                                selectedColumnIds
                              ) => {
                                setSelectedColumnIds(selectedColumnIds);
                              }}
                              sx={{
                                mt: '-25px',
                                p: 0.2,
                                '&,&:hover': {
                                  bgcolor: (palette.mode === 'light'
                                    ? darken
                                    : lighten)(parentBackgroundColor!, 0.15),
                                },
                              }}
                            />
                          </Box>
                        );
                      }
                    })()}
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
                        row,
                        decimalPlaces,
                        textTransform,
                        onClickRow,
                        generateRowData,
                        defaultColumnValue,
                        columnTypographyProps,
                        minColumnWidth,
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
                  <Typography variant="body2">
                    No {lowercaseLabelPlural} found
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })()}
        </TableBody>
      ) : null}
    </MuiBaseTable>
  );

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
          }}
        >
          {tableElement}
        </Box>
        <Divider />
        {(() => {
          const paginationProps: Pick<
            TablePaginationProps,
            | 'page'
            | 'rowsPerPageOptions'
            | 'rowsPerPage'
            | 'onRowsPerPageChange'
          > = {
            page: pageIndex,
            rowsPerPageOptions: [10, 25, 50, 100],
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
                }}
                filteredCount={filterdRowCount || totalRowCount || rows.length}
                totalCount={totalRowCount || rows.length}
                {...paginationProps}
                PaginationProps={{
                  ...PaginationProps,
                  onChange: (e, pageNumber) => {
                    handleChangePage(e, pageNumber - 1);
                  },
                }}
              />
            );
          }
          return (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalRowCount || rows.length}
              {...paginationProps}
              onPageChange={handleChangePage}
              showFirstButton
              showLastButton
            />
          );
        })()}
      </Box>
    );
  }

  return tableElement;
};

export const Table = forwardRef(BaseTable) as <T>(
  p: TableProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default Table;
