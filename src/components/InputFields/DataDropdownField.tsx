import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem } from '@mui/material';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { LoadingProvider } from '../../contexts';
import { useAPIService, useFormikValue } from '../../hooks';
import { IAPIFunction } from '../../interfaces';
import ReloadIconButton from '../ReloadIconButton';
import RetryErrorMessage from '../RetryErrorMessage';
import TextField, { ITextFieldProps } from './TextField';

interface IDropdownOption {
  value: string | number;
  label: ReactNode;
}

export interface IDataDropdownFieldProps extends ITextFieldProps {
  emptyOptionLabel?: ReactNode;
  disableEmptyOption?: boolean;
  getDropdownEntities?: IAPIFunction;
  getDropdownOptions?: (options: any[]) => IDropdownOption[];
  options?: IDropdownOption[];
  dataKey?: string;
  sortOptions?: boolean;
}

const DROPDOWN_MENU_MAX_HEIGHT = 300;
const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;
const DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER = Math.floor(
  DROPDOWN_MENU_MAX_HEIGHT / DEFAULT_DROPDOWN_OPTION_HEIGHT
);

export const DataDropdownField: FC<IDataDropdownFieldProps> = ({
  SelectProps,
  emptyOptionLabel = 'Select',
  disableEmptyOption = true,
  getDropdownEntities,
  getDropdownOptions,
  children,
  name,
  value,
  dataKey,
  options: propOptions,
  sortOptions = false,
  ...rest
}) => {
  if (rest.label) {
    emptyOptionLabel = <>&nbsp;</>;
    disableEmptyOption = true;
  }

  value = useFormikValue({ value, name });

  const [dropdownAnchorEl, setDropdownAnchorEl] =
    useState<HTMLDivElement | null>(null);

  const {
    load,
    loading,
    loaded,
    record: dropdownEntities,
    errorMessage,
  } = useAPIService<any[]>([], dataKey);

  const [options, setOptions] = useState<IDropdownOption[]>([]);
  const [displayOptions, setDisplayOptions] = useState<IDropdownOption[]>([]);

  const loadOptions = useCallback(async () => {
    if (!children && !loading && !loaded && getDropdownEntities) {
      load(getDropdownEntities);
    }
  }, [children, getDropdownEntities, load, loaded, loading]);

  const valueString = Array.isArray(value) ? value.join(',') : value;
  useEffect(() => {
    valueString && !errorMessage && loadOptions();
  }, [errorMessage, loadOptions, valueString]);

  useEffect(() => {
    propOptions && setOptions(propOptions);
  }, [propOptions, setOptions]);

  useEffect(() => {
    setOptions(
      getDropdownOptions
        ? getDropdownOptions(dropdownEntities)
        : dropdownEntities
    );
  }, [dropdownEntities, getDropdownOptions, setOptions]);

  useEffect(() => {
    const displayOptionsCount = (() => {
      if (value) {
        const selectedOptions = (Array.isArray(value) ? value : [value])
          .map((value) => {
            return options.find(({ value: optionValue }) => {
              return optionValue === value;
            });
          })
          .filter((option) => option);
        if (selectedOptions.length > 0) {
          selectedOptions.forEach((selectedOption) => {
            const selectedOptionIndex = options.indexOf(selectedOption!);
            options.splice(selectedOptionIndex, 1);
          });
          selectedOptions.reverse().forEach((selectedOption) => {
            options.unshift(selectedOption!);
          });
          return Math.max(
            selectedOptions.length,
            DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER
          );
        }
      }
      return DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER;
    })();
    const displayOptions = options.slice(0, displayOptionsCount);
    if (sortOptions) {
      displayOptions.sort(({ label: aLabel }, { label: bLabel }) => {
        if (typeof aLabel === 'string' && typeof bLabel === 'string') {
          return aLabel.localeCompare(bLabel);
        }
        return 0;
      });
    }
    setDisplayOptions(displayOptions);
  }, [options, sortOptions, value]);

  useEffect(() => {
    if (dropdownAnchorEl) {
      const dropdownMenu = dropdownAnchorEl.querySelector('.MuiMenu-paper');
      if (dropdownMenu) {
        const dropdownList = dropdownMenu.querySelector('ul')!;
        dropdownList.style.minHeight = `${
          options.length * DEFAULT_DROPDOWN_OPTION_HEIGHT
        }px`;
        dropdownList.style.boxSizing = `border-box`;
        const scrollCallback = () => {
          const { scrollTop } = dropdownMenu;
          const topOptionCount = Math.floor(
            scrollTop / DEFAULT_DROPDOWN_OPTION_HEIGHT
          );
          setDisplayOptions(
            options.slice(
              0,
              topOptionCount + DEFAULT_NUMBER_OF_OPTIONS_TO_RENDER
            )
          );
        };
        dropdownMenu.addEventListener('scroll', scrollCallback);
        return () => {
          dropdownMenu.removeEventListener('scroll', scrollCallback);
        };
      }
    }
  }, [dropdownAnchorEl, options]);

  if (value && !children) {
    const fieldValues = Array.isArray(value) ? value : [value];
    const optionValues = options.map(({ value }) => value);
    const missingOptions = fieldValues.filter((value) => {
      return !optionValues.includes(value);
    });

    if (loading && missingOptions.length > 0) {
      return (
        <LoadingProvider value={{ loading, errorMessage, loaded }}>
          <TextField {...rest} />
        </LoadingProvider>
      );
    }
  }

  const errorProps: Pick<ITextFieldProps, 'error' | 'helperText'> = {};
  if (errorMessage) {
    errorProps.error = true;
    errorProps.helperText = (
      <RetryErrorMessage message={errorMessage} retry={loadOptions} />
    );
  }

  return (
    <TextField
      onFocus={loadOptions}
      SelectProps={{
        defaultValue: '',
        displayEmpty: true,
        IconComponent: ExpandMoreIcon,
        ...SelectProps,
        MenuProps: {
          ref: (el) => {
            setDropdownAnchorEl(el);
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          sx: {
            maxHeight: DROPDOWN_MENU_MAX_HEIGHT,
          },
        },
      }}
      {...{ name, value }}
      {...rest}
      {...errorProps}
      select
    >
      {loading ? (
        <MenuItem value="LOADING" disabled>
          <ReloadIconButton {...{ load, loading }} sx={{ mx: 'auto' }} />
        </MenuItem>
      ) : null}
      {children ||
        displayOptions.map(({ value, label }) => {
          return (
            <MenuItem
              value={value}
              key={value}
              sx={{ minHeight: DEFAULT_DROPDOWN_OPTION_HEIGHT }}
            >
              {label}
            </MenuItem>
          );
        })}
    </TextField>
  );
};

export default DataDropdownField;
