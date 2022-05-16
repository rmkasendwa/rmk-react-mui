import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Card,
  ClickAwayListener,
  Grow,
  Popper,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import PaginatedDropdownOptionList, {
  IDropdownOption,
} from '../../PaginatedDropdownOptionList';
import TextField from '../TextField';
import { ICountry, countries } from './countries';
import flagsImage from './flags.png';
import { phoneNumberFlags } from './phoneNumberFlags';

export interface ICountryListProps {
  open: boolean;
  onClose?: () => void;
  selectedCountry?: ICountry;
  onSelectCountry?: (country: ICountry) => void;
  anchor?: any;
}

const getCountryOption = ({ regionalCode, name, countryCode }: ICountry) => {
  return {
    label: (
      <>
        <Box
          component="i"
          sx={{
            mr: 1,
            display: 'inline-block',
            width: 16,
            height: 11,
            backgroundImage: `url(${flagsImage})`,
            backgroundRepeat: 'no-repeat',
            ...phoneNumberFlags[regionalCode.toLowerCase()],
          }}
        />
        <Typography variant="body2" component="span">
          {name} +{countryCode}
        </Typography>
      </>
    ),
    searchableLabel: name,
    value: regionalCode,
  } as IDropdownOption;
};

const CountryList: React.FC<ICountryListProps> = ({
  open,
  onClose,
  onSelectCountry,
  selectedCountry,
  anchor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<IDropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<IDropdownOption[]>([]);

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
                    <TextField
                      variant="filled"
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
                      inputProps={{
                        sx: {
                          py: 1.5,
                        },
                      }}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      fullWidth
                    />
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
