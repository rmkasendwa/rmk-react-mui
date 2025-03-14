import 'flag-icons/css/flag-icons.min.css';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import InputAdornment from '@mui/material/InputAdornment';
import Popper from '@mui/material/Popper';
import clsx from 'clsx';
import { countries as countriesMap } from 'countries-list';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { merge } from 'lodash';
import { useLoadingContext } from '../../contexts/LoadingContext';
import { CountryCode } from '../../models/Countries';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../../utils/PhoneNumberUtil';
import CountryFieldValue from '../CountryFieldValue';
import FieldValueDisplay from '../FieldValueDisplay';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../PaginatedDropdownOptionList';
import Tooltip from '../Tooltip';
import TextField, { TextFieldProps } from './TextField';

export interface PhoneNumberInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PhoneNumberInputFieldClassKey = keyof PhoneNumberInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPhoneNumberInputField: PhoneNumberInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPhoneNumberInputField: keyof PhoneNumberInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPhoneNumberInputField?: {
      defaultProps?: ComponentsProps['MuiPhoneNumberInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPhoneNumberInputField'];
      variants?: ComponentsVariants['MuiPhoneNumberInputField'];
    };
  }
}
//#endregion

export const getPhoneNumberInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPhoneNumberInputField', slot);
};

const slots: Record<
  PhoneNumberInputFieldClassKey,
  [PhoneNumberInputFieldClassKey]
> = {
  root: ['root'],
};

export const phoneNumberInputFieldClasses: PhoneNumberInputFieldClasses =
  generateUtilityClasses(
    'MuiPhoneNumberInputField',
    Object.keys(slots) as PhoneNumberInputFieldClassKey[]
  );

export interface Country {
  regionalCode: string;
  name: string;
  countryCode: number;
}

export const countries = Object.keys(countriesMap).map((key) => {
  const countryCode = PhoneNumberUtil.getCountryCodeForRegion(key);
  return {
    regionalCode: key,
    name: countriesMap[key as CountryCode].name,
    countryCode,
  };
});

const getCountryOption = ({ regionalCode, name, countryCode }: Country) => {
  return {
    label: (
      <CountryFieldValue
        countryCode={regionalCode as CountryCode}
        countryLabel={`${name} (+${countryCode})`}
      />
    ),
    searchableLabel: name,
    value: regionalCode,
  } as DropdownOption;
};

const flags = countries.reduce(
  (
    accumulator: {
      [key: string]: Country;
    },
    country
  ) => {
    accumulator[country.regionalCode] = country;
    return accumulator;
  },
  {}
);

export interface PhoneNumberInputFieldProps extends TextFieldProps {
  value?: string;
  displayPhoneNumberCountry?: boolean;
  displayRegionalCodeOnEmptyFocus?: boolean;
  regionalCode?: CountryCode;
}

export const PhoneNumberInputField = forwardRef<
  HTMLDivElement,
  PhoneNumberInputFieldProps
