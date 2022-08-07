import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  IconButton,
  Tooltip,
  Typography,
  alpha,
  inputBaseClasses,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoadingProvider } from '../../contexts/LoadingContext';
import { useAPIDataContext, useAPIService } from '../../hooks/Utils';
import { TAPIFunction } from '../../interfaces/Utils';
import PaginatedDropdownOptionList, {
  IDropdownOption,
  IPaginatedDropdownOptionListProps,
} from '../PaginatedDropdownOptionList';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { ITextFieldProps } from './TextField';

export interface IDataDropdownFieldProps
  extends Omit<ITextFieldProps, 'value'>,
    Pick<IPaginatedDropdownOptionListProps, 'optionVariant'> {
  disableEmptyOption?: boolean;
  getDropdownEntities?: TAPIFunction;
  filterDropdownEntities?: (entities: any[]) => any[];
  getDropdownOptions?: (options: any[]) => IDropdownOption[];
  options?: IDropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
  value?: string | string[];
  selectedOption?: IDropdownOption;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
  onChangeSearchTerm?: (searchTerm: string) => void;
}

export const DataDropdownField = forwardRef<
  HTMLDivElement,
  IDataDropdownFieldProps
>(function DataDropdownField(
  {
    SelectProps,
    getDropdownEntities,
    filterDropdownEntities,
    getDropdownOptions,
    name,
    id,
    value,
    dataKey,
    options: propOptions,
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
    ...rest
  },
  ref
) {
  const multiple = SelectProps?.multiple;
  const { preferStale } = useAPIDataContext();
  const { palette } = useTheme();

  const {
    load,
    loaded,
    loading,
    record: dropdownEntities,
    errorMessage,
  } = useAPIService<any[]>([], dataKey);

  const anchorRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [options, setOptions] = useState<IDropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IDropdownOption[]>([]);
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
    (selectedOptions: IDropdownOption[]) => {
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
      onChange && onChange(event);
    },
    [multiple, id, name, onChange]
  );

  const loadOptions = useCallback(
    async (reloadOptions = false) => {
      if (
        !loading &&
        (!loaded || reloadOptions) &&
        (!preferStale || options.length <= 0 || reloadOptions) &&
        getDropdownEntities
      ) {
        load(async () => {
          const entities = await getDropdownEntities();
          if (filterDropdownEntities) {
            return filterDropdownEntities(entities);
          }
          return entities;
        });
      }
    },
    [
      filterDropdownEntities,
      getDropdownEntities,
      load,
      loaded,
      loading,
      options.length,
      preferStale,
    ]
  );

  const selectedOptionDisplayString = useMemo(() => {
    return selectedOptions
      .filter(({ label, searchableLabel }) => {
        return typeof label === 'string' || searchableLabel;
      })
      .map(({ label, searchableLabel }) => searchableLabel || label)
      .join(', ');
  }, [selectedOptions]);

  const handleClose = () => setOpen(false);

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
      options.sort(
        (
          { label: aLabel, searchableLabel: aSearchableLabel },
          { label: bLabel, searchableLabel: bSearchableLabel }
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
    }
  }, [options, sortOptions]);

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
      if (prevSelectedOptions.join() !== nextSelectedOptions.join()) {
        return nextSelectedOptions;
      }
      return prevSelectedOptions;
    });
  }, [options, value]);

  useEffect(() => {
    if (selectedOption) {
      const existingOption = options.find(
        ({ value }) => value === selectedOption.value
      );
      if (!existingOption) {
        setOptions([...options, selectedOption]);
      }
      setSelectedOptions([selectedOption]);
    }
  }, [options, selectedOption]);

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

  const textField = (
    <TextField
      ref={ref}
      onClick={() => {
        setTimeout(() => setOpen(true), 200);
        loadOptions();
      }}
      onFocus={(event) => {
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
        setSearchTerm(event.target.value);
        onChangeSearchTerm && onChangeSearchTerm(event.target.value);
      }}
      InputProps={{
        endAdornment: (
          <>
            {selectedOptions.length > 0 && (
              <Tooltip title="Clear">
                <IconButton
                  className="data-dropdown-input-clear-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSearchTerm('');
                    const options: IDropdownOption[] = [];
                    setSelectedOptions(options);
                    triggerChangeEvent(options);
                  }}
                  sx={{ p: 0.4 }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
            <ExpandMoreIcon />
          </>
        ),
        ...InputProps,
        ref: anchorRef,
      }}
      value={(() => {
        if (focused) {
          return searchTerm;
        } else {
          return selectedOptionDisplayString;
        }
      })()}
      {...rest}
      {...errorProps}
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

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          [`& .${inputBaseClasses.input}`]: (() => {
            if (!focused && selectedOptionDisplayString.length > 0) {
              return { color: 'transparent' };
            }
            return {};
          })(),
          '&>.data-dropdown-field-selected-option-wrapper': {
            width: 'calc(100% - 40px)',
          },
          '&:hover>.data-dropdown-field-selected-option-wrapper': {
            width: 'calc(100% - 72px)',
          },
        }}
      >
        {textField}
        {!focused && selectedOptions.length > 0 ? (
          <Box
            className="data-dropdown-field-selected-option-wrapper"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '100%',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              pl: '14px',
              whiteSpace: 'nowrap',
              gap: 0.5,
              overflow: 'hidden',
            }}
          >
            {multiple ? (
              selectedOptions.map(({ label, value }) => {
                return (
                  <Box
                    key={value}
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
                    }}
                  >
                    {label}
                  </Box>
                );
              })
            ) : (
              <Typography
                sx={{
                  fontSize: 14,
                }}
              >
                {selectedOptions[0]?.label}
              </Typography>
            )}
          </Box>
        ) : null}
      </Box>
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
                  <PaginatedDropdownOptionList
                    options={filteredOptions}
                    minWidth={
                      anchorRef.current
                        ? anchorRef.current.offsetWidth
                        : undefined
                    }
                    maxHeight={dropdownListMaxHeight}
                    paging={optionPaging}
                    onClose={handleClose}
                    loadOptions={
                      getDropdownEntities ? () => loadOptions(true) : undefined
                    }
                    onChangeSelectedOption={triggerChangeEvent}
                    {...{
                      selectedOptions,
                      setSelectedOptions,
                      loading,
                      optionVariant,
                      multiple,
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
