import hash from 'object-hash';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useReactRouterDOMSearchParams = () => {
  const [baseSearchParams, baseSetSearchParams] = useSearchParams();

  const setSearchParams = useCallback(
    (
      searchParams: Record<string, string | null>,
      navigateOptions?: {
        replace?: boolean | undefined;
        state?: any;
      }
    ) => {
      const entries = new URL(window.location.href).searchParams.entries();
      const existingSearchParams: Record<string, string> = {};
      for (const [key, value] of entries) {
        existingSearchParams[key] = value;
      }
      const combinedSearchParams = {
        ...existingSearchParams,
        ...searchParams,
      };
      const nextSearchParams = Object.keys(combinedSearchParams)
        .filter((key) => {
          return (
            combinedSearchParams[key] != null &&
            combinedSearchParams[key]!.length > 0
          );
        })
        .reduce((accumulator, key) => {
          accumulator[key] = combinedSearchParams[key]!;
          return accumulator;
        }, {} as Record<string, string>);

      if (hash(nextSearchParams) !== hash(existingSearchParams)) {
        baseSetSearchParams(nextSearchParams, navigateOptions);
      }
    },
    [baseSetSearchParams]
  );

  return {
    searchParams: baseSearchParams,
    setSearchParams,
  };
};
