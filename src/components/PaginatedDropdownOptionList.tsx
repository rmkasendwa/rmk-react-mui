import SearchIcon from '@mui/icons-material/Search';
import {
  Divider,
  Grid,
  Tooltip,
  iconButtonClasses,
  outlinedInputClasses,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card, { CardProps } from '@mui/material/Card';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import {
  Dispatch,
  Fragment,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DropdownOption as BaseDropdownOption } from '../interfaces/Utils';
import DropdownOption, {
  DEFAULT_DROPDOWN_OPTION_HEIGHT,
  DropdownOptionVariant,
} from './DropdownOption';
import TextField, { TextFieldProps } from './InputFields/TextField';
import ReloadIconButton from './ReloadIconButton';

export interface DropdownOption
  extends Pick<MenuItemProps, 'onClick'>,
    BaseDropdownOption {}

export interface PaginatedDropdownOptionListProps {
  options: DropdownOption[];
  selectedOptions?: DropdownOption[];
  setSelectedOptions?: Dispatch<SetStateAction<DropdownOption[]>>;
  minWidth?: number;
  maxHeight?: number;
  optionHeight?: number;
  paging?: boolean;
  multiple?: boolean;
  loading?: boolean;
  onClose?: () => void;
  loadOptions?: () => void;
  onSelectOption?: (selectedOption: DropdownOption) => void;
  onChangeSelectedOption?: (selectedOptions: DropdownOption[]) => void;
  CardProps?: CardProps;
  optionVariant?: DropdownOptionVariant;
  searchable?: boolean;
  SearchFieldProps?: Partial<TextFieldProps>;
}

const DEFAULT_DROPDOWN_MENU_MAX_HEIGHT = 200;

export const PaginatedDropdownOptionList = forwardRef<
  HTMLDivElement,
  PaginatedDropdownOptionListProps
>(function PaginatedDropdownOptionList(
  {
    selectedOptions: selectedOptionsProp,
    setSelectedOptions: setSelectedOptionsProp,
    minWidth = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
    maxHeight = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
    optionHeight = DEFAULT_DROPDOWN_OPTION_HEIGHT,
    paging = true,
    options,
    multiple,
    onClose,
    loading,
    loadOptions,
    onSelectOption,
    onChangeSelectedOption,
    CardProps,
    optionVariant,
    searchable = false,
    SearchFieldProps = {},
  },
  ref
) {
  const { sx: SearchFieldPropsSx, ...SearchFieldPropsRest } = SearchFieldProps;

  // Refs
  const optionsRef = useRef(options);
  const onCloseRef = useRef(onClose);
  const loadOptionsRef = useRef(loadOptions);
  const onSelectOptionRef = useRef(onSelectOption);
  const onChangeSelectedOptionRef = useRef(onChangeSelectedOption);
  useEffect(() => {
    optionsRef.current = options;
    onCloseRef.current = onClose;
    loadOptionsRef.current = loadOptions;
    onSelectOptionRef.current = onSelectOption;
    onChangeSelectedOptionRef.current = onChangeSelectedOption;
  }, [loadOptions, onChangeSelectedOption, onClose, onSelectOption, options]);

  const { palette, typography } = useTheme();
  const [scrollableDropdownWrapper, setScrollableDropdownWrapper] =
    useState<HTMLDivElement | null>(null);

  const [limit, setLimit] = useState(0);
  const [offset, setOffset] = useState(0);

  // Options state
  const [filteredOptions, setFilteredOptions] =
    useState<DropdownOption[]>(options); // Filtered options state
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
    selectedOptionsProp || []
  ); // Selected options state
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState(''); // Search state
  const [scrolledToSelectedOption, setScrolledToSelectedOption] =
    useState(false);

  // Filtering options
  useEffect(() => {
    setFilteredOptions(
      options.filter(({ searchableLabel: baseSearchableLabel, label }) => {
        const searchableLabel = baseSearchableLabel || String(label);
        return (
          !searchTerm ||
          (searchableLabel &&
            searchableLabel.toLowerCase().match(searchTerm.toLowerCase()))
        );
      })
    );
  }, [options, searchTerm]);

  const triggerChangeEvent = useCallback(
    (option: DropdownOption) => {
      const { value } = option;
      const nextOptions = (() => {
        if (multiple) {
          const options = [...selectedOptions];
          const selectedOption = options.find(
            ({ value: selectedOptionValue }) => {
              return selectedOptionValue === value;
            }
          );
          if (selectedOption) {
            options.splice(options.indexOf(selectedOption), 1);
          } else {
            options.push(option);
          }
          return options.sort((a, b) => {
            const aOption = optionsRef.current.find(
              ({ value }) => value === a.value
            );
            const bOption = optionsRef.current.find(
              ({ value }) => value === b.value
            );

            if (aOption && bOption) {
              return (
                optionsRef.current.indexOf(aOption) -
                optionsRef.current.indexOf(bOption)
              );
            }
            return 0;
          });
        }
        return [option];
      })();
      setSelectedOptions(nextOptions);
      onChangeSelectedOptionRef.current &&
        onChangeSelectedOptionRef.current(nextOptions);
      if (!multiple && onCloseRef.current) {
        onCloseRef.current();
      }
    },
    [multiple, selectedOptions]
  );

  const { minOptionWidth } = useMemo(() => {
    return options.reduce(
      (accumulator, { label, searchableLabel }) => {
        const labelWidth = Math.ceil(
          (String(searchableLabel || label).length * typography.htmlFontSize) /
            2
        );
        labelWidth > accumulator.minOptionWidth &&
          (accumulator.minOptionWidth = labelWidth);
        return accumulator;
      },
      {
        minOptionWidth: minWidth,
      }
    );
  }, [minWidth, options, typography.htmlFontSize]);

  useEffect(() => {
    if (selectedOptionsProp) {
      setSelectedOptions(selectedOptionsProp);
    }
  }, [selectedOptionsProp]);

  useEffect(() => {
    if (setSelectedOptionsProp) {
      setSelectedOptionsProp(selectedOptions);
    }
  }, [setSelectedOptionsProp, selectedOptions]);

  useEffect(() => {
    const keydownCallback = (event: KeyboardEvent) => {
      const nextFocusedOptionIndex = (() => {
        switch (event.key) {
          case 'ArrowUp':
            if (focusedOptionIndex != null) {
              return (
                (!!focusedOptionIndex
                  ? focusedOptionIndex
                  : filteredOptions.length) - 1
              );
            }
            return filteredOptions.length - 1;
          case 'ArrowDown':
            if (focusedOptionIndex != null) {
              return (focusedOptionIndex + 1) % filteredOptions.length;
            }
            return 0;
          case 'Enter':
            if (focusedOptionIndex != null) {
              onSelectOptionRef.current &&
                onSelectOptionRef.current(filteredOptions[focusedOptionIndex]);
              triggerChangeEvent(filteredOptions[focusedOptionIndex]);
            }
            break;
          case 'Escape':
            onCloseRef.current && onCloseRef.current();
            break;
        }
      })();
      if (nextFocusedOptionIndex != null) {
        setFocusedOptionIndex(nextFocusedOptionIndex);
        if (scrollableDropdownWrapper) {
          if (nextFocusedOptionIndex > offset + limit - 1) {
            scrollableDropdownWrapper.scrollTop =
              (nextFocusedOptionIndex + 1) * optionHeight - maxHeight;
          } else {
            const { scrollTop } = scrollableDropdownWrapper;
            const nextFocusedOptionScrollTop =
              (nextFocusedOptionIndex + 1) * optionHeight;
            if (nextFocusedOptionScrollTop <= scrollTop) {
              scrollableDropdownWrapper.scrollTop =
                nextFocusedOptionScrollTop - optionHeight;
            }
          }
        }
      }
    };
    window.addEventListener('keydown', keydownCallback);
    return () => {
      window.removeEventListener('keydown', keydownCallback);
    };
  }, [
    filteredOptions,
    focusedOptionIndex,
    limit,
    maxHeight,
    offset,
    optionHeight,
    scrollableDropdownWrapper,
    triggerChangeEvent,
  ]);

  useEffect(() => {
    if (scrollableDropdownWrapper && paging) {
      const scrollCallback = () => {
        const { scrollTop } = scrollableDropdownWrapper;
        setOffset(Math.floor(scrollTop / optionHeight));
      };
      scrollableDropdownWrapper.addEventListener('scroll', scrollCallback);
      return () => {
        scrollableDropdownWrapper.removeEventListener('scroll', scrollCallback);
      };
    }
  }, [maxHeight, optionHeight, paging, scrollableDropdownWrapper]);

  useEffect(() => {
    setLimit(Math.ceil(maxHeight / optionHeight) + 1);
  }, [maxHeight, optionHeight]);

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

  const displayOptions = paging
    ? filteredOptions.slice(offset, offset + limit)
    : filteredOptions;
  const hasAllOptionsSelected =
    filteredOptions.length === selectedOptions.length;

  return (
    <Card {...CardProps} ref={ref} tabIndex={-1}>
      {(() => {
        if (searchable) {
          return (
            <>
              <Box
                sx={{
                  py: 1,
                  px: 2,
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search"
                  {...SearchFieldPropsRest}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ pointerEvents: 'none', mr: 1 }} />
                    ),
                    ...SearchFieldPropsRest.InputProps,
                  }}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  fullWidth
                  sx={{
                    [`.${outlinedInputClasses.root}`]: {
                      borderRadius: '20px',
                      bgcolor: palette.divider,
                    },
                    ...SearchFieldPropsSx,
                  }}
                />
              </Box>
              <Divider />
            </>
          );
        }
      })()}
      <Box
        ref={(scrollableDropdownWrapper: HTMLDivElement) => {
          setScrollableDropdownWrapper(scrollableDropdownWrapper);
        }}
        sx={{
          minWidth: minOptionWidth || minWidth,
          maxHeight,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
        tabIndex={-1}
      >
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            minHeight: paging
              ? filteredOptions.length * optionHeight
              : undefined,
          }}
          onClick={() => {
            if (!multiple && onCloseRef.current) {
              onCloseRef.current();
            }
          }}
          tabIndex={-1}
        >
          <Box sx={{ height: offset * optionHeight }} />
          {displayOptions.length > 0 ? (
            displayOptions.map((option) => {
              const {
                value,
                label,
                description,
                selectable,
                isDropdownOption = true,
                isDropdownOptionWrapped = true,
                onClick,
              } = option;
              if (isDropdownOption && isDropdownOptionWrapped) {
                const classNames = [];
                const isFocused =
                  filteredOptions.indexOf(option) === focusedOptionIndex;
                if (isFocused) {
                  classNames.push('Mui-focusVisible');
                }
                const dropdownOptionElement = (
                  <DropdownOption
                    className={classNames.join(' ')}
                    value={value}
                    key={value}
                    onClick={(event) => {
                      triggerChangeEvent(option);
                      onClick && onClick(event);
                      onSelectOption && onSelectOption(option);
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
                    {...{ selectable }}
                  >
                    {label}
                  </DropdownOption>
                );
                if (description) {
                  return (
                    <Tooltip title={description} key={value}>
                      {dropdownOptionElement}
                    </Tooltip>
                  );
                }
                return dropdownOptionElement;
              }
              return <Fragment key={value}>{label}</Fragment>;
            })
          ) : !loadOptionsRef.current || !loading ? (
            <MenuItem disabled>
              <Typography variant="body2" color={palette.error.main}>
                No options found
              </Typography>
            </MenuItem>
          ) : null}
        </Box>
      </Box>
      {multiple && filteredOptions.length > 1 ? (
        <>
          <Divider />
          <DropdownOption
            onClick={() => {
              const selectableOptions = (() => {
                if (hasAllOptionsSelected) {
                  return [];
                }
                return filteredOptions.filter((option) => {
                  const { selectable = true } = option;
                  return selectable;
                });
              })();
              setSelectedOptions(selectableOptions);
              onChangeSelectedOption &&
                onChangeSelectedOption(selectableOptions);
            }}
          >
            {hasAllOptionsSelected ? 'Deselect' : 'Select'} All
          </DropdownOption>
        </>
      ) : null}
      {loadOptions && (
        <>
          {displayOptions.length > 0 ? <Divider /> : null}
          <DropdownOption onClick={() => loadOptions()}>
            <Grid container sx={{ alignItems: 'center', gap: 1 }}>
              <Grid item>
                <ReloadIconButton
                  {...{ loading }}
                  sx={{
                    pointerEvents: 'none',
                    [`& .${iconButtonClasses.root}`]: {
                      p: 0,
                    },
                  }}
                />
              </Grid>
              <Grid item xs sx={{ minWidth: 0 }}>
                {(() => {
                  if (loading) {
                    return 'Refreshing...';
                  }
                  return 'Refresh';
                })()}
              </Grid>
            </Grid>
          </DropdownOption>
        </>
      )}
    </Card>
  );
});

export default PaginatedDropdownOptionList;
