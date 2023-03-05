import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  Tooltip,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  iconButtonClasses,
  inputBaseClasses,
  useMediaQuery,
  useThemeProps,
} from '@mui/material';
import Card, { CardProps } from '@mui/material/Card';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  PaginatedRecordsFinderOptions,
  usePaginatedRecords,
} from '../../hooks/Utils';
import {
  DropdownOption as BaseDropdownOption,
  PaginatedResponseData,
} from '../../interfaces/Utils';
import InfiniteScrollBox, {
  InfiniteScrollBoxProps,
} from '../InfiniteScrollBox';
import ReloadIconButton from '../ReloadIconButton';
import SearchField, { SearchFieldProps } from '../SearchField';
import DropdownOption, { DropdownOptionVariant } from './DropdownOption';

export interface DropdownOption
  extends Pick<MenuItemProps, 'onClick'>,
    BaseDropdownOption {}

const DEFAULT_DROPDOWN_MENU_MAX_HEIGHT = 200;

export interface PaginatedDropdownOptionListClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PaginatedDropdownOptionListClassKey =
  keyof PaginatedDropdownOptionListClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPaginatedDropdownOptionList: PaginatedDropdownOptionListProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPaginatedDropdownOptionList: keyof PaginatedDropdownOptionListClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPaginatedDropdownOptionList?: {
      defaultProps?: ComponentsProps['MuiPaginatedDropdownOptionList'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPaginatedDropdownOptionList'];
      variants?: ComponentsVariants['MuiPaginatedDropdownOptionList'];
    };
  }
}

export interface PaginatedDropdownOptionListProps
  extends Partial<
      Pick<CardProps, 'sx' | 'className' | 'variant' | 'elevation'>
    >,
    Pick<InfiniteScrollBoxProps, 'keyboardFocusElement'> {
  options?: DropdownOption[];
  selectedOptions?: DropdownOption[];
  sortOptions?: boolean;
  minWidth?: number;
  maxHeight?: number;
  optionHeight?: number;
  paging?: boolean;
  multiple?: boolean;
  loading?: boolean;
  onClose?: () => void;
  onSelectOption?: (selectedOption: DropdownOption) => void;
  onChangeSelectedOptions?: (selectedOptions: DropdownOption[]) => void;
  optionVariant?: DropdownOptionVariant;
  searchable?: boolean;
  searchTerm?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  SearchFieldProps?: Partial<SearchFieldProps>;
  showNoOptionsFoundMessage?: boolean;

  // Async options
  getDropdownOptions?: (
    options: PaginatedRecordsFinderOptions
  ) => Promise<PaginatedResponseData<DropdownOption> | DropdownOption[]>;
  onLoadOptions?: (options: DropdownOption[]) => void;
  callGetDropdownOptions?: 'always' | 'whenNoOptions';
  externallyPaginated?: boolean;
  dataKey?: string;
  limit?: number;
  asyncOptionPagesMap?: Map<number, DropdownOption[]>;
  onChangeAsyncOptionPagesMap?: (
    asyncOptionPagesMap: Map<number, DropdownOption[]>
  ) => void;
}

export function getPaginatedDropdownOptionListUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiPaginatedDropdownOptionList', slot);
}

export const paginatedDropdownOptionListClasses: PaginatedDropdownOptionListClasses =
  generateUtilityClasses('MuiPaginatedDropdownOptionList', ['root']);

const slots = {
  root: ['root'],
};

export const PaginatedDropdownOptionList = forwardRef<
  HTMLDivElement,
  PaginatedDropdownOptionListProps
