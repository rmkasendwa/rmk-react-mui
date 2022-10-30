import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { SetSearchPrams, useSetSearchParam } from './Paths';

export const useNextRouterSearchParams = () => {
  const { push, replace, query: searchParams } = useRouter();

  const baseSetSearchParams: SetSearchPrams = useCallback(
    (nextInit, navigateOptions = {}) => {
      if (navigateOptions.replace) {
        replace({
          query: nextInit,
        });
      } else {
        push({
          query: nextInit,
        });
      }
    },
    [push, replace]
  );

  const { setSearchParams } = useSetSearchParam(baseSetSearchParams);

  return {
    searchParams,
    setSearchParams,
  };
};
