import { FC, ReactNode, createContext, useContext, useState } from 'react';

import { DEFAULT_COUNTRY_CODE, DEFAULT_CURRENCY_CODE } from '../constants';
import { ICountryCode } from '../interfaces/Countries';

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

export const GlobalConfigurationProvider: FC<{
  children: ReactNode;
  value?: Record<string, any>;
}> = ({ children, value }) => {
  const [countryCode, setCountryCode] = useState(
    value?.countryCode || DEFAULT_COUNTRY_CODE
  );
  const [currencyCode, setCurrencyCode] = useState(
    value?.currencyCode || DEFAULT_CURRENCY_CODE
  );

  return (
    <GlobalConfigurationContext.Provider
      value={{
        countryCode,
        currencyCode,
        setCountryCode,
        setCurrencyCode,
        ...value,
      }}
    >
      {children}
    </GlobalConfigurationContext.Provider>
  );
};

export const useGlobalConfiguration = () => {
  return useContext(GlobalConfigurationContext);
};
