import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  BoxProps,
  ClickAwayListener,
  IconButton,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Children, FC, ReactNode, useEffect, useRef, useState } from 'react';

import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';
import SearchField, { SearchFieldProps } from './SearchField';

export interface SearchSyncToolbarProps
  extends Omit<BoxProps, 'title'>,
    Partial<Pick<ReloadIconButtonProps, 'load' | 'loading' | 'errorMessage'>>,
    Pick<
      SearchFieldProps,
      'searchTerm' | 'onChangeSearchTerm' | 'onSearch' | 'searchVelocity'
    > {
  title?: ReactNode;
  /**
   * Determines whether the component should be rendered with a search tool.
   *
   * @default true
   */
  hasSearchTool?: boolean;
  searchFieldPlaceholder?: string;
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
  SearchFieldProps?: Partial<SearchFieldProps>;
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
  searchVelocity = 'slow',
  sx,
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
    <Box
      {...rest}
      sx={{
        pl: 3,
        pr: 2,
        ...sx,
      }}
    >
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
                      <SearchField
                        placeholder={searchFieldPlaceholder}
                        variant="outlined"
                        fullWidth
                        {...SearchFieldPropsRest}
                        InputProps={{
                          autoFocus:
                            searchTermProp.length <= 0 && searchFieldOpen,
                        }}
                        {...{
                          searchTerm,
                          onSearch,
                          onChangeSearchTerm,
                          searchVelocity,
                        }}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
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
            <SearchField
              placeholder={searchFieldPlaceholder}
              variant="standard"
              fullWidth
              {...SearchFieldPropsRest}
              {...{ searchTerm, onSearch, onChangeSearchTerm, searchVelocity }}
              InputProps={{
                disableUnderline: true,
              }}
              onChange={(event) => {
                setSearchTerm(event.target.value);
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
    </Box>
  );
};

export default SearchSyncToolbar;
