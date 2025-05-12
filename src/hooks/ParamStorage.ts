import '@infinite-debugger/rmk-js-extensions/RegExp';

import { diff } from '@infinite-debugger/rmk-utils/data';
import { addSearchParams } from '@infinite-debugger/rmk-utils/paths';
import hashIt from 'hash-it';
import { pick } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  InferType,
  object,
  ObjectSchema,
  ObjectShape,
  TypeFromShape,
} from 'yup';

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
>({
  spec,
  id,
  clearSearchStateOnUnmount = false,
}: {
  spec?: ValidationSpec;
  id?: string;
  clearSearchStateOnUnmount?: boolean;
} = {}): {
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
} {
  const hashedId = (() => {
    if (id) {
      return hashIt(id).toString(36).slice(0, 3);
    }
  })();

  const [inMemorySearchParams, setInMemorySearchParams] = useState<
    Record<string, string>
  >({});

  const specRef = useRef(spec);
  specRef.current = spec;
  const jsonSearchParamsCacheRef = useRef<any>({});

  const getSearchParams = useCallback(
    (searchParams: BaseSearchParams, localHashedId = hashedId) => {
      const existingSearchParams: Record<string, string> = inMemorySearchParams;

      const combinedSearchParams = {
        ...(() => {
          const keys = Object.keys(searchParams);
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
        })(),
      };

      return {
        existingSearchParams,
        nextSearchParams: combinedSearchParams as Record<string, string>,
      };
    },
    [hashedId, inMemorySearchParams]
  );

  const setSearchParams = useCallback<SetSearchParams>(
    (searchParams) => {
      const { existingSearchParams, nextSearchParams } =
        getSearchParams(searchParams);

      if (hashIt(nextSearchParams) !== hashIt(existingSearchParams)) {
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
      }
    },
    [getSearchParams]
  );

  const addSearchParamsToPath = useCallback<AddSearchParamsToPath>(
    (pathname, searchParams = {}, { id: localId = id } = {}) => {
      return addSearchParams(
        pathname,
        getSearchParams(
          searchParams,
          (() => {
            if (localId) {
              return hashIt(localId).toString(36).slice(0, 3);
            }
          })()
        ).nextSearchParams
      );
    },
    [getSearchParams, id]
  );

  useEffect(() => {
    if (specRef.current && clearSearchStateOnUnmount) {
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
  }, [clearSearchStateOnUnmount, setSearchParams]);

  return {
    ...(() => {
      const validSearchParamKeys = Object.keys(spec!);
      const allSearchParams = inMemorySearchParams;
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
    })(),
    setSearchParams: setSearchParams as SetSearchParams<
      Partial<{
        [K in keyof SearchParamsObject]: SearchParamsObject[K] | null;
      }>
    >,
    addSearchParamsToPath: addSearchParamsToPath as AddSearchParamsToPath<
      Partial<{
        [K in keyof SearchParamsObject]: SearchParamsObject[K] | null;
      }>
    >,
  };
}
