import './scss/style.scss';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Card,
  ClickAwayListener,
  Divider,
  Grow,
  MenuItem,
  Popper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import TextField from '../TextField';
import { ICountry, countries } from './countries';

export interface ICountryListProps {
  open: boolean;
  onClose?: () => void;
  selectedCountry?: ICountry;
  onSelectCountry?: (country: ICountry) => void;
  anchor?: any;
}

const CountryList: React.FC<ICountryListProps> = ({
  open,
  onClose,
  onSelectCountry,
  selectedCountry,
  anchor,
}) => {
  const [limit, setLimit] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => {
    onClose && onClose();
  };

  const displayCountries = countries
    .filter(({ name }) => {
      return !searchTerm || name.toLowerCase().match(searchTerm.toLowerCase());
    })
    .slice(0, limit);

  return (
    <Popper open={open} anchorEl={anchor} transition placement="bottom-start">
      {({ TransitionProps }) => {
        return (
          <Grow {...TransitionProps}>
            <Box>
              <ClickAwayListener onClickAway={handleClose}>
                <Card>
                  <Box sx={{ p: 2 }}>
                    <TextField
                      variant="outlined"
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
                    />
                  </Box>
                  <Divider />
                  <Box
                    onScroll={(event: any) => {
                      if (
                        limit < countries.length &&
                        event.target.scrollHeight -
                          event.target.scrollTop -
                          event.target.offsetHeight <
                          30
                      ) {
                        setLimit((prevLimit) => {
                          const nextLimit = Math.floor(prevLimit * 1.5);
                          if (countries.length < nextLimit) {
                            return countries.length;
                          }
                          return nextLimit;
                        });
                      }
                    }}
                    component="ul"
                    sx={{
                      minWidth: 200,
                      maxHeight: 200,
                      p: 0,
                      overflowY: 'auto',
                    }}
                  >
                    {displayCountries.length > 0 ? (
                      displayCountries.map(
                        ({ regionalCode, countryCode, name }) => {
                          return (
                            <MenuItem
                              onClick={() => {
                                onSelectCountry &&
                                  onSelectCountry({
                                    regionalCode,
                                    name,
                                    countryCode,
                                  });
                                handleClose();
                              }}
                              selected={
                                regionalCode === selectedCountry?.regionalCode
                              }
                              key={regionalCode}
                            >
                              <i
                                className={`phone-field-flag-icon phone-field-flag-${regionalCode.toLowerCase()}`}
                              />
                              <span className="phone-field-flag-country-name">
                                {name}{' '}
                                <Typography variant="body2" component="span">
                                  +{countryCode}
                                </Typography>
                              </span>
                            </MenuItem>
                          );
                        }
                      )
                    ) : (
                      <MenuItem>
                        <Typography variant="body2">
                          No countries found
                        </Typography>
                      </MenuItem>
                    )}
                  </Box>
                </Card>
              </ClickAwayListener>
            </Box>
          </Grow>
        );
      }}
    </Popper>
  );
};

export default CountryList;
