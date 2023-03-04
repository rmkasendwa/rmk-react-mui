import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  IconButtonProps,
  Tooltip,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  Children,
  Fragment,
  MutableRefObject,
  ReactNode,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';

import EllipsisMenuIconButton from './EllipsisMenuIconButton';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';
import SearchField, { SearchFieldProps } from './SearchField';

export interface SearchSyncToolbarClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SearchSyncToolbarClassKey = keyof SearchSyncToolbarClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSearchSyncToolbar: SearchSyncToolbarProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSearchSyncToolbar: keyof SearchSyncToolbarClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSearchSyncToolbar?: {
      defaultProps?: ComponentsProps['MuiSearchSyncToolbar'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSearchSyncToolbar'];
      variants?: ComponentsVariants['MuiSearchSyncToolbar'];
    };
  }
}

export interface BaseToolOptions {
  alwaysShowOn?: 'Large Screen' | 'Small Screen' | 'All Screens';
}

export interface ButtonTool
  extends Partial<Omit<ButtonProps, 'title' | 'type'>>,
    BaseToolOptions {
  label: ReactNode;
  type: 'button';
  title?: ReactNode;
  icon?: ReactNode;
  ref?: MutableRefObject<HTMLButtonElement | null>;
  popupElement?: ReactNode;
}

export interface IconButtonTool
  extends Partial<Omit<IconButtonProps, 'title' | 'type'>>,
    BaseToolOptions {
  label: ReactNode;
  icon: ReactNode;
  type: 'icon-button';
  title?: ReactNode;
  ref?: MutableRefObject<HTMLButtonElement | null>;
  popupElement?: ReactNode;
}

export interface ElementTool extends BaseToolOptions {
  element?: ReactNode;
}

export type Tool = ButtonTool | IconButtonTool | ElementTool;

export const getToolNodes = (
  tools: (ReactNode | Tool)[],
  showFullToolWidth: boolean
): ReactNode[] => {
  return tools
    .filter((baseTool) => baseTool)
    .map((baseTool) => {
      if (isValidElement(baseTool)) {
        return baseTool;
      } else {
        const tool = omit(baseTool as Tool, 'alwaysShowOn') as Tool;
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
                if (!showFullToolWidth) {
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
                      </Tooltip>
                      {popupElement}
                    </>
                  );
                }
                return (
                  <>
                    <Button startIcon={icon} {...rest} {...{ sx }}>
                      {label}
                    </Button>
                    {popupElement}
                  </>
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

export function getSearchSyncToolbarUtilityClass(slot: string): string {
  return generateUtilityClass('MuiSearchSyncToolbar', slot);
}

export const searchSyncToolbarClasses: SearchSyncToolbarClasses =
  generateUtilityClasses('MuiSearchSyncToolbar', ['root']);

const slots = {
  root: ['root'],
};

export const SearchSyncToolbar = forwardRef<any, SearchSyncToolbarProps>(
  function SearchSyncToolbar(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiSearchSyncToolbar',
    });
    const {
      className,
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
      preTitleTools = [],
      children,
      TitleProps = {},
      searchFieldOpen: searchFieldOpenProp,
      SearchFieldProps = {},
      searchVelocity = 'slow',
      sx,
      ...rest
    } = omit(props, 'tools');

    let { tools } = props;

    const classes = composeClasses(
      slots,
      getSearchSyncToolbarUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    tools || (tools = [...Children.toArray(children)]);
    const { ...SearchFieldPropsRest } = SearchFieldProps;

    // Refs
    const isInitialMountRef = useRef(true);
    const anchorElementRef = useRef<HTMLDivElement | null>(null);
    const onSearchRef = useRef(onSearch);
    useEffect(() => {
      onSearchRef.current = onSearch;
    }, [onSearch]);

    const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;

    const { breakpoints } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

    const [showFullToolWidth, setShowFullToolWidth] = useState(false);
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
      if (anchorElementRef.current) {
        const anchorElement = anchorElementRef.current;
        const windowResizeEventCallback = () => {
          setShowFullToolWidth(() => {
            if (hasSearchTool && title) {
              return anchorElement.offsetWidth > 960;
            }
            return anchorElement.offsetWidth > 800;
          });
        };
        window.addEventListener('resize', windowResizeEventCallback);
        windowResizeEventCallback();
        return () => {
          window.removeEventListener('resize', windowResizeEventCallback);
        };
      }
    }, [hasSearchTool, title]);

    useEffect(() => {
      isInitialMountRef.current = false;
      return () => {
        isInitialMountRef.current = true;
      };
    }, []);

    return (
      <Box
        ref={mergeRefs([anchorElementRef, ref])}
        {...rest}
        className={clsx(classes.root)}
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
              return getToolNodes(preTitleTools, showFullToolWidth).map(
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
            if (!isSmallScreenSize) {
              return getToolNodes(tools, showFullToolWidth).map(
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
          {hasSyncTool && load ? (
            <Grid item>
              <ReloadIconButton {...{ load, loading, errorMessage }} />
            </Grid>
          ) : null}
          {(() => {
            if (isSmallScreenSize) {
              const smallScreenDisplayableTools = [...preTitleTools, ...tools]
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
              const [smallScreenTools, ellipsisTools] =
                smallScreenDisplayableTools.reduce(
                  (accumulator, tool) => {
                    const [smallScreenTools, ellipsisTools] = accumulator;
                    if (
                      tool.alwaysShowOn &&
                      (
                        [
                          'All Screens',
                          'Small Screen',
                        ] as typeof tool.alwaysShowOn[]
                      ).includes(tool.alwaysShowOn) &&
                      tool.type === 'icon-button'
                    ) {
                      smallScreenTools.push(tool);
                    } else {
                      ellipsisTools.push(tool);
                    }
                    return accumulator;
                  },
                  [[], []] as [
                    typeof smallScreenDisplayableTools,
                    typeof smallScreenDisplayableTools
                  ]
                );
              return (
                <>
                  {smallScreenTools.length > 0
                    ? getToolNodes(smallScreenTools, showFullToolWidth).map(
                        (tool, index) => {
                          return (
                            <Grid item key={index} sx={{ minWidth: 0 }}>
                              {tool}
                            </Grid>
                          );
                        }
                      )
                    : null}
                  {ellipsisTools.length > 0 ? (
                    <Grid item>
                      <EllipsisMenuIconButton
                        options={ellipsisTools.map(
                          ({ label, icon, ref, onClick }, index) => {
                            return {
                              ref: ref as any,
                              label,
                              icon,
                              value: index,
                              onClick: onClick as any,
                            };
                          }
                        )}
                      />
                      {ellipsisTools.map(({ popupElement }, index) => {
                        return <Fragment key={index}>{popupElement}</Fragment>;
                      })}
                    </Grid>
                  ) : null}
                </>
              );
            }
          })()}
        </Grid>
      </Box>
    );
  }
);

export default SearchSyncToolbar;
