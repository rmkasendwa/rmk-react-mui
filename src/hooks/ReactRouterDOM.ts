import '@infinite-debugger/rmk-js-extensions/RegExp';

import { diff } from '@infinite-debugger/rmk-utils/data';
import { pick } from 'lodash';
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

export function useReactRouterDOMSearchParams<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = Yup.InferType<
    OptionalObjectSchema<ValidationSpec, AnyObject, TypeOfShape<ValidationSpec>>
  >
>(options: {
  mode: 'json';
  spec: ValidationSpec;
  id?: string;
}): {
  searchParams: Partial<SearchParamsObject>;
  setSearchParams: SetSearchParams<
    Partial<{
      [K in keyof SearchParamsObject]: SearchParamsObject[K] | null;
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

export function useReactRouterDOMSearchParams<
  ValidationSpec extends ObjectShape,
  SearchParamsObject = Yup.InferType<
    OptionalObjectSchema<ValidationSpec, AnyObject, TypeOfShape<ValidationSpec>>
  >
>({
  mode = 'string',
  spec,
  id,
}: {
  mode?: 'string' | 'json';
  spec?: ValidationSpec;
  id?: string;
} = {}) {
  const [searchParams, baseSetSearchParams] = useSearchParams();
  const baseSetSearchParamsRef = useRef(baseSetSearchParams);
  const specRef = useRef(spec);
  const jsonSearchParamsCacheRef = useRef<any>({});
  useEffect(() => {
    baseSetSearchParamsRef.current = baseSetSearchParams;
    specRef.current = spec;
  }, [baseSetSearchParams, spec]);

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
                        `useReactRouterDOMSearchParams: search param getter setter `,
                        err,
                        {
                          err,
                        }
                      );
                    }
                  }
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
          const validSearchParamKeys = Object.keys(spec!);
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
            searchParams: (() => {
              const nextSearchParams = Object.keys(allSearchParams).reduce(
                (accumulator, key) => {
                  const objectKey = (() => {
                    if (id) {
                      return key.replace(
                        new RegExp(`:${RegExp.escape(id)}$`),
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
          return {
            searchParams,
          };
      }
    })(),
    setSearchParams,
  };
}
