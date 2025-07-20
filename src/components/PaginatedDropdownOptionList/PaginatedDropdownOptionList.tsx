import '@infinite-debugger/rmk-js-extensions/RegExp';
import AddIcon from '@mui/icons-material/Add';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  ButtonProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  inputBaseClasses,
  useMediaQuery,
  useThemeProps,
} from '@mui/material';
import Card, { CardProps } from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  PaginatedRecordsFinderOptions,
  usePaginatedRecords,
} from '../../hooks/DataFetching';
import {
  DropdownOption as BaseDropdownOption,
  PaginatedResponseData,
} from '../../models/Utils';
import InfiniteScrollBox, {
  InfiniteScrollBoxProps,
} from '../InfiniteScrollBox';
import SearchField, { SearchFieldProps } from '../SearchField';
import Tooltip from '../Tooltip';
import DropdownOption, { DropdownOptionVariant } from './DropdownOption';

export interface PaginatedDropdownOptionListClasses {
  /** Styles applied to the root element. */
  root: string;
  searchMatchLabel: string;
  searchMatchLabelMatchedString: string;
}

export type PaginatedDropdownOptionListClassKey =
  keyof PaginatedDropdownOptionListClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPaginatedDropdownOptionList: PaginatedDropdownOptionListProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPaginatedDropdownOptionList: keyof PaginatedDropdownOptionListClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPaginatedDropdownOptionList?: {
      defaultProps?: ComponentsProps['MuiPaginatedDropdownOptionList'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPaginatedDropdownOptionList'];
      variants?: ComponentsVariants['MuiPaginatedDropdownOptionList'];
    };
  }
}
//#endregion

export const getPaginatedDropdownOptionListUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPaginatedDropdownOptionList', slot);
};

const slots: Record<
  PaginatedDropdownOptionListClassKey,
  [PaginatedDropdownOptionListClassKey]
> = {
  root: ['root'],
  searchMatchLabel: ['searchMatchLabel'],
  searchMatchLabelMatchedString: ['searchMatchLabelMatchedString'],
};

export const paginatedDropdownOptionListClasses: PaginatedDropdownOptionListClasses =
  generateUtilityClasses(
    'MuiPaginatedDropdownOptionList',
    Object.keys(slots) as PaginatedDropdownOptionListClassKey[]
  );

export interface DropdownOption<Entity = any>
  extends Pick<ButtonProps, 'onClick'>,
    BaseDropdownOption<Entity> {}

const DEFAULT_DROPDOWN_MENU_MAX_HEIGHT = 200;

export interface PaginatedDropdownOptionListProps<Entity = any>
  extends Partial<
      Pick<CardProps, 'sx' | 'className' | 'variant' | 'elevation'>
    >,
    Pick<InfiniteScrollBoxProps, 'keyboardFocusElement'> {
  options?: DropdownOption<Entity>[];
  defaultOptions?: DropdownOption<Entity>[];
  selectedOptions?: DropdownOption<Entity>[];
  sortOptions?: boolean;
  minWidth?: number;
  maxHeight?: number;
  optionHeight?: number;
  paging?: boolean;
  multiple?: boolean;
  loading?: boolean;
  onClose?: () => void;
  onSelectOption?: (selectedOption: DropdownOption<Entity>) => void;
  onChangeSelectedOptions?: (selectedOptions: DropdownOption<Entity>[]) => void;
  optionVariant?: DropdownOptionVariant;
  searchable?: boolean;
  searchTerm?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  SearchFieldProps?: Partial<SearchFieldProps>;
  showNoOptionsFoundMessage?: boolean;

  // Async options
  getDropdownOptions?: (
    options: PaginatedRecordsFinderOptions
  ) => Promise<
    PaginatedResponseData<DropdownOption<Entity>> | DropdownOption<Entity>[]
  >;
  onLoadOptions?: (options: DropdownOption<Entity>[]) => void;
  externallyPaginated?: boolean;
  limit?: number;
  asyncOptionPagesMap?: Map<number, DropdownOption<Entity>[]>;
  onChangeAsyncOptionPagesMap?: (
    asyncOptionPagesMap: Map<number, DropdownOption<Entity>[]>
  ) => void;
  revalidationKey?: string;
  noOptionsText?: ReactNode;
  enableAddNewOption?: boolean;
  onAddNewOption?: (newOption: { label: string }) => void;
  newOptionLabel?: string;
  footerContent?: ReactNode;
  filterOptionBySearchTerm?: (
    option: DropdownOption<Entity>,
    searchTerm: string
  ) => boolean;
  showSelectAllOption?: boolean;
}

