import './scss/style.scss';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, InputAdornment, Typography } from '@mui/material';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { GlobalConfigurationContext } from '../../../contexts';
import { useFormikValue } from '../../../hooks';
import { ICountryCode } from '../../../interfaces';
import { systemStandardPhoneNumberFormat } from '../../../utils/PhoneNumberUtil';
import TextField, { ITextFieldProps } from '../TextField';
import { ICountry, countries } from './countries';
import CountryList from './CountryList';

interface IPhoneNumberInputFieldProps extends ITextFieldProps {
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

export const PhoneNumberInputField: FC<IPhoneNumberInputFieldProps> = ({
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
  regionalCode,
  ...rest
}) => {
  value = useFormikValue({ value, name });

  const { countryCode } = useContext(GlobalConfigurationContext);
  regionalCode || (regionalCode = countryCode);
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

  return (
    <TextField
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
                <i
                  className={`phone-field-flag-icon phone-field-flag-${selectedCountry.regionalCode.toLowerCase()}`}
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
};

export default PhoneNumberInputField;
