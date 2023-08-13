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
  alpha,
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
  fullWidthToolWrapper: string;
  collapsedToolWrapper: string;
  syncToolWrapper: string;
  fullWidthSearchToolWrapper: string;
  collapsedSearchToolWrapper: string;
  expansionGap: string;
  titleWrapper: string;
  ellipsisButtonToolWrapper: string;
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
const MAX_TITLE_WIDTH = 300;
const MAX_SEARCH_FIELD_WIDTH = 240;
const ELLIPSIS_MENU_TOOL_WIDTH = 32;

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

/**
 * Props interface for the SearchSyncToolbar component.
 * Extends the BoxProps interface with some properties omitted and some properties picked from other interfaces.
 */
export interface SearchSyncToolbarProps
  extends Omit<BoxProps, 'title'>,
    Partial<Pick<ReloadIconButtonProps, 'load' | 'loading' | 'errorMessage'>>,
    Pick<
      SearchFieldProps,
      'searchTerm' | 'onChangeSearchTerm' | 'onSearch' | 'searchVelocity'
    > {
  /**
   * The title of the toolbar. It can accept a ReactNode to render custom content.
   */
  title?: ReactNode;
  /**
   * Determines whether the component should be rendered with a search tool.
   *
   * @default true
   */
  hasSearchTool?: boolean;
  /**
   * The placeholder text for the search field.
   */
  searchFieldPlaceholder?: string;
  /**
   * Determines whether the component should be rendered with a synchronize tool.
   * Note: The synchronize tool will not be rendered if the load function is not supplied regardless of whether this value is set to true.
   *
   * @default true
   */
  hasSyncTool?: boolean;
  /**
   * An array of extra tools to be added to the toolbar.
   * These tools can be ReactNodes or Tool objects.
   */
  tools?: (ReactNode | Tool)[];
  /**
   * An array of extra tools to be added before the title in the toolbar.
   * These tools can be ReactNodes or Tool objects.
   */
  preTitleTools?: (ReactNode | Tool)[];
  /**
   * An array of extra tools to be added after the synchronize button in the toolbar.
   * These tools can be ReactNodes or Tool objects.
   */
  postSyncButtonTools?: (ReactNode | Tool)[];
  /**
   * Extra tools to be added to the toolbar.
   * Note: Tools will always overwrite children.
   *
   * These tools can be ReactNodes or Tool objects.
   */
  children?: ReactNode;
  /**
   * Props for customizing the title component.
   * Accepts properties from LoadingTypographyProps interface with some properties omitted.
   */
  TitleProps?: Partial<Omit<LoadingTypographyProps, 'ref'>>;
  /**
   * Determines whether the search field should be open or closed.
   */
  searchFieldOpen?: boolean;
  /**
   * Props for customizing the search field component.
   * Accepts properties from SearchFieldProps interface.
   */
  SearchFieldProps?: Partial<SearchFieldProps>;
  /**
   * The alignment of the tools in the toolbar.
   *
   * @default 'end'
   */
  alignTools?: 'start' | 'end';
  /**
   * The maximum width of the title.
   */
  maxTitleWidth?: number;
  /**
   * The maximum width of the search field.
   */
  maxSearchFieldWidth?: number;
}

export function getSearchSyncToolbarUtilityClass(slot: string): string {
  return generateUtilityClass('MuiSearchSyncToolbar', slot);
}

export const searchSyncToolbarClasses: SearchSyncToolbarClasses =
  generateUtilityClasses('MuiSearchSyncToolbar', [
    'root',
    'fullWidthToolWrapper',
    'collapsedToolWrapper',
    'syncToolWrapper',
    'fullWidthSearchToolWrapper',
    'collapsedSearchToolWrapper',
    'expansionGap',
    'titleWrapper',
    'ellipsisButtonToolWrapper',
  ]);

