import hash from 'object-hash';
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InferType, object } from 'yup';
import { ObjectShape, OptionalObjectSchema, TypeOfShape } from 'yup/lib/object';
import { AnyObject } from 'yup/lib/types';

export type RouterMode = 'string' | 'json';

export type SetSearchParams = (
  searchParams: Record<string, any | null>,
  navigateOptions?: {
    replace?: boolean | undefined;
    state?: any;
  }
) => void;

export function useReactRouterDOMSearchParams<TShape extends ObjectShape>({
  mode,
  validator,
}: {
  mode: 'json';
  validator: OptionalObjectSchema<TShape, AnyObject, TypeOfShape<TShape>>;
}): {
  searchParams: Partial<InferType<typeof validator>>;
  setSearchParams: SetSearchParams;
};

export function useReactRouterDOMSearchParams(options: { mode?: 'string' }): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
};

export function useReactRouterDOMSearchParams(): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
};

export function useReactRouterDOMSearchParams<TShape extends ObjectShape>({
  mode,
  validator = object(),
}: {
  mode?: 'string' | 'json';
  validator?: OptionalObjectSchema<TShape, AnyObject, TypeOfShape<TShape>>;
} = {}) {
  const [searchParams, baseSetSearchParams] = useSearchParams();
  const baseSetSearchParamsRef = useRef(baseSetSearchParams);
  useEffect(() => {
    baseSetSearchParamsRef.current = baseSetSearchParams;
  }, [baseSetSearchParams]);

  const setSearchParams = useCallback<SetSearchParams>(
    (searchParams, navigateOptions) => {
      const entries = new URL(window.location.href).searchParams.entries();
      const existingSearchParams: Record<string, string> = {};
      for (const [key, value] of entries) {
        if (Array.isArray(value) && value.length > 0) {
          existingSearchParams[key] = String([0]);
        } else if (typeof value === 'string') {
          existingSearchParams[key] = value;
        }
      }
      const combinedSearchParams = {
        ...existingSearchParams,
        ...(() => {
          const keys = Object.keys(searchParams);
          switch (mode) {
            case 'string':
              return keys.reduce((accumulator, key) => {
                if (
                  typeof searchParams[key] === 'string' ||
                  searchParams[key] === null
                ) {
                  accumulator[key] = searchParams[key];
                }
                return accumulator;
              }, {} as Record<string, string | null>);
            case 'json':
              return keys.reduce((accumulator, key) => {
                if (searchParams[key] == null) {
                  accumulator[key] = searchParams[key];
                } else {
                  accumulator[key] = JSON.stringify(searchParams[key]);
                }
                return accumulator;
              }, {} as Record<string, string | null>);
          }
        })(),
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
        baseSetSearchParamsRef.current(nextSearchParams, navigateOptions);
      }
    },
    [mode]
  );

  return {
    ...(() => {
      switch (mode) {
        case 'json':
          const searchEntries = searchParams.entries();
          const allSearchParams: Record<string, string> = {};
          for (const [key, value] of searchEntries) {
            if (Array.isArray(value) && value.length > 0) {
              allSearchParams[key] = String([0]);
            } else if (typeof value === 'string') {
              allSearchParams[key] = value;
            }
          }
          return {
            searchParams: Object.keys(allSearchParams).reduce(
              (accumulator, key) => {
                try {
                  (accumulator as any)[key] = JSON.parse(allSearchParams[key]);
                } catch (err) {}
                return accumulator;
              },
              {} as Partial<InferType<typeof validator>>
            ),
          };
        case 'string':
        default:
          return {
            searchParams,
          };
      }
    })(),
    setSearchParams,
  };
}
