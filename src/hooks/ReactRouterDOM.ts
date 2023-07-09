import '@infinite-debugger/rmk-js-extensions/RegExp';

import { diff } from '@infinite-debugger/rmk-utils/data';
import { addSearchParams } from '@infinite-debugger/rmk-utils/paths';
import hashIt from 'hash-it';
import { pick } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { ObjectShape, OptionalObjectSchema, TypeOfShape } from 'yup/lib/object';
import { AnyObject } from 'yup/lib/types';

export type RouterMode = 'string' | 'json';

export type ParamStorage = 'url' | 'memory';

export type BaseSearchParams = Record<string, string | null>;

export type SetSearchParams<SearchParams = BaseSearchParams> = (
  searchParams: SearchParams,
  navigateOptions?: {
    replace?: boolean | undefined;
    state?: any;
  }
) => void;

export type AddSearchParamsToPath<SearchParams = BaseSearchParams> = (
  pathname: string,
  searchParams: SearchParams
) => string;

export function useReactRouterDOMSearchParams<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = Yup.InferType<
    OptionalObjectSchema<ValidationSpec, AnyObject, TypeOfShape<ValidationSpec>>
  >
>(options: {
  mode: 'json';
  spec: ValidationSpec;
  id?: string;
  paramStorage?: ParamStorage;
  clearSearchStateOnUnmount?: boolean;
  ignoreUnspecifiedParams?: boolean;
}): {
  searchParams: Partial<SearchParamsObject>;
  setSearchParams: SetSearchParams<
    Partial<{
      [K in keyof SearchParamsObject]: SearchParamsObject[K] | null;
    }>
  >;
  addSearchParamsToPath: AddSearchParamsToPath<
    Partial<{
      [K in keyof SearchParamsObject]: SearchParamsObject[K] | null;
    }>
  >;
};

export function useReactRouterDOMSearchParams(options: {
  mode?: 'string';
  paramStorage?: ParamStorage;
}): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
  addSearchParamsToPath: AddSearchParamsToPath;
};

export function useReactRouterDOMSearchParams(): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
  addSearchParamsToPath: AddSearchParamsToPath;
};

export function useReactRouterDOMSearchParams<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = Yup.InferType<
    OptionalObjectSchema<ValidationSpec, AnyObject, TypeOfShape<ValidationSpec>>
  >
