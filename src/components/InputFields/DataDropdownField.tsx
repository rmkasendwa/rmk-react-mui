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
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoadingProvider } from '../../contexts';
import { useAPIDataContext, useAPIService, useFormikValue } from '../../hooks';
import { IAPIFunction } from '../../interfaces';
import ReloadIconButton from '../ReloadIconButton';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { ITextFieldProps } from './TextField';

export interface IDropdownOption {
  value: string | number;
  label: ReactNode;
  searchableLabel?: string;
}

export interface IDataDropdownFieldProps extends ITextFieldProps {
  disableEmptyOption?: boolean;
  getDropdownEntities?: IAPIFunction;
  getDropdownOptions?: (options: any[]) => IDropdownOption[];
  options?: IDropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
  value?: string | string[];
  selectedOption?: IDropdownOption;
}

const DROPDOWN_MENU_MAX_HEIGHT = 200;
const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;
const DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER = Math.ceil(
  DROPDOWN_MENU_MAX_HEIGHT / DEFAULT_DROPDOWN_OPTION_HEIGHT
);

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

  const [limit, setLimit] = useState(DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const isTouchedRef = useRef(false);

  const [options, setOptions] = useState<IDropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IDropdownOption[]>([]);
  const [missingOptionValues, setMissingOptionValues] = useState<
    (string | number)[]
  >([]);

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
    setOpen(false);
  };

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

  const filteredOptions = useMemo(() => {
    if (searchTerm && searchTerm !== selectedOptionDisplayString) {
      const searchFilterTerms = searchTerm
        .split(',')
        .map((string) => string.trim().toLowerCase());
      return options.filter(({ label }) => {
        return (
          typeof label === 'string' &&
          searchFilterTerms.some((searchFilterTerm) => {
            return label.toLowerCase().match(searchFilterTerm);
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

  const displayOptions = filteredOptions.slice(0, limit);

  const displayOverlay =
    selectedOptions.length > 0 &&
    !SelectProps?.multiple &&
    !['string', 'number'].includes(typeof selectedOptions[0].label);

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
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box>
                <ClickAwayListener onClickAway={handleClose}>
                  <Card>
                    <Box
                      onScroll={(event: any) => {
                        const { scrollTop } = event.target;
                        const topOptionCount = Math.floor(
                          scrollTop / DEFAULT_DROPDOWN_OPTION_HEIGHT
                        );
                        setLimit(
                          topOptionCount + DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER
                        );
                      }}
                      sx={{
                        minWidth: anchorRef.current
                          ? anchorRef.current.offsetWidth
                          : 200,
                        maxHeight: DROPDOWN_MENU_MAX_HEIGHT,
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                      }}
                    >
                      <Box
                        component="ul"
                        sx={{
                          m: 0,
                          p: 0,
                          minHeight:
                            filteredOptions.length *
                            DEFAULT_DROPDOWN_OPTION_HEIGHT,
                        }}
                      >
                        {displayOptions.length > 0 ? (
                          displayOptions.map((option) => {
                            const { value, label } = option;
                            return (
                              <MenuItem
                                value={value}
                                key={value}
                                onClick={() => {
                                  if (SelectProps?.multiple) {
                                    setSelectedOptions((prevOptions) => {
                                      const selectedOption = prevOptions.find(
                                        ({ value: selectedOptionValue }) => {
                                          return selectedOptionValue === value;
                                        }
                                      );
                                      if (selectedOption) {
                                        prevOptions.splice(
                                          prevOptions.indexOf(selectedOption),
                                          1
                                        );
                                      } else {
                                        prevOptions.push(option);
                                      }
                                      return [...prevOptions];
                                    });
                                  } else {
                                    setSelectedOptions([option]);
                                    handleClose();
                                  }
                                }}
                                selected={selectedOptions
                                  .map(({ value }) => value)
                                  .includes(value)}
                                sx={{
                                  minHeight: DEFAULT_DROPDOWN_OPTION_HEIGHT,
                                }}
                              >
                                {label}
                              </MenuItem>
                            );
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