>(function PaginatedDropdownOptionList(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPaginatedDropdownOptionList',
  });
  const {
    className,
    selectedOptions: selectedOptionsProp,
    minWidth = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
    maxHeight = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
    optionHeight: optionHeightProp,
    paging = true,
    options: optionsProp,
    onLoadOptions,
    multiple,
    onClose,
    loading: loadingProp,
    getDropdownOptions,
    onSelectOption,
    onChangeSelectedOptions: onChangeSelectedOptions,
    optionVariant,
    searchable = false,
    searchTerm: searchTermProp = '',
    onChangeSearchTerm,
    SearchFieldProps = {},
    externallyPaginated,
    dataKey,
    asyncOptionPagesMap,
    onChangeAsyncOptionPagesMap,
    sortOptions = false,
    callGetDropdownOptions = 'whenNoOptions',
    keyboardFocusElement,
    showNoOptionsFoundMessage = true,
    ...rest
  } = omit(props, 'limit');

  let { limit: limitProp = 100 } = props;

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

  // Refs
  const isInitialMountRef = useRef(true);
  const optionsRef = useRef(optionsProp);
  const onCloseRef = useRef(onClose);
  const onSelectOptionRef = useRef(onSelectOption);
  const onChangeSelectedOptionRef = useRef(onChangeSelectedOptions);
  const onLoadOptionsRef = useRef(onLoadOptions);
  const onChangeSearchTermRef = useRef(onChangeSearchTerm);
  const getDropdownOptionsRef = useRef(getDropdownOptions);
  const onChangeAsyncOptionPagesMapRef = useRef(onChangeAsyncOptionPagesMap);
  useEffect(() => {
    optionsRef.current = optionsProp;
    onCloseRef.current = onClose;
    onSelectOptionRef.current = onSelectOption;
    onChangeSelectedOptionRef.current = onChangeSelectedOptions;
    onLoadOptionsRef.current = onLoadOptions;
    onChangeSearchTermRef.current = onChangeSearchTerm;
    getDropdownOptionsRef.current = getDropdownOptions;
    onChangeAsyncOptionPagesMapRef.current = onChangeAsyncOptionPagesMap;
  }, [getDropdownOptions, onChangeAsyncOptionPagesMap, onChangeSearchTerm, onChangeSelectedOptions, onClose, onLoadOptions, onSelectOption, optionsProp]);

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

  const { palette, breakpoints } = useTheme();
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
    async ({ limit, offset, getRequestController }) => {
      if (getDropdownOptions) {
        const optionsResponse = await getDropdownOptions({
          searchTerm,
          limit,
          offset,
          getRequestController,
        });
        if (Array.isArray(optionsResponse)) {
          return {
            records: optionsResponse,
            recordsTotalCount: optionsResponse.length,
          };
        }
        return optionsResponse;
      }
      return { records: [], recordsTotalCount: 0 };
    },
    {
      loadOnMount: false,
      key: dataKey,
      limit: limitProp,
      loadedPagesMap: asyncOptionPagesMap,
      searchTerm,
    }
  );

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
      ((getDropdownOptionsRef.current &&
        !isAsyncOptionsLoaded &&
        (!optionsRef.current || optionsRef.current.length <= 0)) ||
        callGetDropdownOptions === 'always')
    ) {
      loadAsyncOptions();
    }
  }, [loadAsyncOptions, isAsyncOptionsLoaded, searchTerm, callGetDropdownOptions]);

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

  const options = ((): typeof asyncOptions => {
    if (getDropdownOptionsRef.current && asyncOptions.length > 0) {
      return asyncOptions;
    }
    if (optionsProp && optionsProp.length > 0) {
      return optionsProp;
    }
    return [];
  })().sort(
    sortOptions && !externallyPaginated ? sortOptionsRef.current : () => 0
  );

  const filteredOptions = (() => {
    if (searchTerm && !externallyPaginated) {
      return options.filter(
        ({ searchableLabel: baseSearchableLabel, label }) => {
          const searchableLabel = baseSearchableLabel || String(label);
          return (
            searchableLabel &&
            searchableLabel.toLowerCase().match(searchTerm.toLowerCase())
          );
        }
      );
    }
    return options;
  })();

  // Options state
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
    selectedOptionsProp || []
  ); // Selected options state
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(() => {
    if (selectedOptions.length > 0) {
      return filteredOptions.indexOf(selectedOptions[0]);
    }
  });

  useEffect(() => {
    setSearchTerm(searchTermProp);
  }, [searchTermProp]);

  const triggerChangeEvent = useCallback(
    (option: DropdownOption) => {
      const { value } = option;
      const nextOptions = (() => {
        if (multiple) {
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
        }
        return [option];
      })();
      setSelectedOptions(nextOptions);
    },
    [multiple, options, selectedOptions]
  );

  useEffect(() => {
    if (selectedOptionsProp) {
      setSelectedOptions(selectedOptionsProp);
    }
  }, [selectedOptionsProp]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      onChangeSelectedOptionRef.current &&
        onChangeSelectedOptionRef.current(selectedOptions);
      !multiple && onCloseRef.current && onCloseRef.current();
    }
  }, [multiple, selectedOptions]);

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
  }, [optionHeight, filteredOptions, scrollableDropdownWrapper, scrolledToSelectedOption, selectedOptionsProp]);

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
    <Card {...rest} ref={ref} className={clsx(classes.root)}>
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
                InputProps={{
                  disableUnderline: true,
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
        dataElements={filteredOptions.map((option) => {
          const {
            value,
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
                    event.preventDefault();
                    triggerChangeEvent(option);
                    onClick && onClick(event);
                    onSelectOption && onSelectOption(option);
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
                {label}
              </DropdownOption>
            );
            if (description) {
              return (
                <Tooltip
                  title={description}
                  key={value}
                  placement="left"
                  sx={{
                    pointerEvents: 'none',
                  }}
                >
                  {dropdownOptionElement}
                </Tooltip>
              );
            }
            return dropdownOptionElement;
          }
          return <Fragment key={value}>{label}</Fragment>;
        })}
        dataElementLength={optionHeight}
        focusedElementIndex={focusedOptionIndex}
        onChangeFocusedDataElement={(index) => {
          setFocusedOptionIndex(index);
        }}
        onSelectDataElement={(focusedOptionIndex) => {
          const selectedOption = filteredOptions[focusedOptionIndex];
          if (selectedOption?.selectable) {
            onSelectOptionRef.current &&
              onSelectOptionRef.current(selectedOption);
            triggerChangeEvent(selectedOption);
          }
        }}
        bottomThreshold={optionHeight * 5}
        enableKeyboardNavigationWrapping={!externallyPaginated}
        {...{ onClose, paging, keyboardFocusElement }}
        sx={{
          minWidth,
          maxHeight,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        {(() => {
          if (
            showNoOptionsFoundMessage &&
            !loading &&
            !loadingProp &&
            (!getDropdownOptions || isAsyncOptionsLoaded)
          ) {
            return (
              <MenuItem disabled>
                <Typography variant="body2" color={palette.error.main}>
                  No options found
                </Typography>
              </MenuItem>
            );
          }
        })()}
      </InfiniteScrollBox>
      {multiple && filteredOptions.length > 1 ? (
        <>
          <Divider />
          <DropdownOption
            onClick={(event) => {
              event.preventDefault();
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
              setSelectedOptions(selectableOptions);
            }}
            height={optionHeight}
          >
            {hasAllOptionsSelected ? 'Deselect' : 'Select'} All
          </DropdownOption>
        </>
      ) : null}
      {getDropdownOptions && (
        <>
          {filteredOptions.length > 0 || isAsyncOptionsLoaded ? (
            <Divider />
          ) : null}
          <DropdownOption
            onClick={(event) => {
              event.preventDefault();
              loadAsyncOptions();
            }}
            height={optionHeight}
          >
            <Grid container sx={{ alignItems: 'center', gap: 1 }}>
              <Grid item>
                <ReloadIconButton
                  {...{ loading: loading || loadingProp, errorMessage }}
                  sx={{
                    pointerEvents: 'none',
                    [`& .${iconButtonClasses.root}`]: {
                      p: 0,
                    },
                  }}
                />
              </Grid>
              {!loading && !loadingProp ? (
                <Grid item xs sx={{ minWidth: 0 }}>
                  Refresh
                </Grid>
              ) : null}
            </Grid>
          </DropdownOption>
        </>
      )}
    </Card>
  );
});

export default PaginatedDropdownOptionList;
