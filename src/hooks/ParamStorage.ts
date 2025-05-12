import '@infinite-debugger/rmk-js-extensions/RegExp';

import { diff } from '@infinite-debugger/rmk-utils/data';
import { addSearchParams } from '@infinite-debugger/rmk-utils/paths';
import hashIt from 'hash-it';
import { pick } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  InferType,
  object,
  ObjectSchema,
  ObjectShape,
  TypeFromShape,
} from 'yup';

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

export type AddSearchParamsToPathOptions = {
  ignoreUnspecifiedParams?: boolean;
  id?: string;
};

export type AddSearchParamsToPath<SearchParams = BaseSearchParams> = (
  pathname: string,
  searchParams?: SearchParams,
  options?: AddSearchParamsToPathOptions
) => string;

export function useParamStorage<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = InferType<
    ObjectSchema<TypeFromShape<ValidationSpec, unknown>>
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

export function useParamStorage(options: {
  mode?: 'string';
  paramStorage?: ParamStorage;
}): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
  addSearchParamsToPath: AddSearchParamsToPath;
};

export function useParamStorage(): {
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
  addSearchParamsToPath: AddSearchParamsToPath;
};

export function useParamStorage<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = InferType<
    ObjectSchema<TypeFromShape<ValidationSpec, unknown>>
  >
>({
  mode = 'string',
  spec,
  id,
  paramStorage = 'url',
  clearSearchStateOnUnmount = false,
  ignoreUnspecifiedParams: ignoreUnspecifiedParamsProp = false,
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

  const baseSetSearchParamsRef = useRef(baseSetSearchParams);
  baseSetSearchParamsRef.current = baseSetSearchParams;
  const specRef = useRef(spec);
  specRef.current = spec;
  const jsonSearchParamsCacheRef = useRef<any>({});

  const getSearchParams = useCallback(
    (
      searchParams: BaseSearchParams,
      ignoreUnspecifiedParams = ignoreUnspecifiedParamsProp,
      localHashedId = hashedId
    ) => {
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
            return inMemorySearchParams;
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
                    if (localHashedId) {
                      return `${key}:${localHashedId}`;
                    }
                    return key;
                  })();
                  if (searchParams[key] == null) {
                    accumulator[searchParamKey] = searchParams[key];
                  } else {
                    try {
                      if (
                        object({
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
                          `useParamStorage: search param getter `,
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
        nextSearchParams:
          paramStorage === 'memory'
            ? (combinedSearchParams as Record<string, string>)
            : Object.keys(combinedSearchParams)
                .filter((key) => {
                  return (
                    combinedSearchParams[key] != null &&
                    combinedSearchParams[key]!.length > 0
                  );
                })
                .reduce<Record<string, string>>((accumulator, key) => {
                  accumulator[key] = combinedSearchParams[key]!;
                  return accumulator;
                }, {}),
      };
    },
    [
      hashedId,
      ignoreUnspecifiedParamsProp,
      inMemorySearchParams,
      mode,
      paramStorage,
    ]
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
            setInMemorySearchParams((prevSearchParams) => {
              const removedKeys = Object.entries(nextSearchParams)
                .filter(([, value]) => {
                  return value == null;
                })
                .map(([key]) => key);
              return {
                ...Object.fromEntries(
                  Object.entries(prevSearchParams).filter(
                    ([key]) => !removedKeys.includes(key)
                  )
                ),
                ...Object.fromEntries(
                  Object.entries(nextSearchParams).filter(
                    ([key]) => !removedKeys.includes(key)
                  )
                ),
              };
            });
            break;
        }
      }
    },
    [getSearchParams, paramStorage]
  );

  const addSearchParamsToPath = useCallback<AddSearchParamsToPath>(
    (
      pathname,
      searchParams = {},
      {
        ignoreUnspecifiedParams = ignoreUnspecifiedParamsProp,
        id: localId = id,
      } = {}
    ) => {
      return addSearchParams(
        pathname,
        getSearchParams(
          searchParams,
          ignoreUnspecifiedParams,
          (() => {
            if (localId) {
              return hashIt(localId).toString(36).slice(0, 3);
            }
          })()
        ).nextSearchParams
      );
    },
    [getSearchParams, id, ignoreUnspecifiedParamsProp]
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
                        object({
                          [objectKey]: spec![objectKey],
                        }).validateSync(searchParamsObject)
                      );
                    } catch (err: any) {
                      if (err.name === 'ValidationError') {
                        console.error(
                          `useParamStorage: search param getter `,
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
