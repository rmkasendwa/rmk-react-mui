import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Divider, outlinedInputClasses, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import React, { useEffect, useMemo, useState } from 'react';

import { CountryCode } from '../../../interfaces/Countries';
import CountryFieldValue from '../../CountryFieldValue';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from '../../PaginatedDropdownOptionList';
import TextField from '../TextField';
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
  const { palette } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);

  const options = useMemo(() => {
    return countries.map((country) => getCountryOption(country));
  }, []);

  useEffect(() => {
    setFilteredOptions(
      options.filter(({ searchableLabel }) => {
        return (
          !searchTerm ||
          (searchableLabel &&
            searchableLabel.toLowerCase().match(searchTerm.toLowerCase()))
        );
      })
    );
  }, [options, searchTerm]);

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
                  <Card>
                    <Box
                      sx={{
                        py: 1,
                        px: 2,
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="Search"
                        value={searchTerm}
                        InputProps={{
                          startAdornment: (
                            <SearchIcon sx={{ pointerEvents: 'none', mr: 1 }} />
                          ),
                          endAdornment: searchTerm ? (
                            <ClearIcon
                              onClick={() => setSearchTerm('')}
                              fontSize="small"
                              sx={{ cursor: 'pointer' }}
                            />
                          ) : null,
                        }}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        fullWidth
                        sx={{
                          [`.${outlinedInputClasses.root}`]: {
                            borderRadius: '20px',
                            bgcolor: palette.divider,
                          },
                        }}
                      />
                    </Box>
                    <Divider />
                    <PaginatedDropdownOptionList
                      options={filteredOptions}
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
                      CardProps={{
                        sx: {
                          bgcolor: 'transparent',
                          border: 'none',
                        },
                      }}
                    />
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

export default CountryList;
