import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  TableBody as MuiTableBody,
  TableBodyProps as MuiTableBodyProps,
  TableCell,
  TableCellProps,
  TableRow,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import {
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useState,
} from 'react';

import { useLoadOnScrollToBottom } from '../../hooks/InfiniteScroller';
import RenderIfVisible from '../RenderIfVisible';
import {
  BaseDataRow,
  TableColumn,
  TableColumnType,
  TableProps,
  TableRowProps,
} from './models';
import { tableBodyColumnClasses } from './TableBodyColumn';
import TableBodyRow, { tableBodyRowClasses } from './TableBodyRow';

export interface TableBodyClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableBodyClassKey = keyof TableBodyClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableBodyExtended: TableBodyProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableBodyExtended: keyof TableBodyClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableBodyExtended?: {
      defaultProps?: ComponentsProps['MuiTableBodyExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableBodyExtended'];
      variants?: ComponentsVariants['MuiTableBodyExtended'];
    };
  }
}
//#endregion

export const getTableBodyUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTableBodyExtended', slot);
};

const slots: Record<TableBodyClassKey, [TableBodyClassKey]> = {
  root: ['root'],
};

export const tableBodyClasses: TableBodyClasses = generateUtilityClasses(
  'MuiTableBodyExtended',
  Object.keys(slots) as TableBodyClassKey[]
);

const LAZY_ROWS_BUFFER_SIZE = 20;

export interface TableBodyProps<DataRow extends BaseDataRow = BaseDataRow>
  extends Partial<MuiTableBodyProps>,
    Pick<
      TableProps<DataRow>,
      | 'columnTypographyProps'
      | 'decimalPlaces'
      | 'defaultColumnValue'
      | 'defaultCountryCode'
      | 'defaultDateFormat'
      | 'defaultDateTimeFormat'
      | 'editable'
      | 'minColumnWidth'
      | 'noWrap'
      | 'onClickRow'
      | 'textTransform'
      | 'enableSmallScreenOptimization'
      | 'getToolTipWrappedColumnNode'
      | 'forEachRowProps'
      | 'showHeaderRow'
      | 'tableBodyRowHeight'
      | 'controlZIndex'
      | 'emptyRowsLabel'
      | 'scrollableElementRef'
      | 'lazyRows'
      | 'TableBodyRowPlaceholderProps'
      | 'rowStartIndex'
      | 'rows'
      | 'highlightRowOnHover'
      | 'optimizeRendering'
    > {
  optimizeForSmallScreen: boolean;
  tableHeaderHeight: number;
  displayingColumns: TableColumn<DataRow, TableColumnType>[];
  EmptyRowsCellProps?: Partial<TableCellProps>;
}

