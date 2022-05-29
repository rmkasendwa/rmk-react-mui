import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, InputAdornment, Typography } from '@mui/material';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../../../contexts/GlobalConfigurationContext';
import { ICountryCode } from '../../../interfaces/Countries';
import {
  getRegionalCode,
  systemStandardPhoneNumberFormat,
} from '../../../utils/PhoneNumberUtil';
import TextField, { ITextFieldProps } from '../TextField';
import { ICountry, countries } from './countries';
import CountryList from './CountryList';
import flagsImage from './flags.png';
import { phoneNumberFlags } from './phoneNumberFlags';

export interface IPhoneNumberInputFieldProps extends ITextFieldProps {
  value?: string;
  displaySelectedFlagLabel?: boolean;
  displayPhoneNumberCountry?: boolean;
  displayRegionalCodeOnEmptyFocus?: boolean;
  regionalCode?: ICountryCode;
}

const flags = countries.reduce(
  (
    accumulator: {
      [key: string]: ICountry;
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
  IPhoneNumberInputFieldProps
>(function PhoneNumberInputField(
  {
    displaySelectedFlagLabel = true,
    displayPhoneNumberCountry = false,
    displayRegionalCodeOnEmptyFocus = false,
    label,
    placeholder,
    onFocus,
    onBlur,
    onChange,
    value,
    name,
    regionalCode: regionalCodeProp,
    ...rest
  },
  ref
) {
  const { countryCode } = useContext(GlobalConfigurationContext);
  const [regionalCode, setRegionalCode] = useState(countryCode);
  const [selectedCountry, setSelectedCountry] = useState(flags[regionalCode]);

  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleMenuToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const setSanitizedInputValue = useCallback(
    (value: string) => {
      const validCharacters = value.match(/^\+|[\d-\s]/g);
      if (validCharacters) {
        const sanitizedValue = systemStandardPhoneNumberFormat(
          validCharacters.join(''),
          regionalCode
        );
        const sanitizedValueRegionalCode = getRegionalCode(sanitizedValue);
        if (
          sanitizedValueRegionalCode &&
          regionalCode &&
          sanitizedValueRegionalCode !== regionalCode
        ) {
          setRegionalCode(sanitizedValueRegionalCode);
        }
        setInputValue(sanitizedValue);
      } else {
        setInputValue('');
      }
    },
    [regionalCode]
  );

  useEffect(() => {
    value != null && setSanitizedInputValue(value);
  }, [setSanitizedInputValue, value]);

  useEffect(() => {
    if (regionalCodeProp) {
      setRegionalCode(regionalCodeProp);
    }
  }, [regionalCodeProp]);

  useEffect(() => {
    setSelectedCountry(flags[regionalCode]);
  }, [regionalCode]);

  return (
    <TextField
      ref={ref}
      label={label}
      value={inputValue}
      onFocus={(event) => {
        if (displayRegionalCodeOnEmptyFocus && inputValue.length === 0) {
          setInputValue(`+${selectedCountry.countryCode}`);
        }
        onFocus && onFocus(event);
      }}
      onBlur={(event) => {
        if (inputValue === `+${selectedCountry.countryCode}`) {
          setInputValue('');
        }
        onBlur && onBlur(event);
      }}
      onChange={(event) => {
        setSanitizedInputValue(event.target.value);
        onChange && onChange(event);
      }}
      placeholder={placeholder}
      {...rest}
      {...{ name }}
      InputProps={{
        startAdornment: displayPhoneNumberCountry ? (
          <InputAdornment position="start">
            <Button
              color="inherit"
              ref={anchorRef}
              onClick={handleMenuToggle}
              sx={{ gap: 0, pr: 0, pl: 2 }}
            >
              <Box
                component="span"
                className="phone-field-flag-country"
                sx={{ display: 'inline-flex', alignItems: 'center' }}
                title={selectedCountry.name}
              >
                <Box
                  component="i"
                  sx={{
                    mr: `4px`,
                    display: 'inline-block',
                    width: 16,
                    height: 11,
                    backgroundImage: `url(${flagsImage})`,
                    backgroundRepeat: 'no-repeat',
                    ...phoneNumberFlags[
                      selectedCountry.regionalCode.toLowerCase()
                    ],
                  }}
                />
                {displaySelectedFlagLabel && (
                  <Typography
                    className="phone-field-flag-country-name"
                    variant="body2"
                    component="span"
                    sx={{
                      fontSize: 14,
                      display: { sm: 'inline-block', xs: 'none' },
                      width: 60,
                    }}
                    noWrap
                  >
                    {selectedCountry.name}
                  </Typography>
                )}
              </Box>
              <ExpandMoreIcon />
            </Button>
            <CountryList
              open={menuOpen}
              onClose={handleMenuClose}
              onSelectCountry={(selectedCountry) => {
                setSelectedCountry(selectedCountry);
              }}
              selectedCountry={selectedCountry}
              anchor={anchorRef.current}
            />
          </InputAdornment>
        ) : null,
      }}
      sx={{
        '&>.MuiInputBase-formControl': {
          pl: 0,
        },
      }}
    />
  );
});

export default PhoneNumberInputField;
