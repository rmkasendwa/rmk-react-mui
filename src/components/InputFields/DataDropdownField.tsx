import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
} from '../PaginatedDropdownOptionList';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { ITextFieldProps } from './TextField';

export interface IDataDropdownFieldProps extends ITextFieldProps {
  disableEmptyOption?: boolean;
  getDropdownEntities?: TAPIFunction;
  getDropdownOptions?: (options: any[]) => IDropdownOption[];
  options?: IDropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
  value?: string | string[];
  selectedOption?: IDropdownOption;
  dropdownListMaxHeight?: number;
  optionPaging?: boolean;
}

export const DataDropdownField = forwardRef<
  HTMLDivElement,
  IDataDropdownFieldProps
>(function DataDropdownField(
  {
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
    InputProps,
    dropdownListMaxHeight,
    optionPaging = true,
    selectedOption,
    ...rest
  },
  ref
) {
  const { preferStale } = useAPIDataContext();

  const {
    load,
    loaded,
    loading,
    record: dropdownEntities,
    errorMessage,
  } = useAPIService<any[]>([], dataKey);

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
    if (onBlur) {
      const event: any = new Event('blur', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          value: selectedOptionValue,
        },
      });
      onBlur(event);
    }
  };

  const handleChange = useCallback(() => {
    if (onChange) {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          value: selectedOptionValue,
        },
      });
      onChange(event);
    }
  }, [name, onChange, selectedOptionValue]);

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

  const displayOverlay =
    selectedOptions.length > 0 &&
    !SelectProps?.multiple &&
    !['string', 'number'].includes(typeof selectedOptions[0].label) &&
    !selectedOptions[0].searchableLabel;

  const textField = (
    <TextField
      ref={ref}
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
                  <PaginatedDropdownOptionList
                    options={filteredOptions}
                    minWidth={
                      anchorRef.current
                        ? anchorRef.current.offsetWidth
                        : undefined
                    }
                    maxHeight={dropdownListMaxHeight}
                    paging={optionPaging}
                    multiple={SelectProps?.multiple}
                    onClose={handleClose}
                    loading={loading}
                    loadOptions={
                      getDropdownEntities ? () => loadOptions(true) : undefined
                    }
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
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
