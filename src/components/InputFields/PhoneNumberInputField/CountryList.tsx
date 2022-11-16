import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import React, { useEffect, useMemo, useState } from 'react';

import { CountryCode } from '../../../interfaces/Countries';
import CountryFieldValue from '../../CountryFieldValue';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../../PaginatedDropdownOptionList';
import { Country, countries } from './countries';

export interface CountryListProps {
  open: boolean;
  onClose?: () => void;
  selectedCountry?: Country;
  onSelectCountry?: (country: Country) => void;
  anchor?: any;
}

const getCountryOption = ({ regionalCode, name, countryCode }: Country) => {
  return {
    label: (
      <CountryFieldValue
        countryCode={regionalCode as CountryCode}
        countryLabel={`${name} +${countryCode}`}
        FieldValueProps={{
          noWrap: true,
          sx: {
            fontWeight: 'normal',
            whiteSpace: 'nowrap',
            color: 'inherit',
          },
        }}
      />
    ),
    searchableLabel: name,
    value: regionalCode,
  } as DropdownOption;
};

const CountryList: React.FC<CountryListProps> = ({
  open,
  onClose,
  onSelectCountry,
  selectedCountry,
  anchor,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
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

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchor}
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
                    options={options}
                    minWidth={anchor ? anchor.offsetWidth : undefined}
                    onClose={handleClose}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                    onSelectOption={({ value }) => {
                      const country = countries.find(
                        ({ regionalCode }) => regionalCode === value
                      );
                      if (onSelectCountry && country) {
                        onSelectCountry(country);
                      }
                      handleClose();
                    }}
                    searchable
                  />
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
};

export default CountryList;
