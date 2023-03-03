import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  ClickAwayListener,
  IconButton,
  IconButtonProps,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { omit } from 'lodash';
import {
  FC,
  MutableRefObject,
  ReactNode,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';

import EllipsisMenuIconButton from './EllipsisMenuIconButton';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';
import SearchField, { SearchFieldProps } from './SearchField';

export interface ButtonTool
  extends Pick<
    ButtonProps,
    | 'sx'
    | 'onMouseDown'
    | 'onClick'
    | 'className'
    | 'color'
    | 'variant'
    | 'endIcon'
  > {
  label?: ReactNode;
  title?: ReactNode;
  type: 'button';
  icon?: ReactNode;
  ref?: MutableRefObject<HTMLButtonElement | null>;
  popupElement?: ReactNode;
}

export interface IconButtonTool
  extends Pick<
    IconButtonProps,
    'sx' | 'onMouseDown' | 'onClick' | 'className' | 'color'
  > {
  label?: ReactNode;
  title?: ReactNode;
  type: 'icon-button';
  icon?: ReactNode;
  ref?: MutableRefObject<HTMLButtonElement | null>;
  popupElement?: ReactNode;
}

export interface ElementTool {
  element?: ReactNode;
}

export type Tool = ButtonTool | IconButtonTool | ElementTool;

export const getToolNodes = (
  tools: (ReactNode | Tool)[],
  isLargeScreenSize: boolean
): ReactNode[] => {
  return tools
    .filter((baseTool) => baseTool)
    .map((baseTool) => {
      if (isValidElement(baseTool)) {
        return baseTool;
      } else {
        const tool = baseTool as Tool;
        if ('element' in tool) {
          return tool.element;
        }
        if ('type' in tool) {
          switch (tool.type) {
            case 'icon-button': {
              const { label, icon, title, popupElement, ...rest } = omit(
                tool,
                'type'
              );
              return (
                <>
                  <Tooltip
                    title={title || label}
                    PopperProps={{
                      sx: {
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <IconButton {...rest}>{icon}</IconButton>
                  </Tooltip>
                  {popupElement}
                </>
              );
            }
            case 'button': {
              const { label, icon, title, sx, popupElement, ...rest } = omit(
                tool,
                'type'
              );
              const buttonElement = (() => {
                if (!isLargeScreenSize) {
                  return (
                    <>
                      <Button
                        {...rest}
                        sx={{
                          ...sx,
                          minWidth: 'auto',
                          px: 0.5,
                          '&>svg': {
                            fontSize: 16,
                          },
                        }}
                      >
                        {icon}
                      </Button>
                      {popupElement}
                    </>
                  );
                }
                return (
                  <Button startIcon={icon} {...rest} {...{ sx }}>
                    {label}
                  </Button>
                );
              })();
              if (title) {
                return <Tooltip {...{ title }}>{buttonElement}</Tooltip>;
              }
              return buttonElement;
            }
          }
        }
      }
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
  const isLargeScreenSize = useMediaQuery(breakpoints.up(1200));
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
        ...sx,
      }}
    >
      <Grid
        container
        sx={{
          height: 50,
          alignItems: 'center',
          ...(() => {
            if (!isSmallScreenSize) {
              return {
                columnGap: 1,
              };
            }
          })(),
        }}
      >
        {(() => {
          if (preTitleTools && !isSmallScreenSize) {
            return getToolNodes(preTitleTools, isLargeScreenSize).map(
              (tool, index) => {
                return (
                  <Grid item key={index} sx={{ minWidth: 0 }}>
                    {tool}
                  </Grid>
                );
              }
            );
          }
        })()}
        {(() => {
          const standardSearchFieldElement = (
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
          );

          if (isSmallScreenSize && hasSearchTool && searchFieldOpen) {
            return (
              <Grid item xs sx={{ minWidth: 0 }}>
                <ClickAwayListener
                  onClickAway={() => {
                    if (searchTerm.length <= 0) {
                      setSearchFieldOpen(false);
                    }
                  }}
                >
                  {standardSearchFieldElement}
                </ClickAwayListener>
              </Grid>
            );
          }

          if (title) {
            return (
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
            );
          }

          if (hasSearchTool) {
            return (
              <Grid item xs sx={{ minWidth: 0 }}>
                {standardSearchFieldElement}
              </Grid>
            );
          }
          return <Grid item xs />;
        })()}
        {(() => {
          if (tools && !isSmallScreenSize) {
            return getToolNodes(tools, isLargeScreenSize).map((tool, index) => {
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
                return (
                  tool &&
                  !isValidElement(tool) &&
                  typeof tool === 'object' &&
                  !('element' in tool)
                );
              })
              .map((tool) => {
                return tool as ButtonTool | IconButtonTool;
              });
            if (smallScreenTools.length > 0) {
              return (
                <EllipsisMenuIconButton
                  options={smallScreenTools.map(
                    ({ label, icon, ref }, index) => {
                      return { ref, label, icon, value: index };
                    }
                  )}
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
