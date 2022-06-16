import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
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
    id,
    regionalCode: regionalCodeProp,
    sx,
    ...rest
  },
  ref
) {
  const { InputProps = {} } = rest;
  const initialRenderRef = useRef(true);
  const { countryCode } = useContext(GlobalConfigurationContext);
  const [regionalCode, setRegionalCode] = useState(countryCode);
  const [selectedCountry, setSelectedCountry] = useState(flags[regionalCode]);

  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
    value && setSanitizedInputValue(value);
  }, [setSanitizedInputValue, value]);

  useEffect(() => {
    if (regionalCodeProp) {
      setRegionalCode(regionalCodeProp);
    }
  }, [regionalCodeProp]);

  useEffect(() => {
    setSelectedCountry(flags[regionalCode]);
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
      }}
      {...rest}
      {...{ name, id, placeholder }}
      InputProps={{
        ...InputProps,
        startAdornment: displayPhoneNumberCountry ? (
          <InputAdornment position="start">
            <Button
              color="inherit"
              ref={anchorRef}
              onClick={() => {
                setMenuOpen((prevOpen) => !prevOpen);
              }}
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
              onClose={() => {
                setMenuOpen(false);
              }}
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
        ...sx,
      }}
    />
  );
});

export default PhoneNumberInputField;