export const BaseTableBody = <DataRow extends BaseDataRow>(
  inProps: TableBodyProps<DataRow>,
  ref: Ref<any>
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTableBodyExtended',
  });
  const {
    className,
    optimizeForSmallScreen,
    rows = [],
    rowStartIndex = 0,
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
    enableSmallScreenOptimization = false,
    getToolTipWrappedColumnNode,
    forEachRowProps,
    showHeaderRow = true,
    tableHeaderHeight,
    tableBodyRowHeight,
    controlZIndex = true,
    emptyRowsLabel,
    scrollableElementRef,
    displayingColumns,
    lazyRows = rows.length > LAZY_ROWS_BUFFER_SIZE && !tableBodyRowHeight,
    TableBodyRowPlaceholderProps = {},
    EmptyRowsCellProps = {},
    highlightRowOnHover,
    optimizeRendering,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTableBodyUtilityClass,
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
  const { ...EmptyRowsCellPropsRest } = EmptyRowsCellProps;

  const { palette } = useTheme();
  const [baseOffset, setBaseOffset] = useState(0);
  const [baseLimit, setBaseLimit] = useState(20);
  useEffect(() => {
    if (scrollableElementRef?.current?.offsetHeight && tableBodyRowHeight) {
      const scrollableElement = scrollableElementRef.current;
      const observer = new ResizeObserver(() => {
        setBaseLimit(
          Math.ceil(scrollableElement.offsetHeight / tableBodyRowHeight)
        );
      });
      observer.observe(scrollableElement);
      return () => {
        observer.disconnect();
      };
    }
  }, [scrollableElementRef, tableBodyRowHeight]);
  useLoadOnScrollToBottom({
    elementRef: scrollableElementRef,
    onChangeScrollLength({ scrollTop }) {
      if (tableBodyRowHeight) {
        setBaseOffset(Math.floor(scrollTop / tableBodyRowHeight));
      }
    },
    changeEventCallbackTimeout: 50,
    revalidationKey: `${tableBodyRowHeight}`,
  });

  const viewPortElementMargin = Math.ceil(baseLimit / 2);
  const offset = Math.max(0, baseOffset - viewPortElementMargin);
  const limit = Math.min(
    rows.length,
    baseLimit + (baseOffset - offset) + viewPortElementMargin
  );

  const pageRows = (() => {
    if (tableBodyRowHeight) {
      return rows.slice(offset, offset + limit);
    }
    return rows;
  })().map((row, index) => {
    const rowNumber = offset + rowStartIndex + 1 + index;
    const { GroupingProps } = row;
    const compositeId = (() => {
      if (GroupingProps && 'isGroupHeader' in GroupingProps) {
        return GroupingProps.groupId;
      }
      return row.id;
    })();
    return {
      row,
      rowNumber,
      compositeId,
      props: {
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
        optimizeRendering,
        columns: displayingColumns,
        getRowProps: forEachRowProps,
        className: clsx(rowNumber % 2 === 0 ? 'even' : 'odd'),
        applyCellWidthParameters: !showHeaderRow,
        sx: {
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
        },
      } as TableRowProps<DataRow>,
    };
  });

  const rowElements = (() => {
    if (pageRows.length > 0) {
      const placeholderTableCells = (() => {
        if (tableBodyRowHeight && !optimizeForSmallScreen) {
          return displayingColumns.map(
            ({ className, opaque, id, width, sx, bodySx }) => {
              return (
                <TableCell
                  className={clsx([
                    className,
                    opaque && tableBodyColumnClasses.opaque,
                  ])}
                  key={String(id)}
                  sx={
                    {
                      ...sx,
                      ...bodySx,
                      width,
                      p: 0,
                      borderBottom: 'none',
                    } as any
                  }
                />
              );
            }
          );
        }
      })();
      return (
        <>
          {tableBodyRowHeight ? (
            <Box
              component={optimizeForSmallScreen ? 'div' : 'tr'}
              style={{
                height: `${offset * tableBodyRowHeight}px`,
              }}
            >
              {placeholderTableCells}
            </Box>
          ) : null}
          {(() => {
            if (!lazyRows) {
              return pageRows.map(({ compositeId, props }) => {
                return <TableBodyRow key={compositeId} {...props} />;
              });
            }
            const rowsToProcess = [...pageRows];
            const pageRowElementPlaceholders: ReactNode[] = [];
            while (rowsToProcess.length > 0) {
              const bufferedPageRows = rowsToProcess.splice(
                0,
                LAZY_ROWS_BUFFER_SIZE
              );
              const bufferedPageRowElements = bufferedPageRows.map(
                ({ compositeId, props }) => {
                  return <TableBodyRow key={compositeId} {...props} />;
                }
              );
              const placeholderElementKey = bufferedPageRows
                .map(({ compositeId }) => {
                  return compositeId;
                })
                .join(';');
              const baseHeight = (() => {
                if (
                  typeof (TableBodyRowPlaceholderPropsSx as any)?.height ===
                  'number'
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
          })()}
          {tableBodyRowHeight ? (
            <Box
              component={optimizeForSmallScreen ? 'div' : 'tr'}
              style={{
                height: `${
                  (rows.length - (offset + limit)) * tableBodyRowHeight
                }px`,
              }}
            >
              {placeholderTableCells}
            </Box>
          ) : null}
        </>
      );
    }
    if (optimizeForSmallScreen) {
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
    }
    return (
      <TableRow>
        <TableCell
          {...EmptyRowsCellPropsRest}
          colSpan={displayingColumns.length}
          align="center"
        >
          <Typography variant="body2">{emptyRowsLabel}</Typography>
        </TableCell>
      </TableRow>
    );
  })();

  if (optimizeForSmallScreen) {
    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          [`.${tableBodyRowClasses.root}`]: {
            borderBottom: `1px solid ${palette.divider}`,
          },
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
        {rowElements}
      </Box>
    );
  }

  return (
    <MuiTableBody ref={ref} {...rest} className={clsx(classes.root)}>
      {rowElements}
    </MuiTableBody>
  );
};

export const TableBody = forwardRef(BaseTableBody) as <
  DataRow extends BaseDataRow,
>(
  p: TableBodyProps<DataRow> & { ref?: Ref<any> }
) => ReactElement;

export default TableBody;
