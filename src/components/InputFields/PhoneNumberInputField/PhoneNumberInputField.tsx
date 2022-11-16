import 'flag-icons/css/flag-icons.min.css';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Tooltip, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { CountryCode } from '../../../interfaces/Countries';
import PhoneNumberUtil, {
  isValidPhoneNumber,
  systemStandardPhoneNumberFormat,
} from '../../../utils/PhoneNumberUtil';
import TextField, { TextFieldProps } from '../TextField';
import { Country, countries } from './countries';
import CountryList from './CountryList';

export interface PhoneNumberInputFieldProps extends TextFieldProps {
  value?: string;
  displayPhoneNumberCountry?: boolean;
  displayRegionalCodeOnEmptyFocus?: boolean;
  regionalCode?: CountryCode;
}

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

export const PhoneNumberInputField = forwardRef<
  HTMLDivElement,
  PhoneNumberInputFieldProps
>(function PhoneNumberInputField(
  {
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
    ...rest
  },
  ref
) {
  const { InputProps = {} } = rest;
  const initialRenderRef = useRef(true);
  const anchorRef = useRef(null);

  const { palette } = useTheme();

  const [regionalCode, setRegionalCode] = useState<CountryCode | undefined>(
    undefined
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );

  const [phoneCountryListOpen, setPhoneCountryListOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
      {...{ name, id, placeholder, disabled }}
      InputProps={{
        ...InputProps,
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
                    className={`fi fi-${(() => {
                      if (selectedCountry) {
                        return selectedCountry.regionalCode.toLowerCase();
                      }
                    })()}`}
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
            <CountryList
              open={phoneCountryListOpen}
              onClose={() => {
                setPhoneCountryListOpen(false);
              }}
              onSelectCountry={(selectedCountry) => {
                setSelectedCountry(selectedCountry);
              }}
              {...{ selectedCountry }}
              anchor={anchorRef.current}
            />
          </InputAdornment>
        ) : null,
      }}
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