>({
  mode = 'string',
  spec,
  id,
  paramStorage = 'url',
  clearSearchStateOnUnmount = false,
  ignoreUnspecifiedParams = false,
}: {
  mode?: 'string' | 'json';
  spec?: ValidationSpec;
  id?: string;
  paramStorage?: ParamStorage;
  clearSearchStateOnUnmount?: boolean;
  ignoreUnspecifiedParams?: boolean;
} = {}) {
  const hashedId = (() => {
    if (id) {
      return hashIt(id).toString(36).slice(0, 3);
    }
  })();
  const [searchParams, baseSetSearchParams] = useSearchParams();

  const [inMemorySearchParams, setInMemorySearchParams] = useState<
    Record<string, string>
  >({});
  const inMemorySearchParamsRef = useRef(inMemorySearchParams);
  inMemorySearchParamsRef.current = inMemorySearchParams;

  const baseSetSearchParamsRef = useRef(baseSetSearchParams);
  baseSetSearchParamsRef.current = baseSetSearchParams;
  const specRef = useRef(spec);
  specRef.current = spec;
  const jsonSearchParamsCacheRef = useRef<any>({});

  const getSearchParams = useCallback(
    (searchParams: BaseSearchParams) => {
      const existingSearchParams: Record<string, string> = (() => {
        switch (paramStorage) {
          case 'url': {
            const existingSearchParams: Record<string, string> = {};
            const entries = new URL(
              window.location.href
            ).searchParams.entries();
            for (const [key, value] of entries) {
              if (Array.isArray(value) && value.length > 0) {
                existingSearchParams[key] = String([0]);
              } else if (typeof value === 'string') {
                existingSearchParams[key] = value;
              }
            }
            return existingSearchParams;
          }
          case 'memory':
            return inMemorySearchParamsRef.current;
        }
      })();

      const combinedSearchParams = {
        ...(() => {
          if (mode !== 'json' || !ignoreUnspecifiedParams) {
            return existingSearchParams;
          }
        })(),
        ...(() => {
          const keys = Object.keys(searchParams);
          switch (mode) {
            case 'string':
              return keys.reduce<Record<string, string | null>>(
                (accumulator, key) => {
                  if (
                    typeof searchParams[key] === 'string' ||
                    searchParams[key] === null
                  ) {
                    accumulator[key] = searchParams[key];
                  }
                  return accumulator;
                },
                {}
              );
            case 'json':
              return keys.reduce<Record<string, string | null>>(
                (accumulator, key) => {
                  const searchParamKey = (() => {
                    if (hashedId) {
                      return `${key}:${hashedId}`;
                    }
                    return key;
                  })();
                  if (searchParams[key] == null) {
                    accumulator[searchParamKey] = searchParams[key];
                  } else {
                    try {
                      if (
                        Yup.object({
                          [key]: specRef.current![key],
                        }).validateSync(pick(searchParams, key))
                      ) {
                        accumulator[searchParamKey] = JSON.stringify(
                          searchParams[key]
                        );
                      }
                    } catch (err: any) {
                      if (err.name === 'ValidationError') {
                        console.error(
                          `useReactRouterDOMSearchParams: search param getter `,
                          err,
                          {
                            err,
                          }
                        );
                      }
                    }
                  }
                  return accumulator;
                },
                {}
              );
          }
        })(),
      };

      return {
        existingSearchParams,
        nextSearchParams: Object.keys(combinedSearchParams)
          .filter((key) => {
            return (
              combinedSearchParams[key] != null &&
              combinedSearchParams[key]!.length > 0
            );
          })
          .reduce((accumulator, key) => {
            accumulator[key] = combinedSearchParams[key]!;
            return accumulator;
          }, {} as Record<string, string>),
      };
    },
    [hashedId, ignoreUnspecifiedParams, mode, paramStorage]
  );

  const setSearchParams = useCallback<SetSearchParams>(
    (searchParams, navigateOptions) => {
      const { existingSearchParams, nextSearchParams } =
        getSearchParams(searchParams);

      if (hashIt(nextSearchParams) !== hashIt(existingSearchParams)) {
        switch (paramStorage) {
          case 'url':
            baseSetSearchParamsRef.current(nextSearchParams, navigateOptions);
            break;
          case 'memory':
            setInMemorySearchParams(nextSearchParams);
            break;
        }
      }
    },
    [getSearchParams, paramStorage]
  );

  const addSearchParamsToPath = useCallback<AddSearchParamsToPath>(
    (pathname, searchParams) => {
      return addSearchParams(
        pathname,
        getSearchParams(searchParams).nextSearchParams
      );
    },
    [getSearchParams]
  );

  useEffect(() => {
    if (
      mode === 'json' &&
      paramStorage === 'url' &&
      specRef.current &&
      clearSearchStateOnUnmount
    ) {
      const spec = specRef.current;
      return () => {
        setSearchParams(
          Object.fromEntries(
            Object.keys(spec).map((key) => {
              return [key, null];
            })
          ),
          { replace: true }
        );
      };
    }
  }, [clearSearchStateOnUnmount, mode, paramStorage, setSearchParams]);

  return {
    ...(() => {
      switch (mode) {
        case 'json':
          const validSearchParamKeys = Object.keys(spec!);

          const allSearchParams = (() => {
            switch (paramStorage) {
              case 'url': {
                const searchEntries = searchParams.entries();
                const allSearchParams: Record<string, string> = {};
                for (const [key, value] of searchEntries) {
                  if (Array.isArray(value) && value.length > 0) {
                    allSearchParams[key] = String([0]);
                  } else if (typeof value === 'string') {
                    allSearchParams[key] = value;
                  }
                }
                return allSearchParams;
              }
              case 'memory':
                return inMemorySearchParams;
            }
          })();

          return {
            searchParams: (() => {
              const nextSearchParams = Object.keys(allSearchParams).reduce(
                (accumulator, key) => {
                  const objectKey = (() => {
                    if (hashedId) {
                      return key.replace(
                        new RegExp(`:${RegExp.escape(hashedId)}$`),
                        ''
                      );
                    }
                    return key;
                  })();
                  if (validSearchParamKeys.includes(objectKey)) {
                    try {
                      const searchParamsObject = {
                        [objectKey]: JSON.parse(allSearchParams[key]),
                      };
                      Object.assign(
                        accumulator,
                        Yup.object({
                          [objectKey]: spec![objectKey],
                        }).validateSync(searchParamsObject)
                      );
                    } catch (err: any) {
                      if (err.name === 'ValidationError') {
                        console.error(
                          `useReactRouterDOMSearchParams: search param getter `,
                          err,
                          {
                            err,
                          }
                        );
                      }
                    }
                  }
                  return accumulator;
                },
                {} as Partial<SearchParamsObject>
              );
              const searchParamsDiff = diff(
                nextSearchParams,
                jsonSearchParamsCacheRef.current
              );

              jsonSearchParamsCacheRef.current = Object.assign(
                pick(
                  jsonSearchParamsCacheRef.current,
                  Object.keys(nextSearchParams)
                ),
                pick(nextSearchParams, Object.keys(searchParamsDiff))
              );

              return jsonSearchParamsCacheRef.current;
            })(),
          };
        case 'string':
        default:
          if (paramStorage === 'memory') {
            return {
              searchParams: inMemorySearchParams,
            };
          }
          return {
            searchParams,
          };
      }
    })(),
    setSearchParams,
    addSearchParamsToPath,
  };
}