const slots = {
  root: ['root'],
  fullWidthToolWrapper: ['fullWidthToolWrapper'],
  collapsedToolWrapper: ['collapsedToolWrapper'],
  syncToolWrapper: ['syncToolWrapper'],
  fullWidthSearchToolWrapper: ['fullWidthSearchToolWrapper'],
  collapsedSearchToolWrapper: ['collapsedSearchToolWrapper'],
  expansionGap: ['expansionGap'],
  titleWrapper: ['titleWrapper'],
  ellipsisButtonToolWrapper: ['ellipsisButtonToolWrapper'],
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
      alignTools = 'end',
      maxTitleWidth = MAX_TITLE_WIDTH,
      maxSearchFieldWidth = MAX_SEARCH_FIELD_WIDTH,
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

    const filterPointlessDividerTools = (
      tools: NonNullable<typeof toolsProp>
    ) => {
      return tools.reduce<(typeof tools)[number][]>(
        (accumulator, tool, index) => {
          if (tool != null) {
            const lastTool = accumulator[accumulator.length - 1];
            if (
              typeof tool === 'object' &&
              'type' in tool &&
              tool.type === 'divider' &&
              (!lastTool ||
                (typeof lastTool === 'object' &&
                  'type' in lastTool &&
                  lastTool.type === 'divider') ||
                index === 0 ||
                index === tools.length - 1)
            ) {
              return accumulator;
            }
            accumulator.push(tool);
          }
          return accumulator;
        },
        []
      );
    };
    const tools = filterPointlessDividerTools(toolsProp);
    //#endregion

    const { InputProps, ...SearchFieldPropsRest } = SearchFieldProps;

    //#region Refs
    const isInitialMountRef = useRef(true);
    const anchorElementRef = useRef<HTMLDivElement | null>(null);
    const toolsContainerElementRef = useRef<HTMLDivElement | null>(null);
    const actualToolsWidthsRef = useRef(
      new Map<
        number,
        {
          elementMaxWidth?: number;
          collapsedWidth?: number;
        }
      >()
    );
    const toolsRef = useRef(tools);
    toolsRef.current = tools;

    const allTools = [...preTitleTools, ...tools, ...postSyncButtonTools];
    const allToolsRef = useRef(allTools);
    allToolsRef.current = tools;
    //#endregion

    const { sx: TitlePropsSx, ...TitlePropsRest } = TitleProps;

    const { breakpoints, palette } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

    const [collapsedWidthToolIndex, setCollapsedWidthToolIndex] = useState(
      tools.length
    );
    const [collapsedIntoEllipsisToolIndex, setCollapsedIntoEllipsisToolIndex] =
      useState<number | null>(null);
    const [isSearchFieldCollapsed, setIsSearchFieldCollapsed] = useState(false);
    const [searchFieldOpen, setSearchFieldOpen] = useState(
      Boolean(searchTerm && searchTerm.length > 0)
    );

    const shouldRenderSyncTool = Boolean(hasSyncTool && load);

    const getEllipsisToolsRef = useRef(
      (tools: NonNullable<typeof toolsProp>) => {
        return filterPointlessDividerTools(
          tools.filter((tool) => {
            return !(
              tool &&
              typeof tool === 'object' &&
              'alwaysShowOn' in tool &&
              (
                ['All Screens', 'Small Screen'] as (typeof tool.alwaysShowOn)[]
              ).includes(tool.alwaysShowOn)
            );
          })
        );
      }
    );

    const updateCollapsedWidthToolIndex = useCallback(
      (anchorElement: HTMLDivElement) => {
        if (allTools?.length != null) {
          const toolsWithActualWidths = [...allToolsRef.current];
          const toolMaxWidths = toolsWithActualWidths.map((tool, index) => {
            const actualToolElementWidth =
              actualToolsWidthsRef.current.get(index)?.elementMaxWidth;
            if (tool && typeof tool === 'object') {
              if ('type' in tool) {
                switch (tool.type) {
                  case 'button':
                    return {
                      elementMaxWidth:
                        actualToolElementWidth ?? MAX_BUTTON_WIDTH,
                      collapsedElementWidth: (tool as ButtonTool).endIcon
                        ? 54
                        : 36,
                    };
                  case 'icon-button':
                    return {
                      elementMaxWidth: actualToolElementWidth ?? 32,
                      collapsedElementWidth: 32,
                    };
                  case 'divider':
                    return {
                      elementMaxWidth: actualToolElementWidth ?? 33,
                      collapsedElementWidth: 33,
                    };
                }
              }
              if ('element' in tool) {
                return {
                  elementMaxWidth:
                    actualToolElementWidth ?? tool.elementMaxWidth,
                  collapsedElementWidth: tool.collapsedElementMaxWidth,
                };
              }
            }
            return {
              elementMaxWidth: actualToolElementWidth ?? MAX_ELEMENT_TOOL_WIDTH,
              collapsedElementWidth: 36,
            };
          });

          let containerToolsMaxWidth =
            anchorElement.clientWidth - (isSmallScreenSize ? 16 : 24) * 2;
          if (shouldRenderSyncTool) {
            containerToolsMaxWidth -= 32;
          }
          const searchFieldAndTitleSpaceWidth = (() => {
            let width = 0;
            if (title) {
              width += maxTitleWidth;
            }
            if (hasSearchTool) {
              width += maxSearchFieldWidth;
            }
            return width;
          })();
          let toolsCount = toolsWithActualWidths.length;
          title && (toolsCount += 1);
          hasSearchTool && (toolsCount += 1);
          shouldRenderSyncTool && (toolsCount += 1);
          const cummulativeToolsGapWidth = (toolsCount - 1) * 8;

          for (let i = 0; i < toolsWithActualWidths.length; i++) {
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
              containerToolsMaxWidth -
                (fullWidthToolsWidth +
                  collapsedWidthToolsWidth +
                  cummulativeToolsGapWidth) >=
              searchFieldAndTitleSpaceWidth
            ) {
              setCollapsedWidthToolIndex(i);
              setCollapsedIntoEllipsisToolIndex(null);
              setIsSearchFieldCollapsed(false);
              return;
            }
          }
          setIsSearchFieldCollapsed(false);
          setCollapsedWidthToolIndex(toolsWithActualWidths.length);

          let collapsedSearchFieldAndTitleSpaceWidth =
            searchFieldAndTitleSpaceWidth;
          let isSearchFieldCollapsed = false;
          for (let i = 0; i < toolsWithActualWidths.length; i++) {
            const collapsedWidthToolsWidth = toolMaxWidths
              .filter((_, index) => {
                const tool = toolsWithActualWidths[index];
                return (
                  index < toolMaxWidths.length - i ||
                  (tool &&
                    typeof tool === 'object' &&
                    'alwaysShowOn' in tool &&
                    (
                      [
                        'All Screens',
                        'Small Screen',
                      ] as (typeof tool.alwaysShowOn)[]
                    ).includes(tool.alwaysShowOn))
                );
              })
              .reduce(
                (a, { collapsedElementWidth }) => {
                  return a + 4 + collapsedElementWidth;
                },
                (() => {
                  let baseGapWidth = 0;
                  title && hasSearchTool && (baseGapWidth += 4);
                  const ellipsisTools = getEllipsisToolsRef.current(
                    toolsWithActualWidths.slice(-i)
                  );
                  i > 0 &&
                    ellipsisTools.length > 0 &&
                    (baseGapWidth += 4 + ELLIPSIS_MENU_TOOL_WIDTH);
                  return baseGapWidth;
                })()
              );

            if (
              containerToolsMaxWidth - collapsedWidthToolsWidth >=
              collapsedSearchFieldAndTitleSpaceWidth
            ) {
              setCollapsedIntoEllipsisToolIndex(i);
              return;
            } else if (!isSearchFieldCollapsed) {
              if (title && hasSearchTool) {
                setIsSearchFieldCollapsed(true);
                isSearchFieldCollapsed = true;
                collapsedSearchFieldAndTitleSpaceWidth = maxTitleWidth + 32;
              }
              if (
                containerToolsMaxWidth - collapsedWidthToolsWidth >=
                collapsedSearchFieldAndTitleSpaceWidth
              ) {
                setCollapsedIntoEllipsisToolIndex(i);
                return;
              }
            }
          }
          setCollapsedIntoEllipsisToolIndex(toolsWithActualWidths.length);
        }
      },
      [
        allTools.length,
        hasSearchTool,
        isSmallScreenSize,
        maxSearchFieldWidth,
        maxTitleWidth,
        shouldRenderSyncTool,
        title,
      ]
    );

    useEffect(() => {
      let anchorElementObserver: ResizeObserver;
      let anchorElement: HTMLDivElement;
      let toolsContainerElementObserver: ResizeObserver;
      let toolsContainerElement: HTMLDivElement;
      if (toolsContainerElementRef.current) {
        toolsContainerElement = toolsContainerElementRef.current;
        toolsContainerElementObserver = new ResizeObserver(() => {
          toolsContainerElement
            .querySelectorAll(
              `
            .${classes.fullWidthToolWrapper}
          `
            )
            .forEach((element, index) => {
              const { width: elementMaxWidth } =
                element.getBoundingClientRect();
              actualToolsWidthsRef.current.set(index, {
                elementMaxWidth,
              });
            });
        });
        toolsContainerElementObserver.observe(toolsContainerElement);
      }
      if (anchorElementRef.current) {
        anchorElement = anchorElementRef.current;
        anchorElementObserver = new ResizeObserver(() => {
          updateCollapsedWidthToolIndex(anchorElement);
        });
        anchorElementObserver.observe(anchorElement);
      }
      return () => {
        if (anchorElementObserver && anchorElement) {
          anchorElementObserver.unobserve(anchorElement);
          anchorElementObserver.disconnect();
        }
        if (toolsContainerElementObserver && toolsContainerElement) {
          toolsContainerElementObserver.unobserve(toolsContainerElement);
          toolsContainerElementObserver.disconnect();
        }
      };
    }, [classes.fullWidthToolWrapper, updateCollapsedWidthToolIndex]);

    useEffect(() => {
      isInitialMountRef.current = false;
      return () => {
        isInitialMountRef.current = true;
      };
    }, []);

    const syncButtonElement = (() => {
      if (shouldRenderSyncTool) {
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
          [`.${buttonClasses.containedInherit}`]: {
            bgcolor: alpha(palette.text.primary, 0.04),
          },
        }}
      >
        <Grid
          ref={toolsContainerElementRef}
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
              !collapsedIntoEllipsisToolIndex
            ) {
              const collapsedToolIndex = (() => {
                if (collapsedWidthToolIndex > preTitleTools.length) {
                  return preTitleTools.length;
                }
                return collapsedWidthToolIndex;
              })();
              return getToolNodes(preTitleTools, collapsedToolIndex).map(
                (tool, index) => {
                  const isToolCollapsed =
                    index >= preTitleTools.length - collapsedToolIndex;
                  return (
                    <Grid
                      item
                      key={index}
                      className={clsx(
                        isToolCollapsed
                          ? classes.collapsedToolWrapper
                          : classes.fullWidthToolWrapper
                      )}
                      sx={{ minWidth: 0 }}
                    >
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

            if (isSearchFieldCollapsed && hasSearchTool && searchFieldOpen) {
              return (
                <Grid
                  item
                  className={clsx(classes.fullWidthSearchToolWrapper)}
                  xs={alignTools === 'end' || isSearchFieldCollapsed}
                  sx={{ minWidth: 0 }}
                >
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
                  <Grid
                    item
                    className={clsx(classes.titleWrapper)}
                    xs={alignTools === 'end' || isSmallScreenSize}
                    sx={{
                      minWidth: 0,
                      ...(() => {
                        if (alignTools === 'start' && !isSmallScreenSize) {
                          return {
                            width: maxTitleWidth,
                          };
                        }
                      })(),
                    }}
                  >
                    <LoadingTypography
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
                      className={clsx(
                        searchFieldOpen
                          ? classes.fullWidthSearchToolWrapper
                          : classes.collapsedSearchToolWrapper
                      )}
                      sx={{
                        display: 'flex',
                        flex:
                          searchFieldOpen ||
                          (searchFieldOpenProp &&
                            !isSmallScreenSize &&
                            !isSearchFieldCollapsed)
                            ? 1
                            : 'none',
                        maxWidth: maxSearchFieldWidth,
                        ...(() => {
                          if (
                            alignTools === 'start' &&
                            !isSmallScreenSize &&
                            (!isSearchFieldCollapsed || searchFieldOpen)
                          ) {
                            return {
                              width: maxSearchFieldWidth,
                            };
                          }
                        })(),
                        minWidth: (() => {
                          if (
                            searchFieldOpen ||
                            (searchFieldOpenProp &&
                              !isSmallScreenSize &&
                              !isSearchFieldCollapsed)
                          ) {
                            return maxSearchFieldWidth;
                          }
                          return 0;
                        })(),
                      }}
                    >
                      {searchFieldOpen ||
                      (searchFieldOpenProp &&
                        !isSmallScreenSize &&
                        !isSearchFieldCollapsed) ? (
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
                <Grid
                  item
                  className={clsx(classes.fullWidthSearchToolWrapper)}
                  xs={alignTools === 'end' || isSmallScreenSize}
                  sx={{
                    minWidth: 0,
                    ...(() => {
                      if (alignTools === 'start' && !isSmallScreenSize) {
                        return {
                          maxWidth: maxSearchFieldWidth,
                        };
                      }
                    })(),
                  }}
                >
                  {standardSearchFieldElement}
                </Grid>
              );
            }
            return <Grid item className={clsx(classes.expansionGap)} xs />;
          })()}
          {(() => {
            const displayableTools = (() => {
              if (
                collapsedIntoEllipsisToolIndex &&
                collapsedIntoEllipsisToolIndex > 0
              ) {
                return tools.filter((tool, index) => {
                  return (
                    collapsedIntoEllipsisToolIndex < tools.length - index ||
                    (tool &&
                      typeof tool === 'object' &&
                      'alwaysShowOn' in tool &&
                      (
                        [
                          'All Screens',
                          'Small Screen',
                        ] as (typeof tool.alwaysShowOn)[]
                      ).includes(tool.alwaysShowOn))
                  );
                });
              }
              return tools;
            })();
            const collapsedToolIndex = (() => {
              if (collapsedWidthToolIndex > preTitleTools.length) {
                return collapsedWidthToolIndex - preTitleTools.length;
              }
              return 0;
            })();
            return getToolNodes(displayableTools, collapsedToolIndex).map(
              (tool, index) => {
                const isToolCollapsed =
                  index >= displayableTools.length - collapsedToolIndex;
                return (
                  <Grid
                    item
                    className={clsx(
                      isToolCollapsed
                        ? classes.collapsedToolWrapper
                        : classes.fullWidthToolWrapper
                    )}
                    key={index}
                    sx={{ minWidth: 0 }}
                  >
                    {tool}
                  </Grid>
                );
              }
            );
          })()}
          {(() => {
            const ellipsisTools = (() => {
              if (
                collapsedIntoEllipsisToolIndex &&
                collapsedIntoEllipsisToolIndex > 0
              ) {
                return getEllipsisToolsRef.current(
                  allTools.slice(-collapsedIntoEllipsisToolIndex)
                );
              }
              return [];
            })();
            return (
              <>
                {syncButtonElement ? (
                  <Grid className={clsx(classes.syncToolWrapper)} item>
                    {syncButtonElement}
                  </Grid>
                ) : null}
                {(() => {
                  if (
                    postSyncButtonTools.length > 0 &&
                    !isSmallScreenSize &&
                    !collapsedIntoEllipsisToolIndex
                  ) {
                    const collapsedToolIndex = (() => {
                      const index =
                        collapsedWidthToolIndex -
                        preTitleTools.length -
                        tools.length;
                      return index >= 0 ? index : 0;
                    })();
                    return getToolNodes(
                      postSyncButtonTools,
                      collapsedWidthToolIndex
                    ).map((tool, index) => {
                      const isToolCollapsed =
                        index >=
                        postSyncButtonTools.length - collapsedToolIndex;
                      return (
                        <Grid
                          item
                          className={clsx(
                            isToolCollapsed
                              ? classes.collapsedToolWrapper
                              : classes.fullWidthToolWrapper
                          )}
                          key={index}
                          sx={{ minWidth: 0 }}
                        >
                          {tool}
                        </Grid>
                      );
                    });
                  }
                })()}
                {ellipsisTools.length > 0 ? (
                  <Grid
                    item
                    className={clsx(classes.ellipsisButtonToolWrapper)}
                  >
                    <EllipsisMenuIconButton
                      options={ellipsisTools.map((tool, index) => {
                        if (
                          tool &&
                          typeof tool === 'object' &&
                          'type' in tool
                        ) {
                          if (tool.type === 'divider') {
                            return {
                              label: <Divider />,
                              value: index,
                              selectable: false,
                              isDropdownOption: false,
                            };
                          }
                          const { label, icon, ref, onClick } =
                            tool as ButtonTool;
                          return {
                            ref: ref as any,
                            label,
                            icon,
                            value: index,
                            onClick: onClick as any,
                          };
                        }
                        const { element } = tool as ElementTool;
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
                      sx={{
                        width: ELLIPSIS_MENU_TOOL_WIDTH,
                        height: ELLIPSIS_MENU_TOOL_WIDTH,
                      }}
                    />
                    {ellipsisTools.map((tool, index) => {
                      return (
                        <Fragment key={index}>
                          {(() => {
                            if (
                              tool &&
                              typeof tool === 'object' &&
                              'popupElement' in tool
                            ) {
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
          })()}
        </Grid>
      </Box>
    );
  }
);

export default SearchSyncToolbar;
