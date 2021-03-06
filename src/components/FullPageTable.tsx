import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ILoadingProps } from '../interfaces/Utils';
import ErrorAlert from './ErrorAlert';
import LoadingScreen from './LoadingScreen';
import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';
import SearchSyncToolbar from './SearchSyncToolbar';
import Table, { ITableProps } from './Table';

export interface IFullPageTableProps<T = any>
  extends IPaddedContentAreaProps,
    Pick<
      ITableProps<T>,
      | 'columns'
      | 'rows'
      | 'onClickRow'
      | 'forEachDerivedColumn'
      | 'labelPlural'
      | 'variant'
      | 'showHeaderRow'
    >,
    Partial<ILoadingProps> {
  pathToAddNew?: string;
  permissionToAddNew?: string | string[];
  permissionToViewDetails?: string | string[];
  load?: () => void;
  TableProps?: Partial<ITableProps>;
  paging?: boolean;
  showStatusBar?: boolean;
  searchFieldPlaceholder?: string;
  getSearchableColumnValues?: (row: any) => (string | string[])[];
  searchTerm?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
}

const DEFAULT_ROW_HEIGHT = 50;

export const FullPageTable: FC<IFullPageTableProps> = ({
  title,
  pathToAddNew,
  columns,
  rows,
  onClickRow,
  forEachDerivedColumn,
  labelPlural,
  tools,
  variant,
  showHeaderRow,
  breadcrumbs,
  loading,
  errorMessage,
  load,
  TableProps,
  paging = true,
  showStatusBar = true,
  searchFieldPlaceholder,
  getSearchableColumnValues,
  searchTerm: searchTermProp = '',
  onChangeSearchTerm,
}) => {
  searchFieldPlaceholder ||
    (searchFieldPlaceholder = (() => {
      const searchableFieldLabels = columns
        .filter(({ label }) => label && typeof label === 'string')
        .map(({ label }) => (label as string).toLowerCase());
      return `Search by ${searchableFieldLabels
        .slice(0, -1)
        .join(', ')}, or ${searchableFieldLabels.slice(-1)}`;
    })());
  const [tablePageIndex, setTablePageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [displayRows, setDisplayRows] = useState<any[]>([]);
  const [tableWrapperDiv, setTableWrapperDiv] = useState<HTMLDivElement | null>(
    null
  );
  const [showStickyToolBar, setShowStickyToolBar] = useState(false);

  const searchableColumnIds = useMemo(() => {
    return columns.map(({ id }) => id);
  }, [columns]);

  const matchesSearchTerm = useCallback(
    (
      lowerCaseSearchTerm: string,
      columnValue: string | number | (string | number)[]
    ) => {
      if (Array.isArray(columnValue)) {
        return columnValue.some((item) => {
          if (typeof item === 'string') {
            return item.toLowerCase().match(lowerCaseSearchTerm);
          }
          if (typeof item === 'number') {
            return String(item)
              .toLowerCase()
              .match(lowerCaseSearchTerm.replace(/,/g, ''));
          }
          return false;
        });
      }
      return (() => {
        if (typeof columnValue === 'string') {
          return columnValue.toLowerCase().match(lowerCaseSearchTerm);
        }
        if (typeof columnValue === 'number') {
          return String(columnValue)
            .toLowerCase()
            .match(lowerCaseSearchTerm.replace(/,/g, ''));
        }
        return false;
      })();
    },
    []
  );

  useEffect(() => {
    setSearchTerm(searchTermProp);
  }, [searchTermProp]);

  useEffect(() => {
    onChangeSearchTerm && onChangeSearchTerm(searchTerm);
  }, [onChangeSearchTerm, searchTerm]);

  const { palette } = useTheme();

  useEffect(() => {
    if (searchTerm.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredRows(
        rows.filter((row) => {
          if (getSearchableColumnValues) {
            return getSearchableColumnValues(row).some((columnValue) =>
              matchesSearchTerm(lowerCaseSearchTerm, columnValue)
            );
          }
          return searchableColumnIds.some((columnId) =>
            matchesSearchTerm(lowerCaseSearchTerm, row[columnId])
          );
        })
      );
    } else {
      setFilteredRows(rows);
    }
  }, [
    getSearchableColumnValues,
    matchesSearchTerm,
    rows,
    searchTerm,
    searchTerm.length,
    searchableColumnIds,
  ]);

  useEffect(() => {
    if (paging) {
      if (tableWrapperDiv && document.scrollingElement) {
        const scrollCallback = () => {
          const { scrollY } = window;
          const topRowCount = Math.floor(scrollY / DEFAULT_ROW_HEIGHT);
          setDisplayRows(
            filteredRows.slice(
              0,
              topRowCount + Math.ceil(window.innerHeight / DEFAULT_ROW_HEIGHT)
            )
          );
        };

        window.addEventListener('scroll', scrollCallback);
        scrollCallback();
        return () => {
          window.removeEventListener('scroll', scrollCallback);
        };
      }
    } else {
      setDisplayRows(filteredRows);
    }
  }, [filteredRows, filteredRows.length, paging, tableWrapperDiv]);

  useEffect(() => {
    if (tableWrapperDiv) {
      tableWrapperDiv.style.minHeight = `${
        (filteredRows.length + 1) * DEFAULT_ROW_HEIGHT
      }px`;
    }
  }, [filteredRows.length, tableWrapperDiv]);

  useEffect(() => {
    const scrollCallback = () => {
      const { scrollY } = window;
      setShowStickyToolBar(scrollY >= 80);
    };
    window.addEventListener('scroll', scrollCallback);
    scrollCallback();
    return () => {
      window.removeEventListener('scroll', scrollCallback);
    };
  }, []);

  useEffect(() => {
    if (paging) {
      setDisplayRows(
        filteredRows.slice(
          0,
          Math.ceil(window.innerHeight / DEFAULT_ROW_HEIGHT)
        )
      );
    } else {
      setDisplayRows(filteredRows);
    }
  }, [filteredRows, paging]);

  const toolbar = (
    <SearchSyncToolbar
      {...{ searchTerm, searchFieldPlaceholder, load, loading, errorMessage }}
      onChangeSearchTerm={(searchTerm) => setSearchTerm(searchTerm)}
      tools={(() => {
        if (pathToAddNew) {
          return (
            <Button
              variant="contained"
              component={Link}
              to={pathToAddNew}
              size="small"
            >
              Add New
            </Button>
          );
        }
      })()}
    />
  );

  return (
    <>
      {showStickyToolBar ? (
        <Box
          sx={{
            position: 'sticky',
            top: 56,
            height: 0,
            zIndex: 5,
          }}
        >
          <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
              borderBottom: `1px solid ${alpha(palette.text.primary, 0.12)}`,
            }}
          >
            <Container maxWidth="xl">{toolbar}</Container>
          </AppBar>
        </Box>
      ) : null}
      <PaddedContentArea title={title} tools={tools} breadcrumbs={breadcrumbs}>
        <Paper sx={{ overflow: 'hidden' }}>
          <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
              borderBottom: `1px solid ${alpha(palette.text.primary, 0.12)}`,
              visibility: showStickyToolBar ? 'hidden' : 'visible',
            }}
          >
            {toolbar}
          </AppBar>
          {errorMessage && <ErrorAlert message={errorMessage} retry={load} />}
          {(() => {
            if (loading && rows.length <= 0) {
              return (
                <Box>
                  <LoadingScreen />
                </Box>
              );
            }
            if (errorMessage && filteredRows.length <= 0) {
              return null;
            }
            return (
              <Box
                ref={(tableWrapper: any) => {
                  setTableWrapperDiv(tableWrapper);
                }}
                sx={{
                  boxSizing: 'border-box',
                }}
              >
                <Table
                  {...{
                    columns,
                    forEachDerivedColumn,
                    labelPlural,
                    variant,
                    showHeaderRow,
                  }}
                  {...TableProps}
                  rows={displayRows}
                  pageIndex={tablePageIndex}
                  onChangePage={(pageIndex) => {
                    setTablePageIndex(pageIndex);
                  }}
                  onClickRow={onClickRow}
                  paging={false}
                />
              </Box>
            );
          })()}
          {showStatusBar ? (
            <Grid container sx={{ px: 3, py: 2 }}>
              <Grid item xs />
              <Grid item>
                {filteredRows.length > 0 ? (
                  filteredRows.length === rows.length ? (
                    <Typography variant="body2">
                      Displaying {filteredRows.length} rows
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      Filtering {filteredRows.length} out of {rows.length} rows
                    </Typography>
                  )
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </Paper>
      </PaddedContentArea>
    </>
  );
};
export default FullPageTable;
