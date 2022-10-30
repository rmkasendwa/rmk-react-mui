import { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useCachedData } from '../contexts/DataStoreContext';

const ROUTE_CACHE_KEY = 'routeCache';

export interface ReactRouterDomSearchParamCacheProps {}

export const ReactRouterDomSearchParamCache: FC<
  ReactRouterDomSearchParamCacheProps
> = () => {
  const { pathname, search } = useLocation();
  const { data, updateData } = useCachedData();
  const routeCache: Record<string, string> = data[ROUTE_CACHE_KEY] || {};

  if (search) {
    routeCache[pathname] = pathname + search;
    updateData({
      [ROUTE_CACHE_KEY]: routeCache,
    });
  } else {
    if (routeCache[pathname]) {
      return <Navigate to={routeCache[pathname]} />;
    }
  }

  return <Outlet />;
};

export default ReactRouterDomSearchParamCache;
