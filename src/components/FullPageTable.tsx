import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ILoadingProps } from '../interfaces';
import ErrorAlert from './ErrorAlert';
import LoadingScreen from './LoadingScreen';
import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';
import ReloadIconButton from './ReloadIconButton';
import Table, { ITableProps } from './Table';

export interface IFullPageTableProps
  extends IPaddedContentAreaProps,
    Pick<
      ITableProps,
      | 'columns'
      | 'rows'
      | 'onClickRow'
      | 'forEachDerivedColumn'
      | 'labelPlural'
      | 'variant'
    >,
    Partial<ILoadingProps> {
  pathToAddNew?: string;
  load?: () => void;
}

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
  loading,
  errorMessage,
  load,
}) => {
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
  const searchableFieldLabels = columns.map(({ label }) => label.toLowerCase());
  const searchFieldPlaceholder = `Search by ${searchableFieldLabels
    .slice(0, -1)
    .join(', ')}, or ${searchableFieldLabels.slice(-1)}`;

  const theme = useTheme();

  useEffect(() => {
    if (searchTerm.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredRows(
        rows.filter((row) => {
          return searchableColumnIds.some((columnId) => {
            const columnValue = row[columnId];
            if (Array.isArray(columnValue)) {
              return columnValue.some((item) => {
                return (
                  typeof item === 'string' &&
                  item.toLowerCase().match(lowerCaseSearchTerm)
                );
              });
            }
            return (
              typeof columnValue === 'string' &&
              columnValue.toLowerCase().match(lowerCaseSearchTerm)
            );
          });
        })
      );
    } else {
      setFilteredRows(rows);
    }
  }, [rows, searchTerm, searchTerm.length, searchableColumnIds]);

  useEffect(() => {
    if (tableWrapperDiv && document.scrollingElement) {
      const scrollCallback = () => {
        const { scrollY } = window;
        const topRowCount = Math.floor(scrollY / 54);
        setDisplayRows(
          filteredRows.slice(
            0,
            topRowCount + Math.ceil(window.innerHeight / 54)
          )
        );
      };

      window.addEventListener('scroll', scrollCallback);
      scrollCallback();
      return () => {
        window.removeEventListener('scroll', scrollCallback);
      };
    }
  }, [filteredRows, filteredRows.length, tableWrapperDiv]);

  useEffect(() => {
    if (tableWrapperDiv) {
      tableWrapperDiv.style.minHeight = `${(filteredRows.length + 2) * 54}px`;
    }
  }, [filteredRows.length, tableWrapperDiv]);

  useEffect(() => {
    const scrollCallback = () => {
      const { scrollY } = window;
      setShowStickyToolBar((previousValue) => {
        if (previousValue === false) {
          if (scrollY >= 85) {
            if (scrollY < 130 && document.scrollingElement) {
              document.scrollingElement.scrollTop = 130;
            }
            return true;
          }
        } else {
          if (scrollY < 120) {
            if (scrollY >= 85 && document.scrollingElement) {
              document.scrollingElement.scrollTop = 84;
            }
            return false;
          }
        }
        return previousValue;
      });
      if (scrollY >= 85) {
      } else {
        setShowStickyToolBar(false);
      }
    };
    window.addEventListener('scroll', scrollCallback);
    scrollCallback();
    return () => {
      window.removeEventListener('scroll', scrollCallback);
    };
  }, []);

  useEffect(() => {
    setDisplayRows(filteredRows.slice(0, Math.ceil(window.innerHeight / 54)));
  }, [filteredRows]);

  const toolbar = (
    <Toolbar>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <SearchIcon color="inherit" sx={{ display: 'block' }} />
        </Grid>
        <Grid item xs>
          <TextField
            fullWidth
            placeholder={searchFieldPlaceholder}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: 'default' },
              endAdornment: searchTerm && (
                <IconButton onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              ),
            }}
            variant="standard"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            disabled={loading && rows.length <= 0}
          />
        </Grid>
        <Grid item>
          {pathToAddNew && (
            <Button
              variant="contained"
              component={Link}
              to={pathToAddNew}
              sx={{ mr: 1 }}
              size="small"
            >
              Add New
            </Button>
          )}
          {loading && rows.length <= 0 ? null : (
            <ReloadIconButton {...{ load, loading }} />
          )}
        </Grid>
      </Grid>
    </Toolbar>
  );

  return (
    <>
      {showStickyToolBar && (
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${alpha(
              theme.palette.text.primary,
              0.12
            )}`,
            top: 56,
          }}
        >
          <Container>{toolbar}</Container>
        </AppBar>
      )}
      <PaddedContentArea title={title} tools={tools}>
        <Paper sx={{ overflow: 'hidden' }}>
          <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
              borderBottom: `1px solid ${alpha(
                theme.palette.text.primary,
                0.12
              )}`,
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
                  columns={columns}
                  rows={displayRows}
                  pageIndex={tablePageIndex}
                  onChangePage={(pageIndex) => {
                    setTablePageIndex(pageIndex);
                  }}
                  onClickRow={onClickRow}
                  forEachDerivedColumn={forEachDerivedColumn}
                  labelPlural={labelPlural}
                  variant={variant}
                  paging={false}
                />
              </Box>
            );
          })()}
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
        </Paper>
      </PaddedContentArea>
    </>
  );
};
export default FullPageTable;
