import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Chip,
  ChipProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  chipClasses,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  inputBaseClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import clsx from 'clsx';
import { pick } from 'lodash';
import {
  ReactElement,
  Ref,
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
import {
  CacheableDataFinderOptions,
  useCacheableData,
} from '../../hooks/Utils';
import { PaginatedResponseData } from '../../models/Utils';
import { isDescendant } from '../../utils/html';
import FieldValueDisplay from '../FieldValueDisplay';
import ModalPopup from '../ModalPopup';
import PaginatedDropdownOptionList, {
  DropdownOption,
  PaginatedDropdownOptionListProps,
} from '../PaginatedDropdownOptionList';
import { getDropdownOptionLabel } from '../PaginatedDropdownOptionList/DropdownOption';
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

export interface DataDropdownFieldProps<Entity = any>
  extends Omit<TextFieldProps, 'value' | 'variant'>,
    Partial<
      Pick<
        PaginatedDropdownOptionListProps<Entity>,
        | 'optionVariant'
        | 'onSelectOption'
        | 'searchable'
        | 'getDropdownOptions'
        | 'callGetDropdownOptions'
        | 'externallyPaginated'
        | 'limit'
        | 'sortOptions'
        | 'options'
        | 'onChangeSelectedOptions'
        | 'multiple'
      >
    > {
  onChangeSelectedOption?: (selectedOption?: DropdownOption<Entity>) => void;
  disableEmptyOption?: boolean;
  dataKey?: string;
  value?: string | string[];
  selectedOption?: DropdownOption<Entity>;
  placeholderOption?: DropdownOption<Entity>;
  getSelectedOptions?: (
    selectedValue: string[],
    options: CacheableDataFinderOptions
  ) => Promise<DropdownOption<Entity>[]>;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
  SelectedOptionPillProps?: Partial<ChipProps>;
  PaginatedDropdownOptionListProps?: Partial<PaginatedDropdownOptionListProps>;
  variant?: 'standard' | 'filled' | 'outlined' | 'text';
  showDropdownIcon?: boolean;
  showRichTextValue?: boolean;
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

const BaseDataDropdownField = <Entity,>(
  inProps: DataDropdownFieldProps<Entity>,
  ref: Ref<HTMLDivElement>
) => {
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
    InputProps = {},
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
    showRichTextValue = true,
    placeholderOption,
    onChangeSelectedOptions: onChangeSelectedOptionsProp,
    onChangeSelectedOption,
    multiple: multipleProp,
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
  const { sx: InputPropsSx, ...InputPropsRest } = InputProps;

  const multiple = multipleProp || SelectProps?.multiple;

  const { breakpoints } = useTheme();

  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [options, setOptions] = useState<DropdownOption[]>(optionsProp || []);

  const [selectedOptionsRowSpan, setSelectedOptionsRowSpan] = useState(1);

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

  const valueRef = useRef(value);
  valueRef.current = value;
  const stringifiedValue = (() => {
    if (value != null) {
      return JSON.stringify(value);
    }
    return value;
  })();

  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  //#region Selected Options
  const onChangeSelectedOptionsRef = useRef(onChangeSelectedOptionsProp);
  onChangeSelectedOptionsRef.current = onChangeSelectedOptionsProp;
  const onChangeSelectedOptionRef = useRef(onChangeSelectedOption);
  onChangeSelectedOptionRef.current = onChangeSelectedOption;

  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    if (multiple) {
      onChangeSelectedOptionsRef.current &&
        onChangeSelectedOptionsRef.current(selectedOptions);
    } else {
      onChangeSelectedOptionRef.current &&
        onChangeSelectedOptionRef.current(selectedOptions[0]);
    }
  }, [multiple, selectedOptions]);
  //#endregion

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
    loading: loadingAsyncSelectedOptions,
    errorMessage: asyncSelectedOptionsErrorMessage,
  } = useCacheableData(
    async ({ getRequestController }) => {
      const asyncSelectedOptions = await (async () => {
        const selectedValue = value
          ? [...(Array.isArray(value) ? value : [value])]
          : [];
        if (getSelectedOptions && selectedValue.length > 0) {
          return getSelectedOptions(selectedValue, {
            getRequestController,
            getStaleWhileRevalidate: (asyncSelectedOptions) => {
              setSelectedOptions(asyncSelectedOptions);
            },
          });
        }
        if (getDropdownOptions && selectedValue.length > 0) {
          const processOptionsResponse = (
            dropdownOptionsResponse:
              | DropdownOption<Entity>[]
              | PaginatedResponseData<DropdownOption<Entity>>
          ) => {
            const options = Array.isArray(dropdownOptionsResponse)
              ? dropdownOptionsResponse
              : dropdownOptionsResponse.records;
            return options.filter(({ value }) => {
              return selectedValue.includes(String(value));
            });
          };
          const dropdownOptionsResponse = await getDropdownOptions({
            getStaleWhileRevalidate: (dropdownOptionsResponse) => {
              setSelectedOptions(
                processOptionsResponse(dropdownOptionsResponse)
              );
            },
          });
          return processOptionsResponse(dropdownOptionsResponse);
        }
        return [];
      })();
      setSelectedOptions(asyncSelectedOptions);
      return asyncSelectedOptions;
    },
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
    if (!loadingAsyncSelectedOptions) {
      setSelectedOptions((prevSelectedOptions) => {
        const value = (() => {
          if (stringifiedValue != null) {
            return JSON.parse(stringifiedValue);
          }
          return stringifiedValue;
        })();
        const selectedValue = value
          ? [...(Array.isArray(value) ? value : [value])]
          : [];
        const prevSelectedOptionsValues = prevSelectedOptions.map(
          ({ value }) => value
        );

        if (selectedOption?.value && selectedOptionRef.current) {
          const nextSelectedOptions = [selectedOptionRef.current];
          const nextSelectedOptionsValues = nextSelectedOptions.map(
            ({ value }) => value
          );
          if (
            selectedValue.every((value) =>
              nextSelectedOptionsValues.includes(value)
            )
          ) {
            return nextSelectedOptions;
          }
        }

        const nextSelectedOptions = selectedValue
          .map((value) => {
            return optionsRef.current.find(
              ({ value: optionValue }) => value === optionValue
            )!;
          })
          .filter((option) => option);

        const nextSelectedOptionsValues = nextSelectedOptions.map(
          ({ value }) => value
        );

        if (
          selectedValue.every((value) =>
            nextSelectedOptionsValues.includes(value)
          )
        ) {
          return nextSelectedOptions;
        }

        if (
          !selectedValue.every((value) =>
            prevSelectedOptionsValues.includes(value)
          ) &&
          canLoadAsyncSelectedOptions &&
          selectedValue.length > 0
        ) {
          loadAsyncSelectedOptions();
        }
        return prevSelectedOptions;
      });
    }
  }, [
    canLoadAsyncSelectedOptions,
    loadAsyncSelectedOptions,
    loadingAsyncSelectedOptions,
    selectedOption?.value,
    stringifiedValue,
  ]);

  const selectedOptionsElement = (() => {
    const optionsToDisplay = (() => {
      if (selectedOptions.length > 0) {
        return selectedOptions;
      }
      if (placeholderOption) {
        return [placeholderOption];
      }
      return [];
    })();
    if (showRichTextValue && !focused && optionsToDisplay.length > 0) {
      return (
        <>
          {multiple ? (
            optionsToDisplay.map(({ label, icon, value }) => {
              return (
                <Chip
                  key={value}
                  {...SelectedOptionPillPropsRest}
                  label={getDropdownOptionLabel({
                    label,
                    icon,
                  })}
                  onDelete={() => {
                    setSelectedOptions((prevSelectedOptions) => {
                      const nextSelectedOptions = prevSelectedOptions.filter(
                        ({ value: optionValue }) => {
                          return optionValue !== value;
                        }
                      );
                      triggerChangeEvent(nextSelectedOptions);
                      return nextSelectedOptions;
                    });
                  }}
                  size="small"
                  sx={{
                    ...SelectedOptionPillPropsSx,
                    [`.${chipClasses.deleteIcon}`]: {
                      pointerEvents: 'all',
                    },
                  }}
                />
              );
            })
          ) : (
            <Typography
              component="div"
              sx={{
                fontSize: 14,
              }}
            >
              {optionsToDisplay[0]?.label}
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
                  gap: 0.5,
                  ...(() => {
                    if (rest.multiline) {
                      return {
                        flexWrap: 'wrap',
                      };
                    }
                    return {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    };
                  })(),
                }}
              >
                {selectedOptionsElement}
              </Box>
            );
          }
          return selectedOptionDisplayString;
        })()}
      />
    );
  }

  if (
    (value && selectedOptions.length <= 0 && loadingAsyncSelectedOptions) ||
    asyncSelectedOptionsErrorMessage
  ) {
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
            <TextField
              {...rest}
              {...{ label, variant, enableLoadingState, sx }}
            />
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
          loadAsyncSelectedOptions();
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
                onClick: () => {
                  if (!disabled) {
                    setOpen(true);
                  }
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
                  {(() => {
                    if (selectedOptionsElement) {
                      return (
                        <Box
                          className={classes.selectedOptionsWrapper}
                          sx={{
                            pointerEvents: 'none',
                            display: 'flex',
                            gap: 0.5,
                            ...(() => {
                              if (rest.multiline) {
                                return {
                                  flexWrap: 'wrap',
                                };
                              }
                              return {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              };
                            })(),
                          }}
                        >
                          {selectedOptionsElement}
                        </Box>
                      );
                    }
                    if (rest.placeholder) {
                      return (
                        <Box
                          sx={{
                            opacity: 0.2,
                          }}
                        >
                          {rest.placeholder}
                        </Box>
                      );
                    }
                  })()}
                  {endAdornment}
                </Stack>
              }
              enableLoadingState={enableLoadingState}
              sx={
                {
                  ...pick(sx, 'width', 'minWidth', 'maxWidth'),
                } as any
              }
            />
          );
        }
        return (
          <TextField
            ref={ref}
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
              ...InputPropsRest,
              ...(() => {
                const props: Partial<typeof InputProps> = {};
                if (selectedOptions.length > 0) {
                  props.placeholder = '';
                }
                return props;
              })(),
              readOnly: !searchable || isSmallScreenSize,
              onClick: () => {
                if (!disabled) {
                  setOpen(true);
                }
              },
              ref: anchorRef,
              sx: {
                ...(() => {
                  if (rest.multiline) {
                    return {
                      alignItems: 'start',
                    };
                  }
                })(),
                ...InputPropsSx,
              },
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
              if (selectedOptionDisplayString) {
                return selectedOptionDisplayString;
              }
              if (placeholderOption) {
                return String(
                  placeholderOption.searchableLabel || placeholderOption.label
                );
              }
              return '';
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
            {...(() => {
              if (rest.multiline) {
                return {
                  rows: selectedOptionsRowSpan,
                };
              }
            })()}
            endChildren={(() => {
              if (selectedOptionsElement) {
                return (
                  <Box
                    className={classes.selectedOptionsWrapper}
                    ref={(el: HTMLDivElement) => {
                      if (el) {
                        setSelectedOptionsRowSpan(
                          Math.ceil(el.clientHeight / 24)
                        );
                      } else {
                        setSelectedOptionsRowSpan(1);
                      }
                    }}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      pointerEvents: 'none',
                      display: 'flex',
                      gap: 0.5,
                      ...(() => {
                        if (rest.multiline) {
                          return {
                            flexWrap: 'wrap',
                          };
                        }
                        return {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        };
                      })(),
                      ...(() => {
                        if (disabled) {
                          return {
                            opacity: 0.38,
                          };
                        }
                      })(),
                      ...(() => {
                        if (rest.size === 'medium') {
                          if (variant === 'standard') {
                            if (!label) {
                              return {
                                top: 5,
                              };
                            }
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
                          if (!label) {
                            return {
                              top: 3,
                            };
                          }
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
                    showRichTextValue &&
                    !focused &&
                    (selectedOptionDisplayString.length > 0 ||
                      placeholderOption)
                  ) {
                    return {
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                    };
                  }
                  return {};
                })(),
                [`&>.${classes.selectedOptionsWrapper}`]: {
                  width: 'calc(100% - 40px)',
                },
                ...(() => {
                  if (showClearButton) {
                    if (rest.multiline) {
                      return {
                        [`&>.${classes.selectedOptionsWrapper}`]: {
                          width: 'calc(100% - 72px)',
                        },
                      };
                    }
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
};

export const DataDropdownField = forwardRef(BaseDataDropdownField) as <Entity>(
  p: DataDropdownFieldProps<Entity> & {
    ref?: Ref<HTMLDivElement>;
  }
) => ReactElement;

export default DataDropdownField;
