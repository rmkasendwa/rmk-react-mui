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
  useMediaQuery,
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

import {
  LoadingProvider,
  useLoadingContext,
} from '../../contexts/LoadingContext';
import { useRecord } from '../../hooks/Utils';
import { isDescendant } from '../../utils/html';
import FieldValueDisplay from '../FieldValueDisplay';
import ModalPopup from '../ModalPopup';
import PaginatedDropdownOptionList, {
  DropdownOption,
  PaginatedDropdownOptionListProps,
} from '../PaginatedDropdownOptionList';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { TextFieldProps } from './TextField';

export interface DataDropdownFieldClasses {
  /** Styles applied to the root element. */
  root: string;
  selectedOptionsWrapper: string;
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
      Pick<
        PaginatedDropdownOptionListProps,
        | 'optionVariant'
        | 'onSelectOption'
        | 'searchable'
        | 'getDropdownOptions'
        | 'callGetDropdownOptions'
        | 'externallyPaginated'
        | 'limit'
        | 'sortOptions'
      >
    > {
  disableEmptyOption?: boolean;
  options?: DropdownOption[];
  dataKey?: string;
  value?: string | string[];
  selectedOption?: DropdownOption;
  getSelectedOptions?: (
    selectedValue: string | string[]
  ) => Promise<DropdownOption[]>;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
  SelectedOptionPillProps?: Partial<BoxProps>;
  PaginatedDropdownOptionListProps?: Partial<PaginatedDropdownOptionListProps>;
  variant?: 'standard' | 'filled' | 'outlined' | 'text';
  showDropdownIcon?: boolean;
}

export function getDataDropdownFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiDataDropdownField', slot);
}

export const dataDropdownFieldClasses: DataDropdownFieldClasses =
  generateUtilityClasses('MuiDataDropdownField', [
    'root',
    'selectedOptionsWrapper',
  ]);

