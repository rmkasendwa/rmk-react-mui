import { FC, createContext, useState } from 'react';

import { DEFAULT_COUNTRY_CODE } from '../constants';
import { IGlobalConfiguration } from '../interfaces';

export const GlobalConfigurationContext = createContext<IGlobalConfiguration>({
  countryCode: 'UG',
});

export const GlobalConfigurationProvider: FC = ({ children }) => {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);

  const value: IGlobalConfiguration = { countryCode, setCountryCode };

  return (
    <GlobalConfigurationContext.Provider value={value}>
      {children}
    </GlobalConfigurationContext.Provider>
  );
};
