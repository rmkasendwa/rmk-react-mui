import SearchIcon from '@mui/icons-material/Search';
import {
  ClickAwayListener,
  IconButton,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Toolbar, { ToolbarProps } from '@mui/material/Toolbar';
import { Children, FC, ReactNode, useEffect, useRef, useState } from 'react';

import TextField, { TextFieldProps } from './InputFields/TextField';
import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';

export interface SearchSyncToolbarProps
  extends Omit<ToolbarProps, 'title'>,
    Partial<Pick<ReloadIconButtonProps, 'load' | 'loading' | 'errorMessage'>> {
  title?: ReactNode;
  /**
   * Determines whether the component should be rendered with a search tool.
   *
   * @default true
   */
  hasSearchTool?: boolean;
  searchTerm?: string;
  searchFieldPlaceholder?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  onSearch?: (searchTerm: string) => void;
  /**
   * Determines whether the component should be rendered with a synchronize tool.
   * Note: The synchronize tool will not be rendered if the load function is not supplied regardless of whether this value is set to true.
   *
   * @default true
   */
  hasSyncTool?: boolean;
  /**
   * Extra tools to be added to the toolbar.
   *
   */
  tools?: ReactNode | ReactNode[];
  preTitleTools?: ReactNode | ReactNode[];
  /**
   * Extra tools to be added to the toolbar.
   * Note: Tools will always over-write children.
   *
   */
  children?: ReactNode;
  TitleProps?: Partial<Omit<TypographyProps, 'ref'>>;
  searchFieldOpen?: boolean;
  SearchFieldProps?: Partial<TextFieldProps>;
}

export const SearchSyncToolbar: FC<SearchSyncToolbarProps> = ({
  title,
  hasSearchTool = true,
  searchTerm: searchTermProp = '',
  searchFieldPlaceholder,
  hasSyncTool = true,
  load,
  loading,
  errorMessage,
  onChangeSearchTerm,
  onSearch,
  tools,
  preTitleTools,
  children,
  TitleProps = {},
  searchFieldOpen: searchFieldOpenProp,
  SearchFieldProps = {},
  ...rest
}) => {
  tools || (tools = children);
  const { ...SearchFieldPropsRest } = SearchFieldProps;

  // Refs
  const onSearchRef = useRef(onSearch);
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFieldOpen, setSearchFieldOpen] = useState(
    searchTermProp.length > 0
  );

  useEffect(() => {
    if (searchTerm.length <= 0 && !isInitialMountRef.current) {
      onSearchRef.current && onSearchRef.current(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm(searchTermProp);
  }, [searchTermProp]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return (
    <Toolbar {...rest}>
      <Grid container sx={{ alignItems: 'center', columnGap: 1 }}>
        {(() => {
          if (preTitleTools) {
            return Children.toArray(preTitleTools).map((tool, index) => {
              return (
                <Grid item key={index} sx={{ minWidth: 0 }}>
                  {tool}
                </Grid>
              );
            });
          }
        })()}
        {title ? (
          <>
            <Grid item xs sx={{ minWidth: 0 }}>
              <Typography
                component="div"
                {...titlePropsRest}
                noWrap
                sx={{
                  lineHeight: '48px',
                  ...titlePropsSx,
                }}
              >
                {title}
              </Typography>
            </Grid>
            {hasSearchTool ? (
              <Grid
                item
                sx={{
                  display: 'flex',
                  flex: searchFieldOpen || searchFieldOpenProp ? 1 : 'none',
                  maxWidth: 300,
                  minWidth: 0,
                }}
              >
                {searchFieldOpen || searchFieldOpenProp ? (
                  (() => {
                    const textField = (
                      <TextField
                        placeholder={searchFieldPlaceholder}
                        variant="outlined"
                        fullWidth
                        {...SearchFieldPropsRest}
                        InputProps={{
                          startAdornment: (
                            <SearchIcon
                              color="inherit"
                              sx={{
                                mr: 0.5,
                              }}
                            />
                          ),
                          autoFocus:
                            searchTermProp.length <= 0 && searchFieldOpen,
                          sx: { fontSize: 'default' },
                        }}
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                          onChangeSearchTerm &&
                            onChangeSearchTerm(event.target.value);
                        }}
                        onKeyUp={(event) => {
                          if (event.key === 'Enter' && onSearch) {
                            onSearch(searchTerm);
                          }
                        }}
                        onBlur={() => {
                          onSearch && onSearch(searchTerm);
                        }}
                      />
                    );
                    return (
                      <ClickAwayListener
                        onClickAway={() => {
                          if (searchTerm.length <= 0) {
                            setSearchFieldOpen(false);
                          }
                        }}
                      >
                        {searchFieldPlaceholder ? (
                          <Tooltip title={searchFieldPlaceholder}>
                            {textField}
                          </Tooltip>
                        ) : (
                          textField
                        )}
                      </ClickAwayListener>
                    );
                  })()
                ) : (
                  <Tooltip title="Search">
                    <IconButton onClick={() => setSearchFieldOpen(true)}>
                      <SearchIcon color="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            ) : null}
          </>
        ) : hasSearchTool ? (
          <Grid item xs sx={{ minWidth: 0 }}>
            <TextField
              placeholder={searchFieldPlaceholder}
              variant="standard"
              fullWidth
              {...SearchFieldPropsRest}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    color="inherit"
                    sx={{
                      mr: 0.5,
                    }}
                  />
                ),
                disableUnderline: true,
                sx: { fontSize: 'default' },
              }}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                onChangeSearchTerm && onChangeSearchTerm(event.target.value);
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter' && onSearch) {
                  onSearch(searchTerm);
                }
              }}
              onBlur={() => {
                onSearch && onSearch(searchTerm);
              }}
            />
          </Grid>
        ) : null}
        {(() => {
          if (tools) {
            return Children.toArray(tools).map((tool, index) => {
              return (
                <Grid item key={index} sx={{ minWidth: 0 }}>
                  {tool}
                </Grid>
              );
            });
          }
        })()}
        {hasSyncTool && load ? (
          <Grid item>
            <ReloadIconButton {...{ load, loading, errorMessage }} />
          </Grid>
        ) : null}
      </Grid>
    </Toolbar>
  );
};

export default SearchSyncToolbar;
