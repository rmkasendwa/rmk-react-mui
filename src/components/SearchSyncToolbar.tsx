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
  Divider,
  DividerProps,
  IconButton,
  IconButtonProps,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import buttonClasses from '@mui/material/Button/buttonClasses';
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
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';

import EllipsisMenuIconButton from './EllipsisMenuIconButton';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import ReloadIconButton, { ReloadIconButtonProps } from './ReloadIconButton';
import SearchField, { SearchFieldProps } from './SearchField';
import Tooltip from './Tooltip';

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
  component?: any;
  getToolElement?: (element: ReactNode) => ReactNode;
  extraToolProps?: any;
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
  element: ReactNode;
  elementMaxWidth: number;
  collapsedElement: ReactNode;
  collapsedElementMaxWidth: number;
}

export interface DividerTool extends Partial<DividerProps>, BaseToolOptions {
  type: 'divider';
}

export type Tool = ButtonTool | IconButtonTool | ElementTool | DividerTool;

const MAX_BUTTON_WIDTH = 150;
const MAX_ELEMENT_TOOL_WIDTH = 300;

export const getToolNodes = (
  tools: (ReactNode | Tool)[],
  collapsedWidthToolIndex = 0
): ReactNode[] => {
  return tools
    .filter((baseTool) => baseTool)
    .map((baseTool, index) => {
      if (isValidElement(baseTool)) {
        return baseTool;
      } else {
        const tool = omit(baseTool as Tool, 'alwaysShowOn') as Tool;
        const { getToolElement } = tool;
        const toolElement = (() => {
          if ('element' in tool) {
            if (index >= tools.length - collapsedWidthToolIndex) {
              return tool.collapsedElement;
            }
            return tool.element;
          }
          if ('type' in tool) {
            switch (tool.type) {
              case 'icon-button': {
                const { label, icon, title, popupElement, sx, ...rest } = omit(
                  tool,
                  'type',
                  'extraToolProps'
                );
                return (
                  <>
                    <Tooltip title={title || label} disableInteractive>
                      <IconButton
                        {...rest}
                        sx={{
                          ...sx,
                          p: 0.5,
                        }}
                      >
                        {icon}
                      </IconButton>
                    </Tooltip>
                    {popupElement}
                  </>
                );
              }
              case 'button': {
                const { label, icon, title, sx, popupElement, ...rest } = omit(
                  tool,
                  'type',
                  'extraToolProps'
                );
                const buttonElement = (() => {
                  if (index >= tools.length - collapsedWidthToolIndex) {
                    return (
                      <>
                        <Tooltip title={title || label} disableInteractive>
                          <Button
                            {...rest}
                            sx={{
                              ...sx,
                              minWidth: 'auto',
                              maxWidth: MAX_BUTTON_WIDTH,
                              px: 1,
                              '&>svg': {
                                fontSize: 20,
                              },
                              [`.${buttonClasses.endIcon}`]: {
                                m: 0,
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
                      <Tooltip title={label} disableInteractive>
                        <Button
                          startIcon={icon}
                          {...rest}
                          sx={{
                            maxWidth: MAX_BUTTON_WIDTH,
                            ...sx,
                          }}
                        >
                          <Typography component="div" variant="inherit" noWrap>
                            {label}
                          </Typography>
                        </Button>
                      </Tooltip>
                      {popupElement}
                    </>
                  );
                })();
                if (title) {
                  return (
                    <Tooltip {...{ title }} disableInteractive>
                      {buttonElement}
                    </Tooltip>
                  );
                }
                return buttonElement;
              }
              case 'divider': {
                return (
                  <Divider
                    {...omit(tool, 'type', 'extraToolProps')}
                    orientation="vertical"
                    sx={{
                      height: 30,
                      mx: 2,
                    }}
                  />
                );
              }
            }
          }
        })();
        if (getToolElement) {
          return getToolElement(toolElement);
        }
        return toolElement;
      }
    })
    .filter((tool) => {
      return tool != null;
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
  postSyncButtonTools?: (ReactNode | Tool)[];
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
      searchTerm,
      searchFieldPlaceholder,
      hasSyncTool = true,
      load,
      loading,
      errorMessage,
      onChangeSearchTerm,
      onSearch,
      preTitleTools = [],
      postSyncButtonTools = [],
      children,
      TitleProps = {},
      searchFieldOpen: searchFieldOpenProp,
      SearchFieldProps = {},
      searchVelocity = 'slow',
      sx,
      ...rest
    } = omit(props, 'tools');

    let { tools: toolsProp } = props;

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

    toolsProp || (toolsProp = [...Children.toArray(children)]);

    //#region Filter null element tools and pointless divider tools
    const tools = toolsProp.reduce<NonNullable<(typeof toolsProp)[number]>[]>(
      (accumulator, tool) => {
        if (tool != null) {
          const lastTool = accumulator[accumulator.length - 1];
          if (
            typeof tool === 'object' &&
            'type' in tool &&
            tool.type === 'divider' &&
            (!lastTool ||
              (typeof lastTool === 'object' &&
                'type' in lastTool &&
                lastTool.type === 'divider'))
          ) {
            return accumulator;
          }
          accumulator.push(tool);
        }
        return accumulator;
      },
      []
    );
    //#endregion

    const { InputProps, ...SearchFieldPropsRest } = SearchFieldProps;

    //#region Refs
    const isInitialMountRef = useRef(true);

    const anchorElementRef = useRef<HTMLDivElement | null>(null);
    const toolsRef = useRef(tools);
    toolsRef.current = tools;
    //#endregion

    const { sx: TitlePropsSx, ...TitlePropsRest } = TitleProps;

    const { breakpoints } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

    const [collapsedWidthToolIndex, setCollapsedWidthToolIndex] = useState(
      tools.length
    );
    const [collapseAllToolsIntoEllipsis, setCollapseAllToolsIntoEllipsis] =
      useState(false);
    const [searchFieldOpen, setSearchFieldOpen] = useState(
      Boolean(searchTerm && searchTerm.length > 0)
    );

    const updateCollapsedWidthToolIndex = useCallback(
      (anchorElement: HTMLDivElement) => {
        if (tools?.length != null) {
          const toolMaxWidths = toolsRef.current.map((tool) => {
            if (typeof tool === 'object') {
              if ('type' in tool) {
                switch (tool.type) {
                  case 'button':
                    return {
                      elementMaxWidth: MAX_BUTTON_WIDTH,
                      collapsedElementWidth: 32,
                    };
                  case 'icon-button':
                    return {
                      elementMaxWidth: 32,
                      collapsedElementWidth: 32,
                    };
                  case 'divider':
                    return {
                      elementMaxWidth: 33,
                      collapsedElementWidth: 33,
                    };
                }
              }
              if ('element' in tool) {
                return {
                  elementMaxWidth: tool.elementMaxWidth,
                  collapsedElementWidth: tool.collapsedElementMaxWidth,
                };
              }
            }
            return {
              elementMaxWidth: MAX_ELEMENT_TOOL_WIDTH,
              collapsedElementWidth: 32,
            };
          });

          const containerWidth = anchorElement.offsetWidth;
          const searchFieldAndTitleSpaceWidth = (() => {
            let width = 0;
            if (title) {
              width += 300;
            }
            if (hasSearchTool) {
              width += 200;
            }
            return width;
          })();
          const cummulativeToolsGapWidth = (toolsRef.current.length - 1) * 8;

          for (let i = 0; i < tools.length; i++) {
            const fullWidthToolsWidth = toolMaxWidths
              .slice(0, toolMaxWidths.length - i)
              .reduce((a, { elementMaxWidth }) => a + elementMaxWidth, 0);
            const collapsedWidthToolsWidth =
              i > 0
                ? toolMaxWidths
                    .slice(-i)
                    .reduce(
                      (a, { collapsedElementWidth }) =>
                        a + collapsedElementWidth,
                      0
                    )
                : 0;

            if (
              containerWidth -
                (fullWidthToolsWidth +
                  collapsedWidthToolsWidth +
                  cummulativeToolsGapWidth) >=
              searchFieldAndTitleSpaceWidth
            ) {
              setCollapsedWidthToolIndex(i);
              setCollapseAllToolsIntoEllipsis(false);
              return;
            }
          }
          setCollapsedWidthToolIndex(tools.length);

          const collapsedWidthToolsWidth = toolMaxWidths.reduce(
            (a, { collapsedElementWidth }) => a + collapsedElementWidth,
            0
          );
          setCollapseAllToolsIntoEllipsis(
            containerWidth -
              (collapsedWidthToolsWidth + cummulativeToolsGapWidth) <
              searchFieldAndTitleSpaceWidth
          );
        }
      },
      [hasSearchTool, title, tools.length]
    );

    useEffect(() => {
      if (anchorElementRef.current) {
        const anchorElement = anchorElementRef.current;
        const windowResizeEventCallback = () => {
          updateCollapsedWidthToolIndex(anchorElement);
        };
        window.addEventListener('resize', windowResizeEventCallback);
        windowResizeEventCallback();
        return () => {
          window.removeEventListener('resize', windowResizeEventCallback);
        };
      }
    }, [updateCollapsedWidthToolIndex]);

    useEffect(() => {
      isInitialMountRef.current = false;
      return () => {
        isInitialMountRef.current = true;
      };
    }, []);

    const syncButtonElement = (() => {
      if (hasSyncTool && load) {
        return (
          <ReloadIconButton
            {...{ load, loading, errorMessage }}
            IconButtonProps={{
              sx: {
                p: 0.5,
              },
            }}
          />
        );
      }
    })();

    return (
      <Box
        ref={mergeRefs([
          (anchorElement: HTMLDivElement | null) => {
            if (anchorElement) {
              updateCollapsedWidthToolIndex(anchorElement);
            }
          },
          anchorElementRef,
          ref,
        ])}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          px: isSmallScreenSize ? 2 : 3,
          ...sx,
        }}
      >
        <Grid
          container
          sx={{
            height: 50,
            alignItems: 'center',
            columnGap: collapsedWidthToolIndex < tools.length ? 1 : 0.5,
          }}
        >
          {(() => {
            if (
              preTitleTools.length > 0 &&
              !isSmallScreenSize &&
              !collapseAllToolsIntoEllipsis
            ) {
              return getToolNodes(preTitleTools, collapsedWidthToolIndex).map(
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
                  ...InputProps,
                  disableUnderline: true,
                  autoFocus: Boolean(
                    (!searchTerm || searchTerm.length <= 0) && searchFieldOpen
                  ),
                }}
                size="small"
              />
            );

            if (isSmallScreenSize && hasSearchTool && searchFieldOpen) {
              return (
                <Grid item xs sx={{ minWidth: 0 }}>
                  <ClickAwayListener
                    onClickAway={() => {
                      if (!searchTerm || searchTerm.length <= 0) {
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
                      {...TitlePropsRest}
                      noWrap
                      sx={{
                        lineHeight: '48px',
                        ...TitlePropsSx,
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
                        minWidth: (() => {
                          if (
                            searchFieldOpen ||
                            (searchFieldOpenProp && !isSmallScreenSize)
                          ) {
                            return 240;
                          }
                          return 0;
                        })(),
                        ...(() => {
                          if (!isSmallScreenSize) {
                            return {
                              pr: 1,
                            };
                          }
                        })(),
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
                                ...InputProps,
                                autoFocus: Boolean(
                                  (!searchTerm || searchTerm.length <= 0) &&
                                    searchFieldOpen
                                ),
                              }}
                              {...{
                                searchTerm,
                                onSearch,
                                onChangeSearchTerm,
                                searchVelocity,
                              }}
                              size="small"
                            />
                          );
                          return (
                            <ClickAwayListener
                              onClickAway={() => {
                                if (!searchTerm || searchTerm.length <= 0) {
                                  setSearchFieldOpen(false);
                                }
                              }}
                            >
                              {searchFieldPlaceholder ? (
                                <Tooltip
                                  title={searchFieldPlaceholder}
                                  disableInteractive
                                >
                                  {textField}
                                </Tooltip>
                              ) : (
                                textField
                              )}
                            </ClickAwayListener>
                          );
                        })()
                      ) : (
                        <Tooltip title="Search" disableInteractive>
                          <IconButton
                            onClick={() => setSearchFieldOpen(true)}
                            sx={{
                              p: 0.5,
                            }}
                          >
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
            if (!isSmallScreenSize && !collapseAllToolsIntoEllipsis) {
              return getToolNodes(tools, collapsedWidthToolIndex).map(
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
            if (isSmallScreenSize || collapseAllToolsIntoEllipsis) {
              const allTools = [
                ...preTitleTools,
                ...tools,
                ...postSyncButtonTools,
              ];
              const smallScreenDisplayableTools = allTools
                .filter((tool) => {
                  return (
                    tool && !isValidElement(tool) && typeof tool === 'object'
                  );
                })
                .map((tool) => {
                  return tool as
                    | ButtonTool
                    | IconButtonTool
                    | DividerTool
                    | ElementTool;
                });
              const [smallScreenTools, ellipsisTools] =
                smallScreenDisplayableTools.reduce<
                  [
                    typeof smallScreenDisplayableTools,
                    typeof smallScreenDisplayableTools
                  ]
                >(
                  (accumulator, tool) => {
                    const [smallScreenTools, ellipsisTools] = accumulator;
                    if (
                      tool.alwaysShowOn &&
                      (
                        [
                          'All Screens',
                          'Small Screen',
                        ] as (typeof tool.alwaysShowOn)[]
                      ).includes(tool.alwaysShowOn) &&
                      'type' in tool &&
                      tool.type === 'icon-button'
                    ) {
                      smallScreenTools.push(tool);
                    } else {
                      ellipsisTools.push(tool);
                    }
                    return accumulator;
                  },
                  [[], []]
                );
              return (
                <>
                  {allTools
                    .filter((tool) => {
                      return tool && isValidElement(tool);
                    })
                    .map((tool, index) => {
                      return (
                        <Grid item key={index} sx={{ minWidth: 0 }}>
                          {tool as ReactNode}
                        </Grid>
                      );
                    })}
                  {smallScreenTools.length > 0
                    ? getToolNodes(
                        smallScreenTools,
                        collapsedWidthToolIndex
                      ).map((tool, index) => {
                        return (
                          <Grid item key={index} sx={{ minWidth: 0 }}>
                            {tool}
                          </Grid>
                        );
                      })
                    : null}
                  {syncButtonElement ? (
                    <Grid item>{syncButtonElement}</Grid>
                  ) : null}
                  {ellipsisTools.length > 0 ? (
                    <Grid item>
                      <EllipsisMenuIconButton
                        options={ellipsisTools.map((tool, index) => {
                          if ('type' in tool) {
                            if (tool.type === 'divider') {
                              return {
                                label: <Divider />,
                                value: index,
                                selectable: false,
                                isDropdownOption: false,
                              };
                            }
                            const { label, icon, ref, onClick } = tool;
                            return {
                              ref: ref as any,
                              label,
                              icon,
                              value: index,
                              onClick: onClick as any,
                            };
                          }
                          const { element } = tool;
                          return {
                            label: (
                              <Box
                                sx={{
                                  px: 2,
                                  py: 1,
                                }}
                              >
                                {element}
                              </Box>
                            ),
                            value: index,
                            isDropdownOption: false,
                          };
                        })}
                        PaginatedDropdownOptionListProps={{
                          paging: false,
                        }}
                      />
                      {ellipsisTools.map((tool, index) => {
                        return (
                          <Fragment key={index}>
                            {(() => {
                              if ('popupElement' in tool) {
                                return tool.popupElement;
                              }
                            })()}
                          </Fragment>
                        );
                      })}
                    </Grid>
                  ) : null}
                </>
              );
            }
            if (syncButtonElement) {
              return <Grid item>{syncButtonElement}</Grid>;
            }
          })()}
          {(() => {
            if (
              postSyncButtonTools.length > 0 &&
              !isSmallScreenSize &&
              !collapseAllToolsIntoEllipsis
            ) {
              return getToolNodes(
                postSyncButtonTools,
                collapsedWidthToolIndex
              ).map((tool, index) => {
                return (
                  <Grid item key={index} sx={{ minWidth: 0 }}>
                    {tool}
                  </Grid>
                );
              });
            }
          })()}
        </Grid>
      </Box>
    );
  }
);

export default SearchSyncToolbar;
