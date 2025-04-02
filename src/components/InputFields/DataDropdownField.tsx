import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Chip,
  ChipProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  InputProps,
  Stack,
  Typography,
  alpha,
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
import { merge, omit } from 'lodash';
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
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

import { useLoadingContext } from '../../contexts/LoadingContext';
import { isDescendant } from '../../utils/html';
import FieldValueDisplay from '../FieldValueDisplay';
import ModalPopup from '../ModalPopup';
import PaginatedDropdownOptionList, {
  DropdownOption,
  PaginatedDropdownOptionListProps,
} from '../PaginatedDropdownOptionList';
import { getDropdownOptionLabel } from '../PaginatedDropdownOptionList/DropdownOption';
import Tooltip from '../Tooltip';
import TextField, { TextFieldProps } from './TextField';

export interface DataDropdownFieldClasses {
  /** Styles applied to the root element. */
  root: string;
  selectedOptionsWrapper: string;
}

export type DataDropdownFieldClassKey = keyof DataDropdownFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDataDropdownField: DataDropdownFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDataDropdownField: keyof DataDropdownFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDataDropdownField?: {
      defaultProps?: ComponentsProps['MuiDataDropdownField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDataDropdownField'];
      variants?: ComponentsVariants['MuiDataDropdownField'];
    };
  }
}
//#endregion

export const getDataDropdownFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiDataDropdownField', slot);
};

const slots: Record<DataDropdownFieldClassKey, [DataDropdownFieldClassKey]> = {
  root: ['root'],
  selectedOptionsWrapper: ['selectedOptionsWrapper'],
};

export const dataDropdownFieldClasses: DataDropdownFieldClasses =
  generateUtilityClasses(
    'MuiDataDropdownField',
    Object.keys(slots) as DataDropdownFieldClassKey[]
  );

export interface DataDropdownFieldProps<Entity = any>
  extends Omit<TextFieldProps, 'value' | 'variant' | 'slotProps'>,
    Partial<
      Pick<
        PaginatedDropdownOptionListProps<Entity>,
        | 'optionVariant'
        | 'onSelectOption'
        | 'searchable'
        | 'revalidationKey'
        | 'noOptionsText'
        | 'externallyPaginated'
        | 'limit'
        | 'sortOptions'
        | 'options'
        | 'defaultOptions'
        | 'onChangeSelectedOptions'
        | 'showNoOptionsFoundMessage'
        | 'multiple'
        | 'enableAddNewOption'
        | 'filterOptionBySearchTerm'
      >
    > {
  onChangeSelectedOption?: (selectedOption?: DropdownOption<Entity>) => void;
  disableEmptyOption?: boolean;
  value?: string | string[];
  selectedOption?: DropdownOption<Entity>;
  placeholderOption?: DropdownOption<Entity>;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
  variant?: 'standard' | 'filled' | 'outlined' | 'text';
  showDropdownIcon?: boolean;
  showRichTextValue?: boolean;
  selectedOptionRevalidationKey?: string;
  slotProps?: TextFieldProps['slotProps'] & {
    paginatedDropdownOptionList?: Partial<PaginatedDropdownOptionListProps>;
    selectedOptionPillProps?: Partial<ChipProps>;
  };
}

