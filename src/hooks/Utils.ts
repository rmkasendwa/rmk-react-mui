import { pick } from 'lodash';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CANCELLED_API_REQUEST_MESSAGE } from '../constants';
import { APIContext } from '../contexts/APIContext';
import { useCachedData } from '../contexts/DataStoreContext';
import {
  PaginatedRequestParams,
  PaginatedResponseData,
  TAPIFunction,
  TaggedAPIRequest,
} from '../interfaces/Utils';

export interface UseQueryOptions {
  key?: string;
  loadOnMount?: boolean;
  autoSync?: boolean;
}

const DEFAULT_SYNC_TIMEOUT = 5 * 60 * 1000;
const WINDOW_BLUR_THRESHOLD = 60 * 1000;

export const useAPIService = <T>(
  defaultValue: T,
  key?: string,
  loadOnMount = false
) => {
  const baseDefaultValue = defaultValue;
  const isComponentMountedRef = useRef(true);
  const taggedAPIRequestsRef = useRef<TaggedAPIRequest[]>([]);
  const { data, updateData } = useCachedData();
  if (key && data[key]) {
    defaultValue = data[key];
  }
  const { call } = useContext(APIContext);
  const [record, setRecord] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(loadOnMount);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (key && data[key] && isComponentMountedRef.current) {
      setRecord(data[key]);
    }
  }, [data, key]);

  const load = useCallback(
    async (apiFunction?: TAPIFunction, tag?: string, polling = false) => {
      if (apiFunction) {
        setErrorMessage('');
        setLoaded(false);
        setLoading(true);
        const taggedAPIRequest = (() => {
          if (tag) {
            return {
              id: tag,
              loading: true,
            } as TaggedAPIRequest;
          }
        })();
        taggedAPIRequest && taggedAPIRequestsRef.current.push(taggedAPIRequest);
        const response = await call(() => (apiFunction as TAPIFunction)())
          .then(async (payload) => {
            const response = await payload;
            if (response != null) {
              if (isComponentMountedRef.current) {
                setRecord(response);
              }
              if (key) {
                updateData({
                  [key]: response,
                });
              }
            }
            if (isComponentMountedRef.current) {
              setLoaded(true);
            }
            return payload;
          })
          .catch((err) => {
            if (
              !String(err.message).match(CANCELLED_API_REQUEST_MESSAGE) &&
              !polling
            ) {
              setErrorMessage(err.message);
            }
          });
        if (
          taggedAPIRequest &&
          taggedAPIRequestsRef.current.includes(taggedAPIRequest)
        ) {
          taggedAPIRequestsRef.current.splice(
            taggedAPIRequestsRef.current.indexOf(taggedAPIRequest),
            1
          );
        }
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
        return response;
      }
    },
    [call, key, updateData]
  );

  const resetRef = useRef(() => {
    setRecord(baseDefaultValue);
    setLoaded(false);
    setLoading(loadOnMount);
    setBusy(false);
    setErrorMessage('');
  });

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  return {
    errorMessage,
    setErrorMessage,
    load,
    loaded,
    loading,
    record,
    setLoaded,
    setRecord,
    busy,
    setBusy,
    taggedAPIRequests: taggedAPIRequestsRef.current,
    reset: resetRef.current,
  };
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export const useMutation = <MutateFunction extends TAPIFunction>(
  inputMutate: MutateFunction
) => {
  const {
    load: baseMutate,
    loading: mutating,
    record: mutatedRecord,
    loaded: mutated,
    setLoaded: setMutated,
    ...rest
  } = useAPIService<Awaited<ReturnType<MutateFunction>> | null>(null);

  const inputMutateRef = useRef(inputMutate);
  useEffect(() => {
    inputMutateRef.current = inputMutate;
  }, [inputMutate]);

  const mutate = useCallback(
    (...args: any) => {
      return baseMutate(() => inputMutateRef.current(...args));
    },
    [baseMutate]
  ) as MutateFunction;

  return {
    mutate,
    mutating,
    mutated,
    setMutated,
    mutatedRecord,
    ...rest,
  };
};

export const useCreate = <CreateFunction extends TAPIFunction>(
  inputCreate: CreateFunction
) => {
  const {
    mutate: create,
    mutating: creating,
    mutated: created,
    setMutated: setCreated,
    mutatedRecord: createdRecord,
    ...rest
  } = useMutation(inputCreate);

  return {
    create,
    creating,
    created,
    setCreated,
    createdRecord,
    ...rest,
  };
};

export const useUpdate = <UpdateFunction extends TAPIFunction>(
  inputUpdate: UpdateFunction
) => {
  const { create, creating, created, createdRecord, setCreated, ...rest } =
    useCreate(inputUpdate);

  return {
    update: create,
    updating: creating,
    updated: created,
    updatedRecord: createdRecord,
    setUpdated: setCreated,
    ...rest,
  };
};

export const useDelete = <DeleteFunction extends TAPIFunction>(
  inputDelete: DeleteFunction
) => {
  const {
    mutate: _delete,
    mutating: deleting,
    mutated: deleted,
    setMutated: setDeleted,
    mutatedRecord: deletedRecord,
    ...rest
  } = useMutation(inputDelete);

  return {
    _delete,
    deleting,
    deleted,
    setDeleted,
    deletedRecord,
    ...rest,
  };
};

export interface UseRecordOptions<T> extends UseQueryOptions {
  defaultValue?: T;
}

