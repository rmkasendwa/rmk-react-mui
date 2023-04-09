import { FC, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useCachedData } from '../contexts/DataStoreContext';

export const ROUTE_CACHE_KEY = 'routeCache';

export interface ReactRouterDomSearchParamCacheProps {}

export const ReactRouterDomSearchParamCache: FC<
  ReactRouterDomSearchParamCacheProps
> = () => {
  const { pathname, search } = useLocation();
  const { data, updateData } = useCachedData();

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const routeCache = dataRef.current[ROUTE_CACHE_KEY] || {};
    if (search) {
      routeCache[pathname] = pathname + search;
    } else {
      delete routeCache[pathname];
    }
    updateData({
      [ROUTE_CACHE_KEY]: routeCache,
    });
  }, [pathname, search, updateData]);

  return <Outlet />;
};

export default ReactRouterDomSearchParamCache;