const slots = {
  root: ['root'],
  selectedOptionsWrapper: ['selectedOptionsWrapper'],
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
    sortOptions,
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
    callGetDropdownOptions,
    onSelectOption,
    variant: variantProp,
    label,
    limit,
    externallyPaginated,
    getSelectedOptions,
    startAdornment,
    endAdornment: endAdornmentProp,
    showDropdownIcon = true,
    enableLoadingState = true,
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

  const { palette, breakpoints } = useTheme();

  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [options, setOptions] = useState<DropdownOption[]>(optionsProp || []);

  // Refs
  const anchorRef = useRef<HTMLInputElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const asyncOptionPagesMapRef = useRef<Map<number, DropdownOption[]>>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;
  const getSelectedOptionsRef = useRef(getSelectedOptions);
  getSelectedOptionsRef.current = getSelectedOptions;

  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);

  const selectedOptionValue = useMemo(() => {
    if (multiple) {
      return selectedOptions.map(({ value }) => value);
    }
    return selectedOptions[0]?.value;
  }, [multiple, selectedOptions]);

  const canLoadAsyncSelectedOptions = Boolean(
    getSelectedOptions || getDropdownOptions
  );

  const {
    load: loadAsyncSelectedOptions,
    record: asyncSelectedOptions,
    loading: loadingAsyncSelectedOptions,
    errorMessage: asyncSelectedOptionsErrorMessage,
  } = useRecord(
    (async (value) => {
      if (getSelectedOptions) {
        return getSelectedOptions(value);
      }
      if (getDropdownOptions) {
        const dropdownOptionsResponse = await getDropdownOptions({});
        const options = Array.isArray(dropdownOptionsResponse)
          ? dropdownOptionsResponse
          : dropdownOptionsResponse.records;
        const selectedValue = Array.isArray(value) ? value : [value];
        return options.filter(({ value }) => {
          return selectedValue.includes(String(value));
        });
      }
      return [];
    }) as NonNullable<typeof getSelectedOptions>,
    {
      autoSync: false,
      loadOnMount: false,
    }
  );

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
        return typeof label === 'string' || typeof searchableLabel === 'string';
      })
      .map(({ label, searchableLabel }) => {
        return String(searchableLabel || label);
      })
      .join(', ');
  }, [selectedOptions]);

  useEffect(() => {
    if (optionsProp) {
      setOptions((prevOptions) => {
        const nextOptions = optionsProp;
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
    }
  }, [optionsProp, sortOptions]);

  useEffect(() => {
    const fieldValues = Array.isArray(value) ? value : [value];
    setSelectedOptions((prevSelectedOptions) => {
      const nextSelectedOptions = fieldValues
        .map((value) => {
          return optionsRef.current.find(
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
  }, [value]);

  useEffect(() => {
    setSelectedOptions((prevSelectedOptions) => {
      if (selectedOption?.value && selectedOptionRef.current) {
        const nextSelectedOptions = [selectedOptionRef.current];
        if (
          nextSelectedOptions.map(({ value }) => value).join(';') !==
          prevSelectedOptions.map(({ value }) => value).join(';')
        ) {
          return nextSelectedOptions;
        }
      }
      return prevSelectedOptions;
    });
  }, [selectedOption?.value]);

  useEffect(() => {
    if (asyncSelectedOptions && asyncSelectedOptions.length > 0) {
      setSelectedOptions((prevSelectedOptions) => {
        if (
          asyncSelectedOptions.map(({ value }) => value).join(';') !==
          prevSelectedOptions.map(({ value }) => value).join(';')
        ) {
          return asyncSelectedOptions;
        }
        return prevSelectedOptions;
      });
    }
  }, [asyncSelectedOptions]);

  useEffect(() => {
    if (value) {
      setSelectedOptions((prevSelectedOptions) => {
        const selectedValue = [...(Array.isArray(value) ? value : [value])];
        if (
          canLoadAsyncSelectedOptions &&
          (prevSelectedOptions.length <= 0 ||
            selectedValue.join(';') !==
              prevSelectedOptions.map(({ value }) => value).join(';'))
        ) {
          loadAsyncSelectedOptions(value);
        }
        return prevSelectedOptions;
      });
    }
  }, [canLoadAsyncSelectedOptions, loadAsyncSelectedOptions, value]);

  const selectedOptionsElement = (() => {
    if (!focused && selectedOptions.length > 0) {
      return (
        <>
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
                      if (['string', 'number'].includes(typeof label)) {
                        return 1;
                      }
                      return 0.25;
                    })(),
                    pr: 1,
                    mr: 0.5,
                    '&>*': {
                      flexWrap: 'nowrap',
                    },
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
        </>
      );
    }
  })();

  const { locked } = useLoadingContext();

  if (enableLoadingState && locked) {
    return (
      <FieldValueDisplay
        {...({} as any)}
        {...rest.FieldValueDisplayProps}
        {...{ label }}
        value={(() => {
          if (selectedOptionsElement) {
            return (
              <Box
                className={classes.selectedOptionsWrapper}
                sx={{
                  display: 'flex',
                  whiteSpace: 'nowrap',
                  gap: 0.5,
                }}
              >
                {selectedOptionsElement}
              </Box>
            );
          }
        })()}
      />
    );
  }

  if (value && loadingAsyncSelectedOptions) {
    return (
      <LoadingProvider
        value={{
          loading: loadingAsyncSelectedOptions,
          errorMessage: asyncSelectedOptionsErrorMessage,
        }}
      >
        {(() => {
          if (isTextVariant) {
            return <FieldValueDisplay {...{ label }} />;
          }
          return (
            <TextField {...rest} {...{ label, variant, enableLoadingState }} />
          );
        })()}
      </LoadingProvider>
    );
  }

  const errorProps: Pick<TextFieldProps, 'error' | 'helperText'> = {};
  if (asyncSelectedOptionsErrorMessage) {
    errorProps.error = true;
    errorProps.helperText = (
      <RetryErrorMessage
        message={asyncSelectedOptionsErrorMessage}
        retry={() => {
          loadAsyncSelectedOptions(value);
        }}
      />
    );
  }

  const endAdornment = (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      {showClearButton &&
      selectedOptions.length > 0 &&
      !disabled &&
      !focused ? (
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
      {showDropdownIcon ? <ExpandMoreIcon /> : null}
      {endAdornmentProp}
    </Stack>
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
                  {startAdornment}
                  {selectedOptions[0]?.label || rest.placeholder}
                  {endAdornment}
                </Stack>
              }
              onClick={() => {
                setOpen(true);
              }}
              enableLoadingState={enableLoadingState}
            />
          );
        }
        return (
          <TextField
            ref={ref}
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            onFocus={(event) => {
              event.preventDefault();
              if (!isSmallScreenSize) {
                setOpen(true);
              }
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
              readOnly: !searchable || isSmallScreenSize,
              ref: anchorRef,
            }}
            inputProps={{
              ref: searchFieldRef,
            }}
            value={(() => {
              if (
                !isSmallScreenSize &&
                searchable &&
                (focused || (open && selectedOptionDisplayString.length <= 0))
              ) {
                return searchTerm;
              }
              return selectedOptionDisplayString;
            })()}
            className={clsx(classes.root)}
            {...{
              variant,
              label,
              disabled,
              startAdornment,
              enableLoadingState,
            }}
            {...rest}
            endChildren={(() => {
              if (selectedOptionsElement) {
                return (
                  <Box
                    className={classes.selectedOptionsWrapper}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      pointerEvents: 'none',
                      display: 'flex',
                      whiteSpace: 'nowrap',
                      gap: 0.5,
                      overflow: 'hidden',
                      ...(() => {
                        if (rest.size === 'medium') {
                          if (variant === 'standard') {
                            return {
                              top: 21,
                            };
                          }
                          if (variant === 'filled') {
                            return {
                              top: 25,
                            };
                          }
                          return {
                            top: 17,
                          };
                        }
                        if (variant === 'standard') {
                          return {
                            top: 19,
                          };
                        }
                        if (variant === 'filled') {
                          return {
                            top: 21,
                          };
                        }
                        return {
                          top: 9,
                        };
                      })(),
                      ...(() => {
                        if (variant === 'standard') {
                          return {
                            pb: '5px',
                          };
                        }
                        if (variant === 'filled') {
                          return {
                            pb: '4px',
                            pl: '12px',
                          };
                        }
                        return {
                          pl: '14px',
                          alignItems: 'center',
                        };
                      })(),
                    }}
                  >
                    {selectedOptionsElement}
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
                [`&>.${classes.selectedOptionsWrapper}`]: {
                  width: 'calc(100% - 40px)',
                },
                ...(() => {
                  if (showClearButton) {
                    return {
                      [`&:hover>.${classes.selectedOptionsWrapper}`]: {
                        width: 'calc(100% - 72px)',
                      },
                    };
                  }
                })(),
              },
            }}
            showClearButton={!focused}
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
      {(() => {
        const optionsElement = (
          <PaginatedDropdownOptionList
            paging={optionPaging}
            {...PaginatedDropdownOptionListPropsRest}
            {...(() => {
              if (isTextVariant) {
                return {
                  searchable: true,
                };
              }
            })()}
            {...{
              maxHeight: dropdownListMaxHeight,
              ...(() => {
                if (isSmallScreenSize) {
                  return {
                    searchable: true,
                    maxHeight:
                      dropdownListMaxHeight ?? window.innerHeight - 240,
                    sx: {
                      border: 'none',
                    },
                  };
                }
              })(),
              optionVariant,
              multiple,
              onSelectOption,
              searchTerm,
              options,
              selectedOptions,
              dataKey,
              getDropdownOptions,
              callGetDropdownOptions,
              externallyPaginated,
              limit,
              sortOptions,
            }}
            keyboardFocusElement={searchFieldRef.current}
            onChangeSearchTerm={(searchTerm) => {
              setSearchTerm(searchTerm);
            }}
            minWidth={
              anchorRef.current ? anchorRef.current.offsetWidth : undefined
            }
            onLoadOptions={(options) => {
              setOptions(options);
            }}
            onClose={() => {
              setOpen(false);
            }}
            onChangeSelectedOptions={(options) => {
              setSelectedOptions(options);
              triggerChangeEvent(options);
              searchFieldRef.current?.blur();
            }}
            asyncOptionPagesMap={asyncOptionPagesMapRef.current}
            onChangeAsyncOptionPagesMap={(asyncOptionPagesMap) => {
              asyncOptionPagesMapRef.current = asyncOptionPagesMap;
            }}
          />
        );
        if (isSmallScreenSize) {
          return (
            <ModalPopup
              {...{ open }}
              onClose={() => {
                setOpen(false);
              }}
              CardProps={{
                sx: {
                  maxHeight: 'none',
                },
              }}
              CardBodyProps={{
                sx: {
                  p: 0,
                },
              }}
              disableEscapeKeyDown={false}
              disableAutoFocus={false}
              showHeaderToolbar={false}
              enableCloseOnBackdropClick
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {optionsElement}
            </ModalPopup>
          );
        }
        return (
          <Popper
            {...{ open }}
            anchorEl={anchorRef.current}
            transition
            placement="bottom-start"
            sx={{
              zIndex: 1400,
            }}
          >
            {({ TransitionProps }) => {
              return (
                <Grow {...TransitionProps} style={{ transformOrigin: '0 0 0' }}>
                  <Box>
                    <ClickAwayListener
                      onClickAway={(event) => {
                        if (anchorRef.current) {
                          setOpen(
                            isDescendant(anchorRef.current, event.target as any)
                          );
                        }
                      }}
                    >
                      {optionsElement}
                    </ClickAwayListener>
                  </Box>
                </Grow>
              );
            }}
          </Popper>
        );
      })()}
    </>
  );
});

export default DataDropdownField;