export const useRecord = <T>(
  recordFinder: TAPIFunction<T>,
  {
    defaultValue,
    key,
    loadOnMount = true,
    autoSync = true,
  }: UseRecordOptions<T> = {}
) => {
  // Refs
  const nextSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordFinderRef = useRef(recordFinder);
  useEffect(() => {
    recordFinderRef.current = recordFinder;
  }, [recordFinder]);

  const {
    load: apiServiceLoad,
    loading,
    errorMessage,
    busy,
    record,
    setRecord,
    ...rest
  } = useAPIService(defaultValue!, key, loadOnMount);

  const load = useCallback(
    (polling = false) => {
      return apiServiceLoad(recordFinderRef.current, undefined, polling);
    },
    [apiServiceLoad]
  );

  useEffect(() => {
    loadOnMount && load();
  }, [load, loadOnMount]);

  useEffect(() => {
    if (autoSync && !busy && !loading && !errorMessage) {
      let blurTime: number;
      const mouseMoveEventCallback = () => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        nextSyncTimeoutRef.current = setTimeout(() => {
          load(true);
        }, DEFAULT_SYNC_TIMEOUT);
      };
      const visiblityChangeEventCallback = (event?: Event) => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        window.removeEventListener('mousemove', mouseMoveEventCallback);
        if (document.hidden) {
          blurTime = Date.now();
        } else {
          window.addEventListener('mousemove', mouseMoveEventCallback);
          mouseMoveEventCallback();
          if (
            event &&
            blurTime != null &&
            Date.now() - blurTime >= WINDOW_BLUR_THRESHOLD
          ) {
            load(true);
          }
        }
      };
      document.addEventListener(
        'visibilitychange',
        visiblityChangeEventCallback
      );
      visiblityChangeEventCallback();
      return () => {
        window.removeEventListener('mousemove', mouseMoveEventCallback);
        document.removeEventListener(
          'visibilitychange',
          visiblityChangeEventCallback
        );
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
      };
    }
  }, [autoSync, busy, errorMessage, load, loading]);

  return {
    load,
    loading,
    errorMessage,
    record: record ?? null,
    setRecord: setRecord as Dispatch<SetStateAction<T | null>>,
    busy,
    ...rest,
  };
};

export const useRecords = <T>(
  recordFinder: TAPIFunction<T[]>,
  { loadOnMount = true, autoSync = true, ...inputRest }: UseQueryOptions
) => {
  const { record, setRecord, ...rest } = useRecord(recordFinder, {
    defaultValue: [],
    loadOnMount,
    autoSync,
    ...inputRest,
  });

  return {
    records: record!,
    setRecords: setRecord as Dispatch<SetStateAction<T[]>>,
    ...rest,
  };
};

export interface UsePaginatedRecordsOptions
  extends PaginatedRequestParams,
    UseQueryOptions {
  revalidationKey?: string;
}

export const usePaginatedRecords = <T>(
  recordFinder: TAPIFunction<PaginatedResponseData<T>>,
  {
    key,
    loadOnMount = true,
    limit: limitProp = 100,
    offset: offsetProp = 0,
    showRecords: showRecordsProp = true,
    revalidationKey,
  }: UsePaginatedRecordsOptions = {}
) => {
  const recordFinderRef = useRef(recordFinder);
  useEffect(() => {
    recordFinderRef.current = recordFinder;
  }, [recordFinder]);

  const {
    load: loadFromAPIService,
    record: responseData,
    ...rest
  } = useAPIService<PaginatedResponseData<T> | null>(
    null,
    (() => {
      if (key) {
        return `${key}_${limitProp}_${offsetProp}_${String(showRecordsProp)}`;
      }
    })(),
    loadOnMount
  );

  const loadedPages = useMemo(() => {
    return new Map<string, T[]>();
  }, []);

  const [currentPageRecords, setCurrentPageRecords] = useState<T[]>([]);
  const [allPageRecords, setAllPageRecords] = useState<T[]>([]);
  const [recordsTotalCount, setRecordsTotalCount] = useState(0);

  const defaultPaginationParams = useMemo(() => {
    return {
      offset: offsetProp,
      limit: limitProp,
      showRecords: showRecordsProp,
    } as PaginatedRequestParams;
  }, [limitProp, offsetProp, showRecordsProp]);

  const [loadingPaginationParams, setLoadingPaginationParams] = useState(
    defaultPaginationParams
  );

  const load = useCallback(
    (params?: PaginatedRequestParams) => {
      revalidationKey; // Triggering reload whenever extra parameters change
      params = { ...params };
      params.offset || (params.offset = defaultPaginationParams.offset);
      params.limit || (params.limit = defaultPaginationParams.limit);
      setLoadingPaginationParams(pick(params, 'offset', 'limit'));
      return loadFromAPIService(async () => {
        const responseData = await recordFinderRef.current();
        const { records, recordsTotalCount } = responseData;
        setCurrentPageRecords(records);
        setRecordsTotalCount(recordsTotalCount);
        return responseData;
      });
    },
    [
      defaultPaginationParams.limit,
      defaultPaginationParams.offset,
      loadFromAPIService,
      revalidationKey,
    ]
  );

  useEffect(() => {
    if (responseData) {
      const pageKey = `${loadingPaginationParams.offset},${loadingPaginationParams.limit}`;
      loadedPages.set(pageKey, responseData.records);
      setAllPageRecords(
        [...loadedPages.keys()]
          .sort((a, b) => a.localeCompare(b))
          .map((key) => loadedPages.get(key)!)
          .flat()
      );
    }
  }, [
    loadingPaginationParams.limit,
    loadingPaginationParams.offset,
    loadedPages,
    responseData,
  ]);

  useEffect(() => {
    loadOnMount && load();
  }, [load, loadOnMount]);

  return {
    currentPageRecords,
    allPageRecords,
    setCurrentPageRecords,
    setAllPageRecords,
    recordsTotalCount,
    loadedPages,
    load,
    responseData,
    ...rest,
  };
};
