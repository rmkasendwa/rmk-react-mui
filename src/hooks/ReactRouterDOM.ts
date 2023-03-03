import '@infinite-debugger/rmk-js-extensions/RegExp';

import hash from 'object-hash';
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { ObjectShape, OptionalObjectSchema, TypeOfShape } from 'yup/lib/object';
import { AnyObject } from 'yup/lib/types';

export type RouterMode = 'string' | 'json';

export type SetSearchParams<SearchParams = Record<string, string | null>> = (
  searchParams: SearchParams,
  navigateOptions?: {
    replace?: boolean | undefined;
    state?: any;
  }
) => void;

export function useReactRouterDOMSearchParams<TShape extends ObjectShape>({
  validator,
}: {
  mode: 'json';
  validator: OptionalObjectSchema<TShape, AnyObject, TypeOfShape<TShape>>;
  id?: string;
}): {
  searchParams: Partial<Yup.InferType<typeof validator>>;
  setSearchParams: SetSearchParams<
    Partial<{
      [K in keyof Yup.InferType<typeof validator>]:
        | Yup.InferType<typeof validator>[K]
        | null;
    }>
  >;
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
  validator = Yup.object(),
  id,
}: {
  mode?: 'string' | 'json';
  validator?: OptionalObjectSchema<TShape, AnyObject, TypeOfShape<TShape>>;
  id?: string;
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
                const searchParamKey = (() => {
                  if (id) {
                    return `${key}:${id}`;
                  }
                  return key;
                })();
                if (searchParams[key] == null) {
                  accumulator[searchParamKey] = searchParams[key];
                } else {
                  accumulator[searchParamKey] = JSON.stringify(
                    searchParams[key]
                  );
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
    [id, mode]
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
                  const objectKey = (() => {
                    if (id) {
                      return key.replace(
                        new RegExp(`:${RegExp.escape(id)}$`),
                        ''
                      );
                    }
                    return key;
                  })();
                  const searchParamsObject = {
                    [objectKey]: JSON.parse(allSearchParams[key]),
                  };
                  Object.assign(
                    accumulator,
                    validator.validateSync(searchParamsObject)
                  );
                } catch (err) {
                  console.error(`useReactRouterDOMSearchParams: Error`, err);
                }
                return accumulator;
              },
              {} as Partial<Yup.InferType<typeof validator>>
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
