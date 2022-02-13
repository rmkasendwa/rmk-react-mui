import { FC, createContext, useState } from 'react';

import { DEFAULT_COUNTRY_CODE, DEFAULT_CURRENCY_CODE } from '../constants';
import { ICountryCode } from '../interfaces';

export interface IGlobalConfigurationContext {
  countryCode: ICountryCode;
  currencyCode: string;
  setCountryCode?: (countryCode: ICountryCode) => void;
  setCurrencyCode?: (countryCode: ICountryCode) => void;
}

export const GlobalConfigurationContext =
  createContext<IGlobalConfigurationContext>({
    countryCode: DEFAULT_COUNTRY_CODE,
    currencyCode: DEFAULT_CURRENCY_CODE,
  });

export const GlobalConfigurationProvider: FC = ({ children }) => {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY_CODE);

  const value = { countryCode, currencyCode, setCountryCode, setCurrencyCode };

  return (
    <GlobalConfigurationContext.Provider value={value}>
      {children}
    </GlobalConfigurationContext.Provider>
  );
};