const BaseDataDropdownField = <Entity,>(
  inProps: DataDropdownFieldProps<Entity>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiDataDropdownField' });
  const {
    className,
    name,
    id,
    value,
    options: optionsProp,
    defaultOptions,
    sortOptions,
    onChange,
    onFocus,
    onBlur,
    slotProps,
    dropdownListMaxHeight,
    optionPaging = true,
    selectedOption,
    onChangeSearchTerm,
    optionVariant,
    sx,
    disabled,
    showClearButton = true,
    searchable = true,
    revalidationKey,
    noOptionsText,
    onSelectOption,
    variant: variantProp,
    label,
    limit,
    externallyPaginated,
    startAdornment,
    endAdornment: endAdornmentProp,
    showDropdownIcon = true,
    enableLoadingState = true,
    showRichTextValue = true,
    placeholderOption,
    onChangeSelectedOptions: onChangeSelectedOptionsProp,
    onChangeSelectedOption,
    multiple: multipleProp,
    selectedOptionRevalidationKey,
    enableAddNewOption = false,
    showNoOptionsFoundMessage,
    filterOptionBySearchTerm,
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
    slotProps?.selectedOptionPillProps ?? {};
  const { ...PaginatedDropdownOptionListPropsRest } =
    slotProps?.paginatedDropdownOptionList ?? {};

  const multiple =
    multipleProp ||
    (slotProps?.select &&
      'multiple' in slotProps.select &&
      slotProps.select.multiple);

  const { palette, breakpoints } = useTheme();

  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const [options, setOptions] = useState<DropdownOption[]>(() => {
    return optionsProp || [];
  });

  const [selectedOptionsRowSpan, setSelectedOptionsRowSpan] = useState(1);

  //#region Refs
  const anchorRef = useRef<HTMLInputElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const searchFieldContainerRef = useRef<HTMLInputElement>(null);
  const asyncOptionPagesMapRef =
    useRef<Map<number, DropdownOption[]>>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const optionsPropRef = useRef(optionsProp);
  optionsPropRef.current = optionsProp;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const defaultOptionsRef = useRef(defaultOptions);
  defaultOptionsRef.current = defaultOptions;

  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;

  const valueRef = useRef(value);
  valueRef.current = value;
  //#endregion

  const stringifiedValue = (() => {
    if (value != null) {
      return JSON.stringify(value);
    }
    return value;
  })();

  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedOptionsWrapperElement, setSelectedOptionsWrapperElement] =
    useState<HTMLDivElement | null>(null);
  const [newOptions, setNewOptions] = useState<DropdownOption[]>([]);

  //#region Selected Options
  const onChangeSelectedOptionsRef = useRef(onChangeSelectedOptionsProp);
  onChangeSelectedOptionsRef.current = onChangeSelectedOptionsProp;
  const onChangeSelectedOptionRef = useRef(onChangeSelectedOption);
  onChangeSelectedOptionRef.current = onChangeSelectedOption;

  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
    () => {
      const selectedValue = value
        ? [...(Array.isArray(value) ? value : [value])]
        : [];

      const selectedOptions = selectedValue
        .map((value) => {
          return [...newOptions, ...(defaultOptions || []), ...options].find(
            ({ value: optionValue }) => value === optionValue
          )!;
        })
        .filter((option) => option);

      const selectedOptionsValues = selectedOptions.map(({ value }) => value);
      if (
        selectedValue.every((value) => selectedOptionsValues.includes(value))
      ) {
        return selectedOptions;
      }

      return [];
    }
  );

  const allOptions = useMemo(() => {
    return [...newOptions, ...options];
  }, [newOptions, options]);

  useEffect(() => {
    if (multiple) {
      onChangeSelectedOptionsRef.current?.(selectedOptions);
    } else {
      onChangeSelectedOptionRef.current?.(selectedOptions[0]);
    }
  }, [multiple, selectedOptions]);
  //#endregion

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
      onChangeRef.current?.(event);
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
    selectedOptionRevalidationKey;
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
          return [
            ...(defaultOptionsRef.current || []),
            ...optionsRef.current,
          ].find(({ value: optionValue }) => value === optionValue)!;
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
      return prevSelectedOptions;
    });
  }, [selectedOption?.value, selectedOptionRevalidationKey, stringifiedValue]);

  const multilineSearchMode = rest.multiline && selectedOptions.length > 0;

  useEffect(() => {
    if (multilineSearchMode && focused) {
      searchFieldRef.current?.focus();
    }
  }, [focused, multilineSearchMode]);

  useEffect(() => {
    if (revalidationKey) {
      setOptions(optionsPropRef.current || []);
    }
  }, [revalidationKey]);

  const { ref: observerRef, inView: isVisible } = useInView();
  useEffect(() => {
    if (!isVisible) {
      setOpen(false);
    }
  }, [focused, isVisible]);

  useEffect(() => {
    if (selectedOptionsWrapperElement) {
      const resizeObserver = new ResizeObserver(() => {
        setSelectedOptionsRowSpan(
          Math.ceil(selectedOptionsWrapperElement.clientHeight / 24)
        );
      });
      resizeObserver.observe(selectedOptionsWrapperElement);
      return () => {
        resizeObserver.unobserve(selectedOptionsWrapperElement);
      };
    } else {
      setSelectedOptionsRowSpan(1);
    }
  }, [selectedOptionsWrapperElement]);

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
    if (
      showRichTextValue &&
      (!focused || multilineSearchMode) &&
      optionsToDisplay.length > 0
    ) {
      return (
        <>
          {multiple ? (
            optionsToDisplay.map(
              ({ selectedOptionLabel, label, icon, value }) => {
                return (
                  <Chip
                    key={value}
                    {...SelectedOptionPillPropsRest}
                    label={getDropdownOptionLabel({
                      label: selectedOptionLabel || label,
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
                      bgcolor: alpha(palette.divider, 0.08),
                      ...SelectedOptionPillPropsSx,
                      [`.${chipClasses.deleteIcon}`]: {
                        pointerEvents: 'all',
                      },
                    }}
                  />
                );
              }
            )
          ) : (
            <Typography
              component="div"
              variant="inherit"
              sx={{
                ...(() => {
                  if (!isTextVariant) {
                    return {
                      fontSize: 14,
                    };
                  }
                })(),
              }}
            >
              {getDropdownOptionLabel({
                label:
                  optionsToDisplay[0].selectedOptionLabel ||
                  optionsToDisplay[0].label,
                icon: optionsToDisplay[0].icon,
              })}
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

  const endAdornment = (
    <>
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
      {(() => {
        if (selectedOptionsElement && !isTextVariant) {
          return (
            <Box
              className={classes.selectedOptionsWrapper}
              ref={(element: HTMLDivElement) => {
                setSelectedOptionsWrapperElement(element);
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                display: 'flex',
                gap: 0.5,
                ...(() => {
                  if (rest.multiline) {
                    return {
                      flexWrap: 'wrap',
                      py: '5px',
                    };
                  }
                  return {
                    height: '100%',
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
                  if (variant === 'standard') {
                    return {
                      pb: '5px',
                    };
                  }
                  if (variant === 'filled') {
                    return {
                      pb: '4px',
                      pl: '12px',
                      alignItems: 'end',
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
              {(() => {
                if (searchable && rest.multiline) {
                  return (
                    <Box
                      ref={searchFieldContainerRef}
                      sx={{
                        flex: 1,
                        minWidth: 100,
                        maxWidth: 300,
                        pointerEvents: 'auto',
                      }}
                    >
                      <TextField
                        variant="standard"
                        fullWidth
                        onFocus={(event) => {
                          event.preventDefault();
                          if (!isSmallScreenSize) {
                            setOpen(true);
                          }
                          setFocused(true);
                          onFocus?.(event);
                        }}
                        onBlur={() => {
                          setFocused(false);
                          if (onBlur) {
                            const event: any = new Event('blur', {
                              bubbles: true,
                            });
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
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                          onChangeSearchTerm?.(event.target.value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            addNewOption();
                          }
                        }}
                        slotProps={{
                          input: {
                            sx: {
                              '&:before': {
                                borderBottomColor: 'transparent',
                              },
                            },
                          },
                          htmlInput: {
                            ref: searchFieldRef,
                          },
                        }}
                        enableLoadingState={false}
                      />
                    </Box>
                  );
                }
              })()}
            </Box>
          );
        }
      })()}
    </>
  );

  const addNewOption = () => {
    if (enableAddNewOption && searchTerm.length > 0) {
      const newOption = {
        label: searchTerm,
        value: searchTerm,
      };
      setNewOptions((prevNewOptions) => {
        return [newOption, ...prevNewOptions];
      });

      const nextSelectedOptions = multiple
        ? [...selectedOptions, newOption]
        : [newOption];
      setSelectedOptions(nextSelectedOptions);
      setSearchTerm('');
      triggerChangeEvent(nextSelectedOptions);
      onSelectOption?.(newOption);
    }
  };

  return (
    <>
      {(() => {
        if (isTextVariant) {
          return (
            <FieldValueDisplay
              ref={mergeRefs([ref, anchorRef, observerRef])}
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
              sx={[
                ...(Array.isArray(sx) ? sx : [sx]),
                {
                  display: 'inline-block',
                },
              ]}
            />
          );
        }
        return (
          <TextField
            ref={ref}
            onFocus={(event) => {
              if (!multilineSearchMode && isVisible) {
                event.preventDefault();
                if (!isSmallScreenSize) {
                  setOpen(true);
                }
                setFocused(true);
                onFocus?.(event);
              }
            }}
            onBlur={() => {
              if (!multilineSearchMode && isVisible) {
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
              }
            }}
            onChange={(event) => {
              if (searchable) {
                setSearchTerm(event.target.value);
                onChangeSearchTerm?.(event.target.value);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addNewOption();
              }
            }}
            slotProps={merge(
              {
                input: {
                  endAdornment,
                  ...(() => {
                    const props: InputProps = {};
                    if (selectedOptions.length > 0) {
                      props.placeholder = '';
                    }
                    return props;
                  })(),
                  readOnly: !searchable || isSmallScreenSize,
                  onClick: () => {
                    if (!disabled) {
                      if (rest.multiline) {
                        searchFieldRef.current?.focus();
                      }
                      setOpen(true);
                    }
                  },
                  ref: mergeRefs([anchorRef, observerRef]),
                  sx: {
                    ...(() => {
                      if (rest.multiline) {
                        return {
                          alignItems: 'start',
                        };
                      }
                    })(),
                    ...(() => {
                      if (
                        searchable &&
                        showRichTextValue &&
                        !focused &&
                        (selectedOptionDisplayString.length > 0 ||
                          placeholderOption)
                      ) {
                        return {
                          [`&>.${inputBaseClasses.input}`]: {
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                          },
                        };
                      }
                    })(),
                    ...(() => {
                      if (multilineSearchMode) {
                        return {
                          [`&>.${inputBaseClasses.input}`]: {
                            visibility: 'hidden',
                          },
                        };
                      }
                    })(),
                  },
                },
                htmlInput: {
                  ...(() => {
                    if (!multilineSearchMode) {
                      return {
                        ref: searchFieldRef,
                      };
                    }
                  })(),
                },
              },
              omit(slotProps, [
                'paginatedDropdownOptionList',
                'selectedOptionPillProps',
              ])
            )}
            value={(() => {
              if (multilineSearchMode) {
                return selectedOptionDisplayString;
              }
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
            showClearButton={!focused}
            {...rest}
            {...(() => {
              if (rest.multiline) {
                return {
                  rows: selectedOptionsRowSpan,
                };
              }
            })()}
            sx={[
              {
                '& .data-dropdown-input-clear-button': {
                  visibility: 'hidden',
                },
                '&:hover .data-dropdown-input-clear-button': {
                  visibility: 'visible',
                },
                [`& .${classes.selectedOptionsWrapper}`]: {
                  width: 'calc(100% - 40px)',
                },
                ...(() => {
                  if (showClearButton) {
                    if (rest.multiline) {
                      return {
                        [`& .${classes.selectedOptionsWrapper}`]: {
                          width: 'calc(100% - 72px)',
                        },
                      };
                    }
                    return {
                      [`&:hover .${classes.selectedOptionsWrapper}`]: {
                        width: 'calc(100% - 72px)',
                      },
                    };
                  }
                })(),
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
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
                  searchable: searchable ?? true,
                };
              }
            })()}
            {...{
              maxHeight: dropdownListMaxHeight,
              ...(() => {
                if (isSmallScreenSize) {
                  return {
                    searchable: searchable ?? true,
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
              options: allOptions,
              defaultOptions,
              selectedOptions,
              revalidationKey,
              noOptionsText,
              externallyPaginated,
              showNoOptionsFoundMessage,
              limit,
              sortOptions,
              filterOptionBySearchTerm,
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
            onChangeSelectedOptions={(selectedOptions) => {
              //#region Find New Options
              const selectedNewOptions = selectedOptions.filter(
                ({ value }) =>
                  !allOptions.some(
                    ({ value: optionValue }) => optionValue === value
                  )
              );
              if (selectedNewOptions.length > 0) {
                setNewOptions((prevNewOptions) => {
                  return [...selectedNewOptions, ...prevNewOptions];
                });
              }
              //#endregion
              setSearchTerm('');
              setSelectedOptions(selectedOptions);
              triggerChangeEvent(selectedOptions);
              if (rest.multiline) {
                searchFieldRef.current?.focus();
              } else {
                searchFieldRef.current?.blur();
              }
            }}
            asyncOptionPagesMap={asyncOptionPagesMapRef.current}
            onChangeAsyncOptionPagesMap={(asyncOptionPagesMap) => {
              asyncOptionPagesMapRef.current = asyncOptionPagesMap;
            }}
            enableAddNewOption={
              enableAddNewOption &&
              !allOptions.some(({ label, searchableLabel }) => {
                if (typeof label === 'string') {
                  return (
                    label.trim().toLowerCase() ===
                    searchTerm.trim().toLowerCase()
                  );
                }
                if (searchableLabel) {
                  return (
                    searchableLabel.trim().toLowerCase() ===
                    searchTerm.trim().toLowerCase()
                  );
                }
                return false;
              })
            }
            newOptionLabel={searchTerm}
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
            popperOptions={{
              strategy: 'fixed',
            }}
            sx={{
              zIndex: 9999,
            }}
          >
            {({ TransitionProps }) => {
              return (
                <Grow {...TransitionProps} style={{ transformOrigin: '0 0 0' }}>
                  <Box>
                    <ClickAwayListener
                      onClickAway={(event) => {
                        if (
                          anchorRef.current ||
                          searchFieldContainerRef.current
                        ) {
                          setOpen(
                            Boolean(
                              anchorRef.current &&
                                isDescendant(
                                  anchorRef.current,
                                  event.target as any
                                )
                            ) ||
                              Boolean(
                                searchFieldContainerRef.current &&
                                  isDescendant(
                                    searchFieldContainerRef.current,
                                    event.target as any
                                  )
                              )
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
