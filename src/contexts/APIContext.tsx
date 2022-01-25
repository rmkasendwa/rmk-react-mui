import { FC, createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IAPI, IAPIFunction } from '../interfaces';
import { SESSION_LOGIN_ROUTE_PATH } from '../route-paths';

export const APIContext = createContext<any>({});

export const APIProvider: FC = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const call = async (apiCallback: IAPIFunction) => {
    return apiCallback().catch((err) => {
      if (
        [
          'User session timed out',
          'Session timed out',
          'Invalid token',
        ].includes(err.message)
      ) {
        const { pathname, search } = location;
        navigate(
          SESSION_LOGIN_ROUTE_PATH +
            `?return_to=${encodeURIComponent(pathname + search)}`
        );
      } else {
        throw err;
      }
    });
  };

  const value: IAPI = { call };

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
};
