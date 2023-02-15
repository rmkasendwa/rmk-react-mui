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
  const routeCacheRef = useRef(
    (data[ROUTE_CACHE_KEY] || {}) as Record<string, string>
  );

  useEffect(() => {
    if (search) {
      routeCacheRef.current[pathname] = pathname + search;
    } else {
      delete routeCacheRef.current[pathname];
    }
    updateData({
      [ROUTE_CACHE_KEY]: routeCacheRef.current,
    });
  }, [pathname, search, updateData]);

  return <Outlet />;
};

export default ReactRouterDomSearchParamCache;
