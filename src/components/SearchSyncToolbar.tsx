import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  ClickAwayListener,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';

import EllipsisMenuIconButton from './EllipsisMenuIconButton';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';
import SearchField, { SearchFieldProps } from './SearchField';

export interface Tool
  extends Pick<
    ButtonProps,
    'sx' | 'onMouseDown' | 'onClick' | 'className' | 'color' | 'variant'
  > {
  label: ReactNode;
  type: 'button' | 'icon-button';
  icon?: ReactNode;
}

export const getToolNodes = (tools: (ReactNode | Tool)[]) => {
  return tools.map((tool) => {
    if (tool && typeof tool === 'object' && 'type' in tool) {
      const { label, type, icon, sx, ...rest } = tool as Tool;
      switch (type) {
        case 'icon-button':
          return (
            <Tooltip
              title={label}
              PopperProps={{
                sx: {
                  pointerEvents: 'none',
                },
              }}
            >
              <IconButton {...{ sx }}>{icon}</IconButton>
            </Tooltip>
          );
        case 'button':
          return (
            <Button startIcon={icon} {...rest} {...{ sx }}>
              {label}
            </Button>
          );
      }
    }
    return tool;
  });
};

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
  tools?: (ReactNode | Tool)[];
  preTitleTools?: (ReactNode | Tool)[];
  /**
   * Extra tools to be added to the toolbar.
   * Note: Tools will always over-write children.
   *
   */
  children?: ReactNode;
  TitleProps?: Partial<Omit<LoadingTypographyProps, 'ref'>>;
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
  tools = [],
  preTitleTools = [],
  children,
  TitleProps = {},
  searchFieldOpen: searchFieldOpenProp,
  SearchFieldProps = {},
  searchVelocity = 'slow',
  sx,
  ...rest
}) => {
  tools || (tools = [children]);
  const { ...SearchFieldPropsRest } = SearchFieldProps;

  // Refs
  const onSearchRef = useRef(onSearch);
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;

  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

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
        [breakpoints.down('sm')]: {
          pl: 2,
        },
        ...sx,
      }}
    >
      <Grid container sx={{ alignItems: 'center', columnGap: 1 }}>
        {(() => {
          if (preTitleTools && !isSmallScreenSize) {
            return getToolNodes(preTitleTools).map((tool, index) => {
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
              <LoadingTypography
                {...({ component: 'div' } as any)}
                {...titlePropsRest}
                noWrap
                sx={{
                  lineHeight: '48px',
                  ...titlePropsSx,
                }}
              >
                {title}
              </LoadingTypography>
            </Grid>
            {hasSearchTool ? (
              <Grid
                item
                sx={{
                  display: 'flex',
                  flex:
                    searchFieldOpen ||
                    (searchFieldOpenProp && !isSmallScreenSize)
                      ? 1
                      : 'none',
                  maxWidth: 300,
                  minWidth: 0,
                }}
              >
                {searchFieldOpen ||
                (searchFieldOpenProp && !isSmallScreenSize) ? (
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
              {...{
                searchTerm,
                onSearch,
                onChangeSearchTerm,
                searchVelocity,
              }}
              InputProps={{
                disableUnderline: true,
              }}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
            />
          </Grid>
        ) : (
          <Grid item xs />
        )}
        {(() => {
          if (tools && !isSmallScreenSize) {
            return getToolNodes(tools).map((tool, index) => {
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
        {(() => {
          if (isSmallScreenSize) {
            const smallScreenTools = [...preTitleTools, ...tools]
              .filter((tool) => {
                return tool && typeof tool === 'object' && 'label' in tool;
              })
              .map((tool) => {
                return tool as Tool;
              });
            if (smallScreenTools.length > 0) {
              return (
                <EllipsisMenuIconButton
                  options={smallScreenTools.map(({ label, icon }, index) => {
                    return {
                      label,
                      icon,
                      value: index,
                    };
                  })}
                />
              );
            }
          }
        })()}
      </Grid>
    </Box>
  );
};

export default SearchSyncToolbar;