const BasePaginatedDropdownOptionList = <Entity,>(
  inProps: PaginatedDropdownOptionListProps<Entity>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPaginatedDropdownOptionList',
  });
  const {
    className,
    selectedOptions: selectedOptionsProp,
    maxHeight = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
    optionHeight: optionHeightProp,
    paging = true,
    options: optionsProp,
    defaultOptions,
    onLoadOptions,
    multiple,
    onClose,
    loading: loadingProp,
    getDropdownOptions,
    onSelectOption,
    onChangeSelectedOptions,
    optionVariant,
    searchable = false,
    searchTerm: searchTermProp = '',
    onChangeSearchTerm,
    SearchFieldProps = {},
    externallyPaginated = false,
    asyncOptionPagesMap,
    onChangeAsyncOptionPagesMap,
    sortOptions = false,
    keyboardFocusElement,
    showNoOptionsFoundMessage = true,
    revalidationKey,
    noOptionsText = 'No options found',
    enableAddNewOption,
    onAddNewOption,
    newOptionLabel,
    footerContent,
    filterOptionBySearchTerm,
    showSelectAllOption = true,
    sx,
    ...rest
  } = omit(props, 'limit', 'minWidth');

  let { limit: limitProp = 100, minWidth = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT } =
    props;

  const classes = composeClasses(
    slots,
    getPaginatedDropdownOptionListUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: SearchFieldPropsSx, ...SearchFieldPropsRest } = SearchFieldProps;

  //#region Refs
  const isInitialMountRef = useRef(true);
  const optionsRef = useRef(optionsProp);
  optionsRef.current = optionsProp;
  const onSelectOptionRef = useRef(onSelectOption);
  onSelectOptionRef.current = onSelectOption;
  const onLoadOptionsRef = useRef(onLoadOptions);
  onLoadOptionsRef.current = onLoadOptions;
  const onChangeSearchTermRef = useRef(onChangeSearchTerm);
  onChangeSearchTermRef.current = onChangeSearchTerm;
  const getDropdownOptionsRef = useRef(getDropdownOptions);
  getDropdownOptionsRef.current = getDropdownOptions;
  const onChangeAsyncOptionPagesMapRef = useRef(onChangeAsyncOptionPagesMap);
  onChangeAsyncOptionPagesMapRef.current = onChangeAsyncOptionPagesMap;

  const sortOptionsRef = useRef(
    (
      { label: aLabel, searchableLabel: aSearchableLabel }: DropdownOption,
      { label: bLabel, searchableLabel: bSearchableLabel }: DropdownOption
    ) => {
      if (typeof aLabel === 'string' && typeof bLabel === 'string') {
        return aLabel.localeCompare(bLabel);
      }
      if (
        typeof aSearchableLabel === 'string' &&
        typeof bSearchableLabel === 'string'
      ) {
        return aSearchableLabel.localeCompare(bSearchableLabel);
      }
      return 0;
    }
  );
  //#endregion

  const { palette, breakpoints, typography } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const optionHeight = (() => {
    if (optionHeightProp) {
      return optionHeightProp;
    }
    if (isSmallScreenSize) {
      return 50;
    }
    return 36;
  })();

  const limit = useMemo(() => {
    return Math.ceil(maxHeight / optionHeight) + 1;
  }, [maxHeight, optionHeight]);

  if (limitProp < limit) {
    limitProp = limit;
  }

  const [scrollableDropdownWrapper, setScrollableDropdownWrapper] =
    useState<HTMLDivElement | null>(null);

  const [searchTerm, setSearchTerm] = useState(searchTermProp);
  const [scrolledToSelectedOption, setScrolledToSelectedOption] =
    useState(false);

  const {
    load: loadAsyncOptions,
    loading,
    allPageRecords: asyncOptions,
    loaded: isAsyncOptionsLoaded,
    loadNextPage: loadNextAsyncOptions,
    errorMessage,
    loadedPages,
  } = usePaginatedRecords(
    async ({
      limit,
      offset,
      getRequestController,
      getStaleWhileRevalidate,
    }) => {
      if (getDropdownOptions) {
        return getDropdownOptions({
          searchTerm,
          limit,
          offset,
          getRequestController,
          getStaleWhileRevalidate,
        });
      }
      return { records: [], recordsTotalCount: 0 };
    },
    {
      loadOnMount: false,
      limit: limitProp,
      loadedPagesMap: asyncOptionPagesMap,
      ...(() => {
        if (externallyPaginated) {
          return {
            searchTerm,
          };
        }
      })(),
      canLoadNextPage: externallyPaginated,
      revalidationKey,
    }
  );
  const loadAsyncOptionsRef = useRef(loadAsyncOptions);
  loadAsyncOptionsRef.current = loadAsyncOptions;

  useEffect(() => {
    onChangeAsyncOptionPagesMapRef.current &&
      onChangeAsyncOptionPagesMapRef.current(loadedPages);
  }, [loadedPages]);

  useEffect(() => {
    if (!isInitialMountRef.current && onChangeSearchTermRef.current) {
      onChangeSearchTermRef.current(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (
      isInitialMountRef.current &&
      getDropdownOptionsRef.current &&
      !isAsyncOptionsLoaded &&
      (!optionsRef.current || optionsRef.current.length <= 0)
    ) {
      revalidationKey;
      loadAsyncOptionsRef.current();
    }
  }, [isAsyncOptionsLoaded, revalidationKey, searchTerm]);

  useEffect(() => {
    if (
      !isInitialMountRef.current &&
      getDropdownOptionsRef.current &&
      onLoadOptionsRef.current &&
      isAsyncOptionsLoaded
    ) {
      onLoadOptionsRef.current(asyncOptions);
    }
  }, [asyncOptions, isAsyncOptionsLoaded]);

  const options = [
    ...(defaultOptions || []),
    ...((): typeof asyncOptions => {
      if (getDropdownOptionsRef.current && asyncOptions.length > 0) {
        return asyncOptions;
      }
      if (optionsProp && optionsProp.length > 0) {
        return optionsProp;
      }
      return [];
    })().sort(
      sortOptions && !externallyPaginated ? sortOptionsRef.current : () => 0
    ),
  ];

  const minOptionWidth = (() => {
    return options.reduce((accumulator, { label, searchableLabel }) => {
      const labelWidth =
        Math.ceil(
          (String(searchableLabel || label).length * typography.htmlFontSize) /
            2
        ) + 50;
      if (labelWidth > accumulator) {
        return labelWidth;
      }
      return accumulator;
    }, 0);
  })();

  minOptionWidth > minWidth && (minWidth = minOptionWidth);

  const filteredOptions = (() => {
    if (searchTerm && !externallyPaginated) {
      if (filterOptionBySearchTerm) {
        return options.filter((option) => {
          return filterOptionBySearchTerm(option, searchTerm);
        });
      }
      const normalizedSearchTermCharacters = searchTerm
        .trim()
        .toLowerCase()
        .split('');
      const regexString = normalizedSearchTermCharacters
        .map((character) => RegExp.escape(character))
        .join('.*?');
      return options
        .map((option) => {
          const { searchableLabel: baseSearchableLabel, label } = option;
          const searchableLabel = baseSearchableLabel || String(label);
          const match = new RegExp(regexString, 'gi').exec(
            searchableLabel.toLowerCase()
          );
          return [
            match,
            {
              ...option,
              ...(() => {
                if (match?.length && typeof label === 'string') {
                  const matchedCharacters = [...normalizedSearchTermCharacters];
                  const searchMatchLabel = label
                    .split('')
                    .map((char) => {
                      if (char.toLowerCase() === matchedCharacters[0]) {
                        matchedCharacters.shift();
                        return `<strong class="${classes.searchMatchLabelMatchedString}">${char}</strong>`;
                      }
                      return char;
                    })
                    .join('');
                  return {
                    searchMatchLabel: (
                      <Box
                        className={classes.searchMatchLabel}
                        component="span"
                        dangerouslySetInnerHTML={{
                          __html: searchMatchLabel,
                        }}
                        sx={{
                          [`strong.${classes.searchMatchLabelMatchedString}`]: {
                            color: palette.primary.main,
                          },
                        }}
                      />
                    ),
                  };
                }
              })(),
            },
          ] as [typeof match, typeof option];
        })
        .filter(([match]) => {
          return match;
        })
        .sort(([aMatch], [bMatch]) => {
          return (
            aMatch!.index - bMatch!.index ||
            aMatch![0].length - bMatch![0].length
          );
        })
        .map(([, option]) => {
          return option;
        });
    }
    return options;
  })();

  const [localSelectedOptions, setLocalSelectedOptions] = useState<
    DropdownOption[]
  >([]);

  const selectedOptions = (() => {
    if (selectedOptionsProp && onChangeSelectedOptions) {
      return selectedOptionsProp;
    }
    return localSelectedOptions;
  })();

  const [focusedOptionIndex, setFocusedOptionIndex] = useState(() => {
    if (selectedOptions.length > 0) {
      return filteredOptions.indexOf(selectedOptions[0]);
    }
  });

  useEffect(() => {
    setSearchTerm(searchTermProp);
  }, [searchTermProp]);

  const triggerChangeEvent = (option: DropdownOption) => {
    const { value } = option;
    const nextOptions = (() => {
      if (multiple) {
        //#region Toggle option existence
        const localOptions = [...selectedOptions];
        const selectedOption = localOptions.find(
          ({ value: selectedOptionValue }) => {
            return selectedOptionValue === value;
          }
        );
        if (selectedOption) {
          localOptions.splice(localOptions.indexOf(selectedOption), 1);
        } else {
          localOptions.push(option);
        }
        return localOptions.sort((a, b) => {
          const aOption = options.find(({ value }) => value === a.value);
          const bOption = options.find(({ value }) => value === b.value);

          if (aOption && bOption) {
            return options.indexOf(aOption) - options.indexOf(bOption);
          }
          return 0;
        });
        //#endregion
      }
      return [option];
    })();
    if (!onChangeSelectedOptions || !selectedOptionsProp) {
      setLocalSelectedOptions(nextOptions);
    }
    onChangeSelectedOptions && onChangeSelectedOptions(nextOptions);
    !multiple && onClose && onClose();
  };

  useEffect(() => {
    if (
      scrollableDropdownWrapper &&
      selectedOptionsProp &&
      !scrolledToSelectedOption
    ) {
      const selectedOptionIndices = selectedOptionsProp
        .map(({ value: selectedOptionValue }) => {
          return filteredOptions.findIndex(({ value }) => {
            return value === selectedOptionValue;
          });
        })
        .filter((index) => index >= 0)
        .sort();
      if (selectedOptionIndices.length > 0) {
        scrollableDropdownWrapper.scrollTop =
          selectedOptionIndices[0] * optionHeight;
      }
      setScrolledToSelectedOption(true);
    }
  }, [
    optionHeight,
    filteredOptions,
    scrollableDropdownWrapper,
    scrolledToSelectedOption,
    selectedOptionsProp,
  ]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const hasAllOptionsSelected = filteredOptions.every(({ value }) => {
    return selectedOptions.find(
      ({ value: selectedOptionValue }) => value === selectedOptionValue
    );
  });

  return (
    <Card
      {...rest}
      ref={ref}
      className={clsx(classes.root)}
      sx={{
        minWidth,
        ...sx,
      }}
    >
      {(() => {
        if (searchable) {
          return (
            <>
              <SearchField
                variant="standard"
                {...SearchFieldPropsRest}
                {...{ searchTerm }}
                onChangeSearchTerm={(searchTerm) => {
                  setSearchTerm(searchTerm);
                }}
                slotProps={{
                  ...SearchFieldPropsRest?.slotProps,
                  input: {
                    disableUnderline: true,
                    autoFocus: true,
                    ...SearchFieldPropsRest?.slotProps?.input,
                  },
                }}
                fullWidth
                sx={{
                  [`.${inputBaseClasses.root}`]: {
                    px: 2,
                    bgcolor: alpha(palette.divider, 0.1),
                    height: optionHeight,
                  },
                  ...SearchFieldPropsSx,
                }}
              />
              <Divider />
            </>
          );
        }
      })()}
      <InfiniteScrollBox
        ref={(scrollableDropdownWrapper: HTMLDivElement) => {
          setScrollableDropdownWrapper(scrollableDropdownWrapper);
        }}
        load={() => {
          loadNextAsyncOptions();
        }}
        dataElements={(() => {
          const dataElements: ReactNode[] = [];
          if (enableAddNewOption && newOptionLabel) {
            dataElements.push(
              <DropdownOption
                onClick={() => {
                  onAddNewOption?.({
                    label: newOptionLabel,
                  });
                }}
                height={optionHeight}
                icon={<AddIcon />}
              >
                Add {newOptionLabel}
              </DropdownOption>
            );
          }
          if (filteredOptions.length > 0) {
            dataElements.push(
              ...filteredOptions.map((option) => {
                const {
                  value,
                  searchMatchLabel,
                  label,
                  icon,
                  description,
                  selectable = true,
                  isDropdownOption = true,
                  isDropdownOptionWrapped = true,
                  onClick,
                  component,
                  ref,
                  sx,
                } = option;
                if (isDropdownOption && isDropdownOptionWrapped) {
                  const isFocused =
                    filteredOptions.indexOf(option) === focusedOptionIndex;
                  const dropdownOptionElement = (
                    <DropdownOption
                      className={clsx({
                        ['Mui-focusVisible']: isFocused && selectable,
                      })}
                      value={value}
                      key={value}
                      onClick={(event) => {
                        if (selectable) {
                          triggerChangeEvent(option);
                          onClick?.(event);
                          onSelectOption?.(option);
                        }
                      }}
                      selected={(() => {
                        const selectedOptionValues = selectedOptions.map(
                          ({ value }) => value
                        );
                        return selectedOptionValues.includes(value);
                      })()}
                      tabIndex={isFocused ? 0 : -1}
                      height={optionHeight}
                      variant={optionVariant}
                      ref={ref as any}
                      {...{ selectable, component, icon, sx }}
                    >
                      {searchMatchLabel ?? label}
                    </DropdownOption>
                  );
                  if (description) {
                    return (
                      <Tooltip
                        title={description}
                        key={value}
                        placement="left"
                        disableInteractive
                        enterAtCursorPosition={false}
                      >
                        {dropdownOptionElement}
                      </Tooltip>
                    );
                  }
                  return dropdownOptionElement;
                }
                return <Fragment key={value}>{label}</Fragment>;
              })
            );
          } else if (
            showNoOptionsFoundMessage &&
            !loading &&
            !loadingProp &&
            (!getDropdownOptions || isAsyncOptionsLoaded)
          ) {
            dataElements.push(
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: optionHeight,
                  px: 2,
                }}
              >
                <Typography variant="body2" color={palette.error.main}>
                  {noOptionsText}
                </Typography>
              </Box>
            );
          }
          return dataElements;
        })()}
        dataElementLength={(() => {
          if (paging) {
            return optionHeight;
          }
        })()}
        focusedElementIndex={focusedOptionIndex}
        onChangeFocusedDataElement={(index) => {
          setFocusedOptionIndex(index);
        }}
        onSelectDataElement={(focusedOptionIndex) => {
          const selectedOption = filteredOptions[focusedOptionIndex];
          if (selectedOption?.selectable) {
            onSelectOptionRef.current?.(selectedOption);
            triggerChangeEvent(selectedOption);
          }
        }}
        bottomThreshold={optionHeight * 5}
        enableKeyboardNavigationWrapping={!externallyPaginated}
        {...{ onClose, paging, keyboardFocusElement }}
        sx={{
          maxHeight,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      />
      {showSelectAllOption && multiple && filteredOptions.length > 1 ? (
        <>
          <Divider />
          <DropdownOption
            onClick={(event) => {
              event.stopPropagation();
              const selectableOptions = (() => {
                const selectedLockedOptions = selectedOptions
                  .map(({ value: selectedOptionValue }) => {
                    return options.find(
                      ({ value }) => value === selectedOptionValue
                    )!;
                  })
                  .filter((option) => {
                    return option?.selectable === false;
                  });
                const selectedOptionsNotInFilter = selectedOptions
                  .map(({ value: selectedOptionValue }) => {
                    return options.find(
                      ({ value }) => value === selectedOptionValue
                    )!;
                  })
                  .filter((option) => {
                    return !filteredOptions.includes(option);
                  });
                if (hasAllOptionsSelected) {
                  return options.filter((option) => {
                    return (
                      selectedLockedOptions.includes(option) ||
                      selectedOptionsNotInFilter.includes(option)
                    );
                  });
                }
                return filteredOptions.filter((option) => {
                  const { selectable = true } = option;
                  return selectable || selectedLockedOptions.includes(option);
                });
              })();
              if (!onChangeSelectedOptions || !selectedOptionsProp) {
                setLocalSelectedOptions(selectableOptions);
              }
              onChangeSelectedOptions &&
                onChangeSelectedOptions(selectableOptions);
              !multiple && onClose && onClose();
            }}
            height={optionHeight}
          >
            {hasAllOptionsSelected ? 'Deselect' : 'Select'} All
          </DropdownOption>
        </>
      ) : null}
      {getDropdownOptions || loadingProp ? (
        <>
          {filteredOptions.length > 0 || isAsyncOptionsLoaded ? (
            <Divider />
          ) : null}
          <DropdownOption
            onClick={(event) => {
              event.stopPropagation();
              loadAsyncOptions();
            }}
            height={optionHeight}
          >
            <Grid container sx={{ alignItems: 'center', gap: 1 }}>
              <Grid
                item
                sx={{
                  display: 'flex',
                }}
              >
                {(() => {
                  if (loading || loadingProp) {
                    return <CircularProgress size={24} color="inherit" />;
                  }
                  const refreshButton = <RefreshIcon color="inherit" />;
                  if (errorMessage) {
                    return (
                      <Grid
                        container
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexWrap: 'nowrap',
                        }}
                      >
                        <Grid
                          item
                          sx={{
                            display: 'flex',
                          }}
                        >
                          <Tooltip title={errorMessage}>
                            <ErrorIcon color="error" />
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          sx={{
                            display: 'flex',
                          }}
                        >
                          {refreshButton}
                        </Grid>
                      </Grid>
                    );
                  }
                  return refreshButton;
                })()}
              </Grid>
              {!loading && !loadingProp ? (
                <Grid item xs sx={{ minWidth: 0 }}>
                  Refresh
                </Grid>
              ) : null}
            </Grid>
          </DropdownOption>
        </>
      ) : null}
      {footerContent}
    </Card>
  );
};

export const PaginatedDropdownOptionList = forwardRef(
  BasePaginatedDropdownOptionList
) as <Entity>(
  p: PaginatedDropdownOptionListProps<Entity> & {
    ref?: Ref<HTMLDivElement>;
  }
) => ReactElement;

export default PaginatedDropdownOptionList;