>(function PhoneNumberInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPhoneNumberInputField',
  });
  const {
    className,
    displayPhoneNumberCountry = true,
    displayRegionalCodeOnEmptyFocus = true,
    label,
    placeholder,
    onFocus,
    onBlur,
    onChange,
    value,
    disabled,
    name,
    id,
    regionalCode: regionalCodeProp,
    sx,
    enableLoadingState = true,
    slotProps,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getPhoneNumberInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const initialRenderRef = useRef(true);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { palette } = useTheme();

  const { locked } = useLoadingContext();

  const [regionalCode, setRegionalCode] = useState<CountryCode | undefined>(
    regionalCodeProp
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    regionalCodeProp ? flags[regionalCodeProp] : undefined
  );
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
    selectedCountry ? [getCountryOption(selectedCountry)] : []
  );

  const [phoneCountryListOpen, setPhoneCountryListOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const options = useMemo(() => {
    return countries.map((country) => getCountryOption(country));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setSelectedOptions([getCountryOption(selectedCountry)]);
    } else {
      setSelectedOptions([]);
    }
  }, [selectedCountry]);

  const handleClosePhoneCountryList = () => {
    setPhoneCountryListOpen(false);
  };

  const setSanitizedInputValueRef = useRef((value: string) => {
    const validCharacterMatch = value.match(/^\+|[\d-\s]/g);
    if (validCharacterMatch) {
      const validCharacters = validCharacterMatch.join('');
      const phoneNumber = isValidPhoneNumber(value);
      const { localRegionalCode, phoneNumberValid } = (() => {
        if (phoneNumber) {
          return {
            localRegionalCode: PhoneNumberUtil.getRegionCodeForCountryCode(
              phoneNumber.getCountryCode()!
            ) as CountryCode,
            phoneNumberValid: true,
          };
        }
        return { localRegionalCode: regionalCode, phoneNumberValid: false };
      })();
      if (phoneNumberValid) {
        const sanitizedValue = systemStandardPhoneNumberFormat(
          validCharacters,
          localRegionalCode
        );
        if (localRegionalCode !== regionalCode) {
          setRegionalCode(localRegionalCode);
        }
        setInputValue(sanitizedValue);
      } else {
        setInputValue(validCharacters);
      }
    } else {
      setInputValue('');
    }
  });

  const triggerChangeEvent = useCallback(() => {
    const event: any = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: {
        name,
        id,
        value: inputValue,
      },
    });
    onChange && onChange(event);
  }, [id, inputValue, name, onChange]);

  useEffect(() => {
    if (value) {
      setSanitizedInputValueRef.current(value);
    } else {
      setSanitizedInputValueRef.current('');
    }
  }, [value]);

  useEffect(() => {
    if (regionalCodeProp) {
      setRegionalCode(regionalCodeProp);
    }
  }, [regionalCodeProp]);

  useEffect(() => {
    if (regionalCode) {
      setSelectedCountry(flags[regionalCode]);
    }
  }, [regionalCode]);

  useEffect(() => {
    if (!initialRenderRef.current) {
      triggerChangeEvent();
    }
  }, [triggerChangeEvent]);

  useEffect(() => {
    initialRenderRef.current = false;
    return () => {
      initialRenderRef.current = true;
    };
  }, []);

  if (enableLoadingState && locked) {
    return (
      <FieldValueDisplay
        {...({} as any)}
        {...rest.FieldValueDisplayProps}
        {...{ label }}
        fullWidth={props.fullWidth}
        value={(() => {
          if (inputValue) {
            return (
              <CountryFieldValue
                countryCode={regionalCode as CountryCode}
                countryLabel={inputValue}
              />
            );
          }
        })()}
      />
    );
  }

  return (
    <TextField
      ref={ref}
      label={label}
      value={inputValue}
      onFocus={(event) => {
        if (
          displayRegionalCodeOnEmptyFocus &&
          selectedCountry &&
          inputValue.length === 0
        ) {
          setInputValue(`+${selectedCountry.countryCode}`);
        }
        onFocus && onFocus(event);
      }}
      onBlur={(event) => {
        if (
          selectedCountry &&
          inputValue === `+${selectedCountry.countryCode}`
        ) {
          setInputValue('');
        }
        onBlur && onBlur(event);
      }}
      onChange={(event) => {
        setSanitizedInputValueRef.current(event.target.value);
      }}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, id, placeholder, disabled, enableLoadingState }}
      slotProps={merge(
        {
          input: {
            startAdornment: displayPhoneNumberCountry ? (
              <InputAdornment
                position="start"
                sx={{
                  maxWidth: 200,
                }}
              >
                <Button
                  color="inherit"
                  ref={anchorRef}
                  {...{ disabled }}
                  onClick={() => {
                    setPhoneCountryListOpen((prevOpen) => !prevOpen);
                  }}
                  sx={{ gap: 0, pr: 0, pl: 2 }}
                >
                  {(() => {
                    const flagElement = (
                      <Box
                        component="i"
                        className={clsx(
                          'fi',
                          selectedCountry &&
                            `fi-${selectedCountry.regionalCode.toLowerCase()}`
                        )}
                        sx={{
                          fontSize: 20,
                          height: '1em',
                          mr: `4px`,
                          display: 'inline-block',
                          bgcolor: palette.divider,
                        }}
                      />
                    );

                    if (selectedCountry) {
                      return (
                        <Tooltip
                          title={`${selectedCountry.name} (+${selectedCountry.countryCode})`}
                        >
                          {flagElement}
                        </Tooltip>
                      );
                    }

                    return flagElement;
                  })()}
                  <ExpandMoreIcon />
                </Button>
                <Popper
                  open={phoneCountryListOpen}
                  anchorEl={anchorRef.current}
                  transition
                  placement="bottom-start"
                  sx={{
                    zIndex: 9999,
                  }}
                >
                  {({ TransitionProps }) => {
                    return (
                      <Grow {...TransitionProps}>
                        <Box>
                          <ClickAwayListener
                            onClickAway={handleClosePhoneCountryList}
                          >
                            <PaginatedDropdownOptionList
                              options={options}
                              minWidth={
                                anchorRef.current
                                  ? anchorRef.current.offsetWidth
                                  : undefined
                              }
                              keyboardFocusElement={anchorRef.current}
                              onClose={handleClosePhoneCountryList}
                              selectedOptions={selectedOptions}
                              onChangeSelectedOptions={(options) => {
                                setSelectedOptions(options);
                              }}
                              onSelectOption={({ value }) => {
                                const selectedCountry = countries.find(
                                  ({ regionalCode }) => regionalCode === value
                                );
                                setSelectedCountry(selectedCountry);
                                handleClosePhoneCountryList();
                              }}
                              searchable
                            />
                          </ClickAwayListener>
                        </Box>
                      </Grow>
                    );
                  }}
                </Popper>
              </InputAdornment>
            ) : null,
          },
        },
        slotProps
      )}
      sx={{
        '&>.MuiInputBase-formControl': {
          pl: 0,
        },
        ...sx,
      }}
    />
  );
});

export default PhoneNumberInputField;
