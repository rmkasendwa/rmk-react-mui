import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  inputBaseClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import clsx from 'clsx';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';

import { LoadingProvider } from '../../contexts/LoadingContext';
import { useRecords } from '../../hooks/Utils';
import { TAPIFunction } from '../../interfaces/Utils';
import { isDescendant } from '../../utils/html';
import FieldValueDisplay from '../FieldValueDisplay';
import PaginatedDropdownOptionList, {
  DropdownOption,
  PaginatedDropdownOptionListProps,
} from '../PaginatedDropdownOptionList';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { TextFieldProps } from './TextField';

export interface DataDropdownFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type DataDropdownFieldClassKey = keyof DataDropdownFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDataDropdownField: DataDropdownFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDataDropdownField: keyof DataDropdownFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDataDropdownField?: {
      defaultProps?: ComponentsProps['MuiDataDropdownField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDataDropdownField'];
      variants?: ComponentsVariants['MuiDataDropdownField'];
    };
  }
}

export interface DataDropdownFieldProps
  extends Omit<TextFieldProps, 'value' | 'variant'>,
    Partial<
      Pick<PaginatedDropdownOptionListProps, 'optionVariant' | 'onSelectOption'>
    > {
  disableEmptyOption?: boolean;
  options?: DropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
  value?: string | string[];
  selectedOption?: DropdownOption;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
  SelectedOptionPillProps?: Partial<BoxProps>;
  searchable?: boolean;
  PaginatedDropdownOptionListProps?: Partial<PaginatedDropdownOptionListProps>;

  // Async options
  getDropdownOptions?: TAPIFunction<DropdownOption[]>;
  callGetDropdownOptions?: 'always' | 'whenNoOptions';

  variant?: 'standard' | 'filled' | 'outlined' | 'text';
}

export function getDataDropdownFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiDataDropdownField', slot);
}

export const dataDropdownFieldClasses: DataDropdownFieldClasses =
  generateUtilityClasses('MuiDataDropdownField', ['root']);

const slots = {
  root: ['root'],
};

export const DataDropdownField = forwardRef<
  HTMLDivElement,
  DataDropdownFieldProps
