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

export interface UseRecordOptions<LoadableRecord> extends UseQueryOptions {
  defaultValue?: LoadableRecord;
}

export const useRecord = <LoadableRecord>(
  recordFinder?: TAPIFunction<LoadableRecord>,
  {
    defaultValue,
    key,
    loadOnMount = true,
    autoSync = true,
  }: UseRecordOptions<LoadableRecord> = {}
) => {
  // Refs
  const isInitialMountRef = useRef(true);
  const nextSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordFinderRef = useRef(recordFinder);
  useEffect(() => {
    recordFinderRef.current = recordFinder;
  }, [recordFinder]);

  const {
    load: baseLoad,
    loading,
    errorMessage,
    busy,
    record,
    setRecord,
    ...rest
  } = useAPIService(defaultValue!, key, loadOnMount);

  const load = useCallback(
    (...args: any) => {
      return baseLoad(() => {
        if (recordFinderRef.current) {
          return recordFinderRef.current(...args);
        }
        return Promise.resolve();
      });
    },
    [baseLoad]
  ) as NonNullable<typeof recordFinder>;

  const poll = useCallback(() => {
    return baseLoad(recordFinderRef.current, undefined, true);
  }, [baseLoad]);

  useEffect(() => {
    if (loadOnMount && isInitialMountRef.current) {
      load();
    }
  }, [load, loadOnMount]);

  useEffect(() => {
    if (autoSync && !busy && !loading && !errorMessage) {
      let blurTime: number;
      const mouseMoveEventCallback = () => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        nextSyncTimeoutRef.current = setTimeout(() => {
          poll();
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
            poll();
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
  }, [autoSync, busy, errorMessage, loading, poll]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return {
    load,
    loading,
    errorMessage,
    record: record ?? null,
    setRecord: setRecord as Dispatch<SetStateAction<LoadableRecord | null>>,
    busy,
    ...rest,
  };
};

export const useRecords = <LoadableRecord>(
  recordFinder?: TAPIFunction<LoadableRecord[]>,
  { ...inputRest }: UseQueryOptions = {}
) => {
  const { record, setRecord, ...rest } = useRecord(recordFinder, {
    defaultValue: [],
    ...inputRest,
  });

  return {
    records: record!,
    setRecords: setRecord as Dispatch<SetStateAction<LoadableRecord[]>>,
    ...rest,
  };
};

export interface RecordFinderRequestController {
  cancelRequest: () => void;
}

export type PaginatedRecordsFinderOptions = PaginatedRequestParams & {
  getRequestController?: (controller: RecordFinderRequestController) => void;
};

export type PaginatedRecordsFinder<T> = (
  options: PaginatedRecordsFinderOptions
) => Promise<PaginatedResponseData<T>>;

export interface UsePaginatedRecordsOptions<T = any>
  extends PaginatedRequestParams,
    UseQueryOptions {
  revalidationKey?: string;
  loadedPagesMap?: Map<number, T[]>;
}

export const usePaginatedRecords = <T>(
  recordFinder: PaginatedRecordsFinder<T>,
  {
    key,
    loadOnMount = true,
    limit = 100,
    offset = 0,
    searchTerm,
    showRecords = true,
    loadedPagesMap,
    revalidationKey,
    autoSync = true,
  }: UsePaginatedRecordsOptions<T> = {}
) => {
  // Refs
  const isInitialMountRef = useRef(true);
  const pendingRecordRequestControllers = useRef<
    RecordFinderRequestController[]
  >([]);
  const recordFinderRef = useRef(recordFinder);
  const loadedPagesMapRef = useRef(loadedPagesMap);
  const recordsTotalCountRef = useRef(0);
  const hasNextPageRef = useRef(true);
  const limitRef = useRef(limit);
  const offsetRef = useRef(offset);
  useEffect(() => {
    recordFinderRef.current = recordFinder;
    loadedPagesMapRef.current = loadedPagesMap;
    limitRef.current = limit;
    offsetRef.current = offset;
  }, [limit, loadedPagesMap, offset, recordFinder]);

  const {
    load: loadFromAPIService,
    loading,
    record: responseData,
    reset: baseReset,
    ...rest
  } = useAPIService<PaginatedResponseData<T> | null>(
    null,
    (() => {
      if (key) {
        return `${key}_${limit}_${offset}_${String(showRecords)}`;
      }
    })(),
    loadOnMount
  );

  const loadedPages = useMemo(() => {
    return loadedPagesMapRef.current || new Map<number, T[]>();
  }, []);

  const load = useCallback(
    (params: PaginatedRequestParams = {}) => {
      revalidationKey; // Triggering reload whenever extra parameters change
      params = { ...params };
      params.offset || (params.offset = offsetRef.current);
      params.limit || (params.limit = limit);
      params.searchTerm || (params.searchTerm = searchTerm);
      return loadFromAPIService(async () => {
        const localPendingRecordRequestControllers: RecordFinderRequestController[] =
          [];
        const responseData = await recordFinderRef
          .current({
            ...params,
            getRequestController: (requestController) => {
              localPendingRecordRequestControllers.push(requestController);
              pendingRecordRequestControllers.current.push(requestController);
            },
          })
          .finally(() => {
            if (localPendingRecordRequestControllers.length > 0) {
              localPendingRecordRequestControllers.forEach(
                (requestController) => {
                  if (
                    pendingRecordRequestControllers.current.indexOf(
                      requestController
                    )
                  ) {
                    pendingRecordRequestControllers.current.splice(
                      pendingRecordRequestControllers.current.indexOf(
                        requestController
                      ),
                      1
                    );
                  }
                }
              );
            }
          });

        const { records, recordsTotalCount } = responseData;
        loadedPages.set(params.offset!, records);
        const allPageRecords = [...loadedPages.keys()]
          .sort((a, b) => a - b)
          .map((key) => loadedPages.get(key)!)
          .flat();
        recordsTotalCountRef.current = recordsTotalCount;
        hasNextPageRef.current = allPageRecords.length < recordsTotalCount;
        return responseData;
      });
    },
    [limit, loadFromAPIService, loadedPages, revalidationKey, searchTerm]
  );

  const loadNextPage = useCallback(
    (params?: Omit<PaginatedRequestParams, 'limit' | 'offset'>) => {
      if (!loading && hasNextPageRef.current) {
        const lastPageOffset = [...loadedPages.keys()].sort((a, b) => b - a)[0];
        const lastPageRecords = loadedPages.get(lastPageOffset);
        if (lastPageRecords && lastPageOffset != null) {
          load({
            ...params,
            offset: lastPageOffset + lastPageRecords.length,
            limit: limit || lastPageRecords.length,
          });
        }
      }
    },
    [limit, load, loadedPages, loading]
  );

  const resetRef = useRef(() => {
    loadedPages.clear();
    recordsTotalCountRef.current = 0;
    hasNextPageRef.current = true;
    const requestControllersToClear = [
      ...pendingRecordRequestControllers.current,
    ];
    requestControllersToClear.forEach((pendingRecordRequestController) => {
      pendingRecordRequestController.cancelRequest();
    });
    requestControllersToClear.forEach((pendingRecordRequestController) => {
      if (
        pendingRecordRequestControllers.current.includes(
          pendingRecordRequestController
        )
      ) {
        pendingRecordRequestControllers.current.splice(
          pendingRecordRequestControllers.current.indexOf(
            pendingRecordRequestController
          ),
          1
        );
      }
    });
    baseReset; // Run to reset completely
  });

  useEffect(() => {
    if (autoSync && (loadOnMount || !isInitialMountRef.current)) {
      resetRef.current();
      load();
    }
  }, [autoSync, load, loadOnMount]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return {
    currentPageRecords: loadedPages.get(offset) || [],
    allPageRecords: [...loadedPages.keys()]
      .sort((a, b) => a - b)
      .map((key) => loadedPages.get(key)!)
      .flat(),
    recordsTotalCount: recordsTotalCountRef.current,
    loadedPages,
    load,
    loading,
    loadNextPage,
    responseData,
    reset: resetRef.current,
    ...rest,
  };
};
