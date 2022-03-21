import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  ClickAwayListener,
  Grow,
  MenuItem,
  Popper,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormikContext } from 'formik';
import {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoadingProvider } from '../../contexts';
import { useAPIDataContext, useAPIService, useFormikValue } from '../../hooks';
import { IAPIFunction } from '../../interfaces';
import { IDropdownOption } from '../PaginatedDropdownOptionList';
import ReloadIconButton from '../ReloadIconButton';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { ITextFieldProps } from './TextField';

export interface IDataDropdownFieldProps extends ITextFieldProps {
  disableEmptyOption?: boolean;
  getDropdownEntities?: IAPIFunction;
  getDropdownOptions?: (options: any[]) => IDropdownOption[];
  options?: IDropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
  value?: string | string[];
  selectedOption?: IDropdownOption;
  menuMaxHeight?: number;
  optionPaging?: boolean;
}

const DEFAULT_DROPDOWN_MENU_MAX_HEIGHT = 200;
const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;

export const DataDropdownField: FC<IDataDropdownFieldProps> = ({
  SelectProps,
  getDropdownEntities,
  getDropdownOptions,
  name,
  value,
  dataKey,
  options: propOptions,
  sortOptions = false,
  onChange,
  onBlur,
  error,
  helperText,
  InputProps,
  menuMaxHeight = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
  optionPaging = true,
  selectedOption,
  ...rest
}) => {
  value = useFormikValue({ value, name });
  const {
    handleBlur: formikHandleBlur,
    handleChange: formikHandleChange,
    touched,
    errors,
  } = (useFormikContext() as any) || {};

  const { preferStale } = useAPIDataContext();

  const theme = useTheme();

  const {
    load,
    loaded,
    loading,
    record: dropdownEntities,
    errorMessage,
  } = useAPIService<any[]>([], dataKey);

  const [limit, setLimit] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const scrollableDropdownWrapperRef = useRef<HTMLInputElement>(null);
  const isTouchedRef = useRef(false);

  const [options, setOptions] = useState<IDropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IDropdownOption[]>([]);
  const [missingOptionValues, setMissingOptionValues] = useState<
    (string | number)[]
  >([]);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  );

  const loadOptions = useCallback(
    async (reloadOptions = false) => {
      if (
        !loading &&
        (!loaded || reloadOptions) &&
        (!preferStale || options.length <= 0 || reloadOptions) &&
        getDropdownEntities
      ) {
        load(getDropdownEntities);
      }
    },
    [getDropdownEntities, load, loaded, loading, options.length, preferStale]
  );

  const selectedOptionDisplayString = selectedOptions
    .filter(({ label, searchableLabel }) => {
      return typeof label === 'string' || searchableLabel;
    })
    .map(({ label, searchableLabel }) => searchableLabel || label)
    .join(', ');

  const selectedOptionValue = useMemo(() => {
    if (SelectProps?.multiple) {
      return selectedOptions.map(({ value }) => value);
    }
    return selectedOptions[0]?.value;
  }, [SelectProps?.multiple, selectedOptions]);

  const handleBlur = () => {
    if (onBlur || formikHandleBlur) {
      const event: any = new Event('blur', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          value: selectedOptionValue,
        },
      });
      (onBlur || formikHandleBlur)(event);
    }
  };

  const handleChange = useCallback(() => {
    if (onChange || formikHandleChange) {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          value: selectedOptionValue,
        },
      });
      (onChange || formikHandleChange)(event);
    }
  }, [formikHandleChange, name, onChange, selectedOptionValue]);

  const handleClose = () => {
    isTouchedRef.current = true;
    setFocusedOptionIndex(null);
    setOpen(false);
  };

  const selectOption = useCallback(
    (option: IDropdownOption) => {
      const { value } = option;
      if (SelectProps?.multiple) {
        setSelectedOptions((prevOptions) => {
          const selectedOption = prevOptions.find(
            ({ value: selectedOptionValue }) => {
              return selectedOptionValue === value;
            }
          );
          if (selectedOption) {
            prevOptions.splice(prevOptions.indexOf(selectedOption), 1);
          } else {
            prevOptions.push(option);
          }
          return [...prevOptions];
        });
      } else {
        setSelectedOptions([option]);
        handleClose();
      }
    },
    [SelectProps?.multiple]
  );

  useEffect(() => {
    setLimit(Math.ceil(menuMaxHeight / DEFAULT_DROPDOWN_OPTION_HEIGHT));
  }, [menuMaxHeight]);

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
    if (propOptions) {
      setOptions((prevPropOptions) => {
        if (
          prevPropOptions.map(({ value }) => value).join('') !==
          propOptions.map(({ value }) => value).join('')
        ) {
          return propOptions;
        }
        return prevPropOptions;
      });
    } else {
      setOptions(
        getDropdownOptions
          ? getDropdownOptions(dropdownEntities)
          : dropdownEntities
      );
    }
  }, [dropdownEntities, getDropdownOptions, propOptions, setOptions]);

  useEffect(() => {
    if (sortOptions) {
      options.sort(({ label: aLabel }, { label: bLabel }) => {
        if (typeof aLabel === 'string' && typeof bLabel === 'string') {
          return aLabel.localeCompare(bLabel);
        }
        return 0;
      });
    }
  }, [options, sortOptions]);

  useEffect(() => {
    setSearchTerm(selectedOptionDisplayString);
  }, [selectedOptionDisplayString]);

  useEffect(() => {
    if (isTouchedRef.current === true) {
      handleChange();
    }
  }, [handleChange, selectedOptions]);

  useEffect(() => {
    const fieldValues = Array.isArray(value) ? value : [value];
    setSelectedOptions(
      fieldValues
        .map((value) => {
          return options.find(
            ({ value: optionValue }) => value === optionValue
          )!;
        })
        .filter((option) => option)
    );
  }, [options, value]);

  useEffect(() => {
    if (open) {
      const keydownCallback = (event: KeyboardEvent) => {
        const nextFocusedOptionIndex = (() => {
          switch (event.key) {
            case 'ArrowUp':
              if (focusedOptionIndex != null) {
                return (
                  (!!focusedOptionIndex ? focusedOptionIndex : options.length) -
                  1
                );
              }
              return options.length - 1;
            case 'ArrowDown':
              if (focusedOptionIndex != null) {
                return (focusedOptionIndex + 1) % options.length;
              }
              return 0;
            case 'Enter':
              if (focusedOptionIndex) {
                selectOption(options[focusedOptionIndex]);
              }
              break;
          }
        })();
        if (nextFocusedOptionIndex != null) {
          setFocusedOptionIndex(nextFocusedOptionIndex);
          if (scrollableDropdownWrapperRef.current) {
            if (nextFocusedOptionIndex > limit - 1) {
              scrollableDropdownWrapperRef.current.scrollTop =
                (nextFocusedOptionIndex + 1) * DEFAULT_DROPDOWN_OPTION_HEIGHT -
                menuMaxHeight;
            } else {
              const { scrollTop } = scrollableDropdownWrapperRef.current;
              const nextFocusedOptionScrollTop =
                (nextFocusedOptionIndex + 1) * DEFAULT_DROPDOWN_OPTION_HEIGHT;
              if (nextFocusedOptionScrollTop <= scrollTop) {
                scrollableDropdownWrapperRef.current.scrollTop =
                  nextFocusedOptionScrollTop - DEFAULT_DROPDOWN_OPTION_HEIGHT;
              }
            }
          }
        }
      };
      window.addEventListener('keydown', keydownCallback);
      return () => {
        window.removeEventListener('keydown', keydownCallback);
      };
    }
  }, [
    focusedOptionIndex,
    limit,
    menuMaxHeight,
    open,
    options,
    options.length,
    selectOption,
  ]);

  useEffect(() => {
    if (selectedOption) {
      const existingOption = options.find(
        ({ value }) => value === selectedOption.value
      );
      if (!existingOption) {
        options.push(selectedOption);
      }
      selectOption(selectedOption);
    }
  }, [options, selectOption, selectedOption]);

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
    return (
      <LoadingProvider value={{ loading, errorMessage }}>
        <TextField {...rest} />
      </LoadingProvider>
    );
  }

  const errorProps: Pick<ITextFieldProps, 'error' | 'helperText'> = {};
  if (errorMessage) {
    errorProps.error = true;
    errorProps.helperText = (
      <RetryErrorMessage message={errorMessage} retry={loadOptions} />
    );
  }

  const displayOptions = optionPaging
    ? filteredOptions.slice(0, limit)
    : filteredOptions;

  const displayOverlay =
    selectedOptions.length > 0 &&
    !SelectProps?.multiple &&
    !['string', 'number'].includes(typeof selectedOptions[0].label) &&
    !selectedOptions[0].searchableLabel;

  const textField = (
    <TextField
      onClick={() => {
        setTimeout(() => setOpen(true), 200);
        loadOptions();
      }}
      onBlur={() => {
        isTouchedRef.current = true;
        handleBlur();
      }}
      onChange={(event) => {
        setSearchTerm(event.target.value);
      }}
      InputProps={{
        endAdornment: <ExpandMoreIcon />,
        ...InputProps,
        ref: anchorRef,
      }}
      value={searchTerm}
      error={
        error ??
        (() => {
          if (errors && touched && name && touched[name]) {
            return Boolean(errors[name]);
          }
        })()
      }
      helperText={
        helperText ??
        (() => {
          if (errors && touched && name && touched[name]) {
            return errors[name];
          }
        })()
      }
      {...rest}
      {...errorProps}
    />
  );

  return (
    <>
      {displayOverlay ? (
        <Box sx={{ position: 'relative', '& input': { visibility: 'hidden' } }}>
          {textField}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '100%',
              width: '100%',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              pl: 1,
            }}
          >
            {selectedOptions[0].label}
          </Box>
        </Box>
      ) : (
        textField
      )}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
        ref={(element) => {
          if (element) {
            element.style.zIndex = '1400';
          }
        }}
        tabIndex={-1}
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box tabIndex={-1}>
                <ClickAwayListener onClickAway={handleClose}>
                  <Card tabIndex={-1}>
                    <Box
                      ref={scrollableDropdownWrapperRef}
                      onScroll={(event: any) => {
                        if (optionPaging) {
                          const { scrollTop } = event.target;
                          const topOptionCount = Math.floor(
                            scrollTop / DEFAULT_DROPDOWN_OPTION_HEIGHT
                          );
                          setLimit(
                            topOptionCount +
                              Math.ceil(
                                menuMaxHeight / DEFAULT_DROPDOWN_OPTION_HEIGHT
                              )
                          );
                        }
                      }}
                      sx={{
                        minWidth: anchorRef.current
                          ? anchorRef.current.offsetWidth
                          : 200,
                        maxHeight: menuMaxHeight,
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
                          minHeight: optionPaging
                            ? filteredOptions.length *
                              DEFAULT_DROPDOWN_OPTION_HEIGHT
                            : undefined,
                        }}
                        onClick={() => {
                          if (!SelectProps?.multiple) {
                            handleClose();
                          }
                        }}
                        tabIndex={-1}
                      >
                        {displayOptions.length > 0 ? (
                          displayOptions.map((option, index) => {
                            const {
                              value,
                              label,
                              selectable = true,
                              isDropdownOption = true,
                              isDropdownOptionWrapped = true,
                            } = option;
                            if (isDropdownOption && isDropdownOptionWrapped) {
                              const classNames = [];
                              const isFocused = index === focusedOptionIndex;
                              if (isFocused) {
                                classNames.push('Mui-focusVisible');
                              }
                              return (
                                <MenuItem
                                  className={classNames.join(' ')}
                                  value={value}
                                  key={value}
                                  onClick={
                                    selectable
                                      ? () => {
                                          selectOption(option);
                                        }
                                      : undefined
                                  }
                                  selected={selectedOptions
                                    .map(({ value }) => value)
                                    .includes(value)}
                                  sx={{
                                    minHeight: DEFAULT_DROPDOWN_OPTION_HEIGHT,
                                    fontSize: 14,
                                    lineHeight: `24px`,
                                    p: 0,
                                  }}
                                  tabIndex={isFocused ? 0 : -1}
                                >
                                  <Box
                                    sx={{
                                      py: 0.75,
                                      px: 2,
                                      width: `100%`,
                                    }}
                                  >
                                    {label}
                                  </Box>
                                </MenuItem>
                              );
                            }
                            return <Fragment key={value}>{label}</Fragment>;
                          })
                        ) : (
                          <MenuItem disabled>
                            <Typography
                              variant="body2"
                              color={theme.palette.error.main}
                            >
                              No options found
                            </Typography>
                          </MenuItem>
                        )}
                      </Box>
                    </Box>
                    {getDropdownEntities && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          py: 1,
                        }}
                      >
                        <ReloadIconButton
                          load={() => loadOptions(true)}
                          {...{ loading }}
                        />
                      </Box>
                    )}
                  </Card>
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
};

export default DataDropdownField;