>(function DataDropdownField(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiDataDropdownField' });
  const {
    className,
    SelectProps,
    name,
    id,
    value,
    dataKey,
    options: optionsProp,
    sortOptions = false,
    onChange,
    onFocus,
    onBlur,
    InputProps,
    dropdownListMaxHeight,
    optionPaging = true,
    selectedOption,
    onChangeSearchTerm,
    optionVariant,
    sx,
    SelectedOptionPillProps = {},
    PaginatedDropdownOptionListProps = {},
    WrapperProps = {},
    disabled,
    showClearButton = true,
    searchable = true,
    getDropdownOptions,
    callGetDropdownOptions = 'whenNoOptions',
    onSelectOption,
    variant: variantProp,
    label,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getDataDropdownFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const isTextVariant = variantProp === 'text';
  const variant = (() => {
    if (variantProp !== 'text') {
      return variantProp;
    }
  })();

  const { sx: SelectedOptionPillPropsSx, ...SelectedOptionPillPropsRest } =
    SelectedOptionPillProps;
  const { ...PaginatedDropdownOptionListPropsRest } =
    PaginatedDropdownOptionListProps;
  const { sx: WrapperPropsSx, ...WrapperPropsRest } = WrapperProps;

  const multiple = SelectProps?.multiple;
  const { palette } = useTheme();

  const [options, setOptions] = useState<DropdownOption[]>(optionsProp || []);

  // Refs
  const anchorRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const getDropdownOptionsRef = useRef(getDropdownOptions);
  const optionsRef = useRef(options);
  useEffect(() => {
    onChangeRef.current = onChange;
    getDropdownOptionsRef.current = getDropdownOptions;
    optionsRef.current = options;
  }, [getDropdownOptions, onChange, options]);

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

  const {
    load: loadOptions,
    loading,
    records: dropdownRecords,
    errorMessage,
  } = useRecords(
    async () => {
      const shouldGetOptions = (() => {
        switch (callGetDropdownOptions) {
          case 'whenNoOptions':
            return options.length <= 0;
          case 'always':
          default:
            return true;
        }
      })();
      if (getDropdownOptions && shouldGetOptions) {
        return await getDropdownOptions();
      }
      return options;
    },
    {
      loadOnMount: false,
      autoSync: false,
      key: dataKey,
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
  const [missingOptionValues, setMissingOptionValues] = useState<
    (string | number)[]
  >([]);

  const selectedOptionValue = useMemo(() => {
    if (multiple) {
      return selectedOptions.map(({ value }) => value);
    }
    return selectedOptions[0]?.value;
  }, [multiple, selectedOptions]);

  const triggerChangeEvent = useCallback(
    (selectedOptions: DropdownOption[]) => {
      const selectedOptionValue = (() => {
        if (multiple) {
          return selectedOptions.map(({ value }) => value);
        }
        return selectedOptions[0]?.value;
      })();
      const event: any = new Event('blur', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: { id, name, value: selectedOptionValue },
      });
      onChangeRef.current && onChangeRef.current(event);
    },
    [multiple, id, name]
  );

  const selectedOptionDisplayString = useMemo(() => {
    return selectedOptions
      .filter(({ label, searchableLabel }) => {
        return typeof label === 'string' || searchableLabel;
      })
      .map(({ label, searchableLabel }) => searchableLabel || label)
      .join(', ');
  }, [selectedOptions]);

  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [loadOptions, open]);

  useEffect(() => {
    if (value) {
      const fieldValues = Array.isArray(value) ? value : [value];
      const optionValues = options.map(({ value }) => value);
      setMissingOptionValues(
        fieldValues.filter((value) => {
          return !optionValues.includes(value);
        })
      );
    }
  }, [errorMessage, loadOptions, options, value]);

  useEffect(() => {
    if (missingOptionValues.length > 0 && !errorMessage) {
      loadOptions();
    }
  }, [errorMessage, loadOptions, missingOptionValues.length]);

  useEffect(() => {
    if (optionsProp) {
      setOptions((prevOptions) => {
        const nextOptions = optionsProp.sort(
          sortOptions ? sortOptionsRef.current : () => 0
        );
        if (
          JSON.stringify(
            prevOptions.map(({ value, label, searchableLabel }) => ({
              value,
              label: String(label),
              searchableLabel,
            }))
          ) !==
          JSON.stringify(
            nextOptions.map(({ value, label, searchableLabel }) => ({
              value,
              label: String(label),
              searchableLabel,
            }))
          )
        ) {
          return nextOptions;
        }
        return prevOptions;
      });
    } else {
      setOptions(
        dropdownRecords.sort(sortOptions ? sortOptionsRef.current : () => 0)
      );
    }
  }, [dropdownRecords, optionsProp, sortOptions]);

  useEffect(() => {
    const fieldValues = Array.isArray(value) ? value : [value];
    setSelectedOptions((prevSelectedOptions) => {
      const nextSelectedOptions = fieldValues
        .map((value) => {
          return options.find(
            ({ value: optionValue }) => value === optionValue
          )!;
        })
        .filter((option) => option);
      if (
        prevSelectedOptions.map(({ value }) => value).join() !==
        nextSelectedOptions.map(({ value }) => value).join()
      ) {
        return nextSelectedOptions;
      }
      return prevSelectedOptions;
    });
  }, [options, value]);

  useEffect(() => {
    if (selectedOption) {
      const existingOption = optionsRef.current.find(
        ({ value }) => value === selectedOption.value
      );
      if (!existingOption) {
        setOptions((prevOptions) => {
          return [...prevOptions, selectedOption].sort(
            sortOptions ? sortOptionsRef.current : () => 0
          );
        });
      }
      setSelectedOptions((prevSelectedOptions) => {
        const nextSelectedOptions = [selectedOption];
        if (
          nextSelectedOptions.map(({ value }) => value).join(';') !==
          prevSelectedOptions.map(({ value }) => value).join(';')
        ) {
          return nextSelectedOptions;
        }
        return prevSelectedOptions;
      });
    }
  }, [selectedOption, sortOptions]);

  const filteredOptions = useMemo(() => {
    if (searchTerm && searchTerm !== selectedOptionDisplayString) {
      const searchFilterTerms = searchTerm
        .split(',')
        .map((string) => string.trim().toLowerCase());
      return options.filter(({ label, searchableLabel }) => {
        if (typeof label !== 'string' && searchableLabel) {
          label = searchableLabel;
        }
        return (
          typeof label === 'string' &&
          searchFilterTerms.some((searchFilterTerm) => {
            return String(label).toLowerCase().match(searchFilterTerm);
          })
        );
      });
    }
    return options;
  }, [options, searchTerm, selectedOptionDisplayString]);

  if (value && loading && missingOptionValues.length > 0) {
    if (isTextVariant) {
      return <FieldValueDisplay {...{ label, value }} />;
    }
    return (
      <LoadingProvider value={{ loading, errorMessage }}>
        <TextField {...rest} {...{ label, variant }} />
      </LoadingProvider>
    );
  }

  const errorProps: Pick<TextFieldProps, 'error' | 'helperText'> = {};
  if (errorMessage) {
    errorProps.error = true;
    errorProps.helperText = (
      <RetryErrorMessage message={errorMessage} retry={loadOptions} />
    );
  }

  const endAdornment = (
    <>
      {showClearButton && selectedOptions.length > 0 && !disabled ? (
        <Tooltip title="Clear">
          <IconButton
            className="data-dropdown-input-clear-button"
            onClick={(event) => {
              event.stopPropagation();
              setSearchTerm('');
              const options: DropdownOption[] = [];
              setSelectedOptions(options);
              triggerChangeEvent(options);
            }}
            sx={{ p: 0.4 }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <ExpandMoreIcon />
    </>
  );

  return (
    <>
      {(() => {
        if (isTextVariant) {
          return (
            <FieldValueDisplay
              ref={mergeRefs([ref, anchorRef])}
              {...{ label }}
              FieldValueProps={{
                variant: 'inherit',
                noWrap: true,
                ContainerGridProps: {
                  sx: {
                    mt: 0,
                  },
                },
                sx: {
                  cursor: 'pointer',
                },
              }}
              value={
                <Stack
                  sx={{
                    alignItems: 'center',
                    gap: 1,
                  }}
                  direction="row"
                >
                  {selectedOptions[0]?.label || rest.placeholder}
                  {endAdornment}
                </Stack>
              }
              onClick={() => {
                setOpen(true);
              }}
            />
          );
        }
        return (
          <TextField
            ref={mergeRefs([ref, anchorRef])}
            onFocus={(event) => {
              setOpen(true);
              setFocused(true);
              onFocus && onFocus(event);
            }}
            onBlur={() => {
              setFocused(false);
              if (onBlur) {
                const event: any = new Event('blur', { bubbles: true });
                Object.defineProperty(event, 'target', {
                  writable: false,
                  value: {
                    name,
                    id,
                    value: selectedOptionValue,
                  },
                });
                onBlur(event);
              }
            }}
            onChange={(event) => {
              if (searchable) {
                setSearchTerm(event.target.value);
                onChangeSearchTerm && onChangeSearchTerm(event.target.value);
              }
            }}
            InputProps={{
              endAdornment,
              ...InputProps,
              ...(() => {
                const props: Partial<typeof InputProps> = {};
                if (selectedOptions.length > 0) {
                  props.placeholder = '';
                }
                return props;
              })(),
              readOnly: !searchable,
              // inputComponent: forwardRef<HTMLInputElement, any>(
              //   function ParentInput(inputProps, ref) {
              //     return <input {...inputProps} ref={ref} />;
              //   }
              // ),
            }}
            value={(() => {
              if (focused && searchable) {
                return searchTerm;
              } else {
                return selectedOptionDisplayString;
              }
            })()}
            className={clsx(classes.root)}
            {...{ variant, label, disabled }}
            {...rest}
            {...errorProps}
            endChildren={(() => {
              if (searchable && !focused && selectedOptions.length > 0) {
                return (
                  <Box
                    className="data-dropdown-field-selected-option-wrapper"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      pointerEvents: 'none',
                      display: 'flex',
                      whiteSpace: 'nowrap',
                      gap: 0.5,
                      overflow: 'hidden',
                      ...(() => {
                        if (variant === 'standard') {
                          return {
                            pb: '5px',
                            bottom: 2,
                          };
                        }
                        if (variant === 'filled') {
                          return {
                            pb: '4px',
                            pl: '12px',
                            bottom: -1,
                          };
                        }
                        return {
                          height: '100%',
                          pl: '14px',
                          alignItems: 'center',
                        };
                      })(),
                    }}
                  >
                    {multiple ? (
                      selectedOptions.map(({ label, value }) => {
                        return (
                          <Box
                            key={value}
                            {...SelectedOptionPillPropsRest}
                            sx={{
                              fontSize: 14,
                              bgcolor: alpha(palette.primary.main, 0.1),
                              borderRadius: '20px',
                              height: 25,
                              py: 0.25,
                              pl: (() => {
                                if (
                                  ['string', 'number'].includes(typeof label)
                                ) {
                                  return 1;
                                }
                                return 0.25;
                              })(),
                              pr: 1,
                              mr: 0.5,
                              ...SelectedOptionPillPropsSx,
                            }}
                          >
                            {label}
                          </Box>
                        );
                      })
                    ) : (
                      <Typography
                        component="div"
                        sx={{
                          fontSize: 14,
                        }}
                      >
                        {selectedOptions[0]?.label}
                      </Typography>
                    )}
                  </Box>
                );
              }
            })()}
            WrapperProps={{
              ...WrapperPropsRest,
              sx: {
                width: '100%',
                ...WrapperPropsSx,
                [`& .${inputBaseClasses.input}`]: (() => {
                  if (
                    searchable &&
                    !focused &&
                    selectedOptionDisplayString.length > 0
                  ) {
                    return { color: 'transparent' };
                  }
                  return {};
                })(),
                '&>.data-dropdown-field-selected-option-wrapper': {
                  width: 'calc(100% - 40px)',
                },
                ...(() => {
                  if (showClearButton) {
                    return {
                      '&:hover>.data-dropdown-field-selected-option-wrapper': {
                        width: 'calc(100% - 72px)',
                      },
                    };
                  }
                })(),
              },
            }}
            sx={{
              '& .data-dropdown-input-clear-button': {
                visibility: 'hidden',
              },
              '&:hover .data-dropdown-input-clear-button': {
                visibility: 'visible',
              },
              ...sx,
            }}
          />
        );
      })()}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
        tabIndex={-1}
        sx={{
          zIndex: 1400,
        }}
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box tabIndex={-1}>
                <ClickAwayListener
                  onClickAway={(event) => {
                    if (anchorRef.current) {
                      setOpen(
                        isDescendant(anchorRef.current, event.target as any)
                      );
                    }
                  }}
                >
                  <PaginatedDropdownOptionList
                    {...{
                      optionVariant,
                      multiple,
                      onSelectOption,
                    }}
                    {...PaginatedDropdownOptionListPropsRest}
                    options={filteredOptions}
                    minWidth={
                      anchorRef.current
                        ? anchorRef.current.offsetWidth
                        : undefined
                    }
                    maxHeight={dropdownListMaxHeight}
                    paging={optionPaging}
                    onClose={() => {
                      setOpen(false);
                    }}
                    loadOptions={
                      getDropdownOptions ? () => loadOptions(true) : undefined
                    }
                    onChangeSelectedOption={triggerChangeEvent}
                    {...{
                      selectedOptions,
                      setSelectedOptions,
                      loading,
                    }}
                  />
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
});

export default DataDropdownField;
