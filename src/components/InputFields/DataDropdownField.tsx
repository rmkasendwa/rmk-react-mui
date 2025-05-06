'use client';
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
  useEffect,
  useRef,
  useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

import { useLoadingContext } from '../../contexts/LoadingContext';
import { DropdownOptionValue } from '../../models/Utils';
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
        | 'noOptionsText'
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
  value?: DropdownOptionValue | DropdownOptionValue[];
  selectedOption?: DropdownOption<Entity>;
  placeholderOption?: DropdownOption<Entity>;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
  variant?: 'standard' | 'filled' | 'outlined' | 'text';
  showDropdownIcon?: boolean;
  showRichTextValue?: boolean;
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
    options,
    defaultOptions,
    sortOptions,
    onChange,
    onFocus,
    onBlur,
    slotProps,
    dropdownListMaxHeight,
    optionPaging = true,
    onChangeSearchTerm,
    optionVariant,
    sx,
    disabled,
    showClearButton = true,
    searchable = true,
    noOptionsText,
    onSelectOption,
    variant: variantProp,
    label,
    startAdornment,
    endAdornment: endAdornmentProp,
    showDropdownIcon = true,
    enableLoadingState = true,
    showRichTextValue = true,
    placeholderOption,
    onChangeSelectedOptions,
    onChangeSelectedOption,
    multiple: multipleProp,
    enableAddNewOption = false,
    showNoOptionsFoundMessage,
    filterOptionBySearchTerm,
    multiline,
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

  const [selectedOptionsRowSpan, setSelectedOptionsRowSpan] = useState(1);

  //#region Refs
  const anchorRef = useRef<HTMLInputElement>(null);
  const searchFieldContainerRef = useRef<HTMLInputElement>(null);
  //#endregion

  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [htmlInputElement, setHtmlInputElement] =
    useState<HTMLInputElement | null>(null);
  const [multilineSearchInputElement, setMultilineSearchInputElement] =
    useState<HTMLInputElement | null>(null);
  const [selectedOptionsWrapperElement, setSelectedOptionsWrapperElement] =
    useState<HTMLDivElement | null>(null);

  //#region Selected Options
  const [selectedOptionsValue, setSelectedOptionsValue] = useState(() => {
    if (value) {
      return Array.isArray(value) ? value : [value];
    }
    return [];
  });
  const stringifiedValue = JSON.stringify(value);
  useEffect(() => {
    const value: DropdownOptionValue | DropdownOptionValue[] =
      stringifiedValue != null ? JSON.parse(stringifiedValue) : [];
    setSelectedOptionsValue(Array.isArray(value) ? value : [value]);
  }, [stringifiedValue]);

  const allOptions = [...(defaultOptions ?? []), ...(options ?? [])];

  const triggerChangeEvent = (selectedOptionsValue: DropdownOptionValue[]) => {
    const event: any = new Event('blur', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: {
        id,
        name,
        value: (() => {
          if (multiple) {
            return selectedOptionsValue;
          }
          return selectedOptionsValue[0];
        })(),
      },
    });
    onChange?.(event);
  };

  const updateSelectedOptionsValue = (
    selectedOptionsValue: DropdownOptionValue[]
  ) => {
    setSelectedOptionsValue(selectedOptionsValue);
    const selectedOptions = allOptions.filter(({ value }) =>
      selectedOptionsValue.includes(value)
    );
    if (multiple) {
      onChangeSelectedOptions?.(selectedOptions);
    } else {
      onChangeSelectedOption?.(selectedOptions[0]);
    }
    triggerChangeEvent(selectedOptionsValue);
  };

  const selectedOptions = allOptions.filter(({ value }) =>
    selectedOptionsValue.includes(value)
  );

  const selectedOptionDisplayString = selectedOptions
    .filter(({ label, searchableLabel }) => {
      return typeof label === 'string' || typeof searchableLabel === 'string';
    })
    .map(({ label, searchableLabel }) => {
      return String(searchableLabel || label);
    })
    .join(', ');
  //#endregion

  const multilineSearchMode = multiline && selectedOptionsValue.length > 0;

  useEffect(() => {
    if (multilineSearchMode && focused) {
      multilineSearchInputElement?.focus();
    }
  }, [focused, multilineSearchInputElement, multilineSearchMode]);

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

  const { locked } = useLoadingContext();

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
                      updateSelectedOptionsValue(
                        selectedOptionsValue.filter((prevValue) => {
                          return prevValue !== value;
                        })
                      );
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

  if (enableLoadingState && locked) {
    return (
      <FieldValueDisplay
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
                    if (multiline) {
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
        selectedOptionsValue.length > 0 &&
        !disabled &&
        !focused ? (
          <Tooltip title="Clear">
            <IconButton
              className="data-dropdown-input-clear-button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                setSearchTerm('');
                updateSelectedOptionsValue([]);
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
                  if (multiline) {
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
                if (searchable && multiline) {
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
                                value: (() => {
                                  if (multiple) {
                                    return selectedOptionsValue;
                                  }
                                  return selectedOptionsValue[0];
                                })(),
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
                        slotProps={{
                          input: {
                            sx: {
                              '&:before': {
                                borderBottomColor: 'transparent',
                              },
                            },
                          },
                          htmlInput: {
                            ref: setMultilineSearchInputElement,
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
                slotProps: {
                  containerGrid: {
                    sx: {
                      mt: 0,
                    },
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
                              if (multiline) {
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
                      value: (() => {
                        if (multiple) {
                          return selectedOptionsValue;
                        }
                        return selectedOptionsValue[0];
                      })(),
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
                      if (multiline) {
                        multilineSearchInputElement?.focus();
                      }
                      setOpen(true);
                    }
                  },
                  ref: mergeRefs([anchorRef, observerRef]),
                  sx: {
                    ...(() => {
                      if (multiline) {
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
                  ...slotProps?.htmlInput,
                  ref: mergeRefs([
                    setHtmlInputElement,
                    (() => {
                      if (
                        slotProps?.htmlInput &&
                        'ref' in slotProps?.htmlInput
                      ) {
                        return slotProps?.htmlInput?.ref;
                      }
                      return undefined;
                    })(),
                  ]),
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
              if (multiline) {
                return { multiline, rows: selectedOptionsRowSpan };
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
                    if (multiline) {
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
              noOptionsText,
              showNoOptionsFoundMessage,
              sortOptions,
              filterOptionBySearchTerm,
            }}
            keyboardFocusElement={htmlInputElement}
            onChangeSearchTerm={(searchTerm) => {
              setSearchTerm(searchTerm);
            }}
            minWidth={
              anchorRef.current ? anchorRef.current.offsetWidth : undefined
            }
            onClose={() => {
              setOpen(false);
            }}
            onChangeSelectedOptions={(selectedOptions) => {
              setSearchTerm('');
              updateSelectedOptionsValue(
                selectedOptions.map(({ value }) => value)
              );
              if (multiline) {
                multilineSearchInputElement?.focus();
              } else {
                htmlInputElement?.blur();
              }
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
