import hash from 'object-hash';
import { useCallback } from 'react';

export type SetSearchPrams = (
  nextInit: Record<string, string | string[]>,
  navigateOptions?: {
    replace?: boolean | undefined;
    state?: any;
  }
) => void;

export const useSetSearchParam = (baseSetSearchParams: SetSearchPrams) => {
  const setSearchParams = useCallback(
    (
      searchParams: Record<string, string | null>,
      navigateOptions?: {
        replace?: boolean | undefined;
        state?: any;
      }
    ) => {
      const entries = new URL(window.location.href).searchParams.entries();
      const existingSearchParams: Record<string, string | string[]> = {};
      for (const [key, value] of entries) {
        if (Array.isArray(existingSearchParams[key])) {
          (existingSearchParams[key] as string[]).push(value);
        } else if (typeof existingSearchParams[key] === 'string') {
          existingSearchParams[key] = [existingSearchParams[key] as string];
        } else {
          existingSearchParams[key] = value;
        }
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
        }, {} as Record<string, string | string[]>);

      if (hash(nextSearchParams) !== hash(existingSearchParams)) {
        baseSetSearchParams(nextSearchParams, navigateOptions);
      }
    },
    [baseSetSearchParams]
  );

  return { setSearchParams };
};
