import hashIt from 'hash-it';
import omit from 'lodash/omit';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useLocalStorageData } from '../../contexts/LocalStorageDataContext';
import {
  PaginatedRequestParams,
  PaginatedResponseData,
  RecordFinderRequestController,
} from '../../models/Utils';
import { usePolling } from '../Polling';
import { useAPIService } from './APIService';
import { GetStaleWhileRevalidateFunction, QueryOptions } from './models';

export type PaginatedRecordsFinderOptions<
  PaginatedResponseDataExtensions extends Record<string, any> = any
> = PaginatedRequestParams & {
  /**
   * Function that can be used to retrieve the request controller of the data request.
   *
   * @param controller The request controller that can be used to cancel the request.
   */
  getRequestController?: (controller: RecordFinderRequestController) => void;

  /**
   * Function that can be used to retrieve stale data while the request is being made.
   */
  getStaleWhileRevalidate?: GetStaleWhileRevalidateFunction<any>;

  /**
   * The last loaded page.
   */
  lastLoadedPage?: ResponsePage<any, PaginatedResponseDataExtensions>;

  /**
   * Whether the request is loading the next page.
   */
  isLoadingNextPage?: boolean;
};

export type ResponsePage<
  DataRow,
  PaginatedResponseDataExtensions extends Record<string, any> = any
> = PaginatedResponseData<DataRow> & PaginatedResponseDataExtensions;

export type PaginatedRecordsFinder<
  DataRow,
  PaginatedResponseDataExtensions extends Record<string, any> = any
> = (
  options: PaginatedRecordsFinderOptions<PaginatedResponseDataExtensions>
) => Promise<
  ResponsePage<DataRow, PaginatedResponseDataExtensions> | DataRow[]
>;

export const PAGINATION_RECORDS_BASE_REFRESH_INTERVAL = 5000;

export interface PaginatedRecordsProps<DataRow = any>
  extends PaginatedRequestParams,
    QueryOptions {
  /**
   * The revalidation key. If revalidationKey changes and autoSync is set to true. The records will synchronize
   */
  revalidationKey?: string;

  /**
   * The default loaded pages map. This can be used to cache the loaded pages.
   */
  loadedPagesMap?: Map<number, DataRow[]>;

  /**
   * Whether the next page can be loaded.
   */
  canLoadNextPage?: boolean;

  /**
   * The refresh interval in milliseconds. If set, the records will be refreshed every refreshInterval milliseconds.
   */
  refreshInterval?: number;
}

/**
 * Hook that can be used to find paginated records.
 *
 * @param recordFinder The function that will be used to find the records.
 * @param inProps The options for the hook.
 * @returns The records loading state.
 */
export const usePaginatedRecords = <
  DataRow,
  PaginatedResponseDataExtensions extends Record<string, any>
>(
  recordFinder: PaginatedRecordsFinder<
    DataRow,
    PaginatedResponseDataExtensions
  >,
  inProps: PaginatedRecordsProps<DataRow> = {}
) => {
  const {
    loadOnMount = true,
    limit = 100,
    offset = 0,
    searchTerm,
    loadedPagesMap,
    revalidationKey,
    autoSync = true,
    canLoadNextPage = true,
    refreshInterval,
  } = inProps;

  const {
    load: loadFromAPIService,
    loading,
    record: responseData,
    reset: baseReset,
    errorMessage,
    setRecord,
    ...rest
  } = useAPIService<PaginatedResponseData<DataRow> | null>(null, loadOnMount);

  const cacheKey = String(
    hashIt({ ...omit(inProps, 'loadedPagesMap'), recordFinder })
  );
  const { data, updateData } = useLocalStorageData();
  const cachedLoadedPagesRef = useRef<{ key: number; value: DataRow[] }[]>(
    data[cacheKey]
  );

  //#region Ref
  const isInitialMountRef = useRef(true);
  const pendingRecordRequestControllers = useRef<
    RecordFinderRequestController[]
  >([]);
  const recordFinderRef = useRef(recordFinder);
  recordFinderRef.current = recordFinder;
  const loadedPagesMapRef = useRef(loadedPagesMap);
  loadedPagesMapRef.current = loadedPagesMap;
  const recordsTotalCountRef = useRef(0);
  const hasNextPageRef = useRef(true);
  const limitRef = useRef(limit);
  limitRef.current = limit;
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const loadedPages = useMemo(() => {
    if (loadedPagesMapRef.current) {
      return loadedPagesMapRef.current;
    }

    const loadedPagesMap = new Map<number, DataRow[]>();
    if (cachedLoadedPagesRef.current) {
      cachedLoadedPagesRef.current.forEach((cachedLoadedPage) => {
        loadedPagesMap.set(cachedLoadedPage.key, cachedLoadedPage.value);
      });
    }
    return loadedPagesMap;
  }, []);

  const allPageRecordsRef = useRef<DataRow[]>(
    (() => {
      if (isInitialMountRef.current) {
        return [...loadedPages.keys()]
          .sort((a, b) => a - b)
          .map((key) => loadedPages.get(key)!)
          .flat();
      }
      return [];
    })()
  );

  const lastLoadedPageRef = useRef<
    ResponsePage<DataRow, PaginatedResponseDataExtensions> | undefined
  >(undefined);
  //#endregion

  const load = useCallback(
    (
      params: PaginatedRequestParams & {
        isLoadingNextPage?: boolean;
      } = {}
    ) => {
      params = { ...params };
      params.offset || (params.offset = offsetRef.current);
      params.limit || (params.limit = limitRef.current);
      params.searchTerm || (params.searchTerm = searchTermRef.current);
      params.isLoadingNextPage ?? (params.isLoadingNextPage = false);

      if (!params.isLoadingNextPage) {
        lastLoadedPageRef.current = undefined;
      }
      return loadFromAPIService(async () => {
        const localPendingRecordRequestControllers: RecordFinderRequestController[] =
          [];

        const processResponseData = (
          responseData:
            | ResponsePage<DataRow, PaginatedResponseDataExtensions>
            | DataRow[]
        ) => {
          const isResponsePaginated =
            'records' in responseData && responseData.recordsTotalCount != null;
          const paginatedResponseData = (() => {
            if (Array.isArray(responseData)) {
              return {
                records: responseData,
                recordsTotalCount: responseData.length,
                hasNextPage: false,
                loadedPageKey: 0,
              } as ResponsePage<DataRow, PaginatedResponseDataExtensions>;
            }
            if (responseData.recordsTotalCount == null) {
              return {
                ...responseData,
                hasNextPage: false,
                loadedPageKey: 0,
              };
            }
            return responseData;
          })();

          const { records, recordsTotalCount, hasNextPage, loadedPageKey } =
            paginatedResponseData;

          if (!isResponsePaginated) {
            loadedPages.clear();
          }

          loadedPages.set(loadedPageKey ?? params.offset!, records);

          allPageRecordsRef.current = [...loadedPages.keys()]
            .sort((a, b) => a - b)
            .map((key) => loadedPages.get(key)!)
            .flat();
          lastLoadedPageRef.current = paginatedResponseData;
          recordsTotalCountRef.current = recordsTotalCount ?? records.length;
          hasNextPageRef.current = (() => {
            if (hasNextPage != null) {
              return hasNextPage;
            }
            return (
              isResponsePaginated &&
              allPageRecordsRef.current.length < recordsTotalCountRef.current
            );
          })();
          setRecord(paginatedResponseData);
          updateData({
            [cacheKey]: [...loadedPages.entries()].map(([key, value]) => ({
              key,
              value,
            })),
          });
        };

        const responseData = await recordFinderRef
          .current({
            ...params,
            getRequestController: (requestController) => {
              localPendingRecordRequestControllers.push(requestController);
              pendingRecordRequestControllers.current.push(requestController);
            },
            getStaleWhileRevalidate: (data) => {
              processResponseData(data);
            },
            lastLoadedPage: lastLoadedPageRef.current,
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

        if (!params.isLoadingNextPage) {
          loadedPages.clear();
          recordsTotalCountRef.current = 0;
        }

        processResponseData(responseData);
        return responseData;
      });
    },
    [cacheKey, loadFromAPIService, loadedPages, setRecord, updateData]
  );
  const loadRef = useRef(load);
  loadRef.current = load;

  const loadNextPage = useCallback(
    (params?: Omit<PaginatedRequestParams, 'limit' | 'offset'>) => {
      if (canLoadNextPage && !loading && hasNextPageRef.current) {
        const lastPageOffset = [...loadedPages.keys()].sort((a, b) => b - a)[0];
        const lastPageRecords = loadedPages.get(lastPageOffset);
        if (lastPageRecords && lastPageOffset != null) {
          load({
            ...params,
            offset: lastPageOffset + lastPageRecords.length,
            limit: limit || lastPageRecords.length,
            isLoadingNextPage: true,
          });
        }
      }
    },
    [canLoadNextPage, limit, load, loadedPages, loading]
  );

  const resetRef = useRef(() => {
    loadedPages.clear();
    recordsTotalCountRef.current = 0;
    hasNextPageRef.current = true;
    lastLoadedPageRef.current = undefined;
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
    if (
      !isInitialMountRef.current &&
      (limit || searchTerm || revalidationKey)
    ) {
      resetRef.current();
    }
  }, [limit, revalidationKey, searchTerm]);

  useEffect(() => {
    if (loadOnMount && isInitialMountRef.current) {
      loadRef.current();
    }
  }, [loadOnMount]);

  useEffect(() => {
    if (
      !isInitialMountRef.current &&
      autoSync &&
      (limit || searchTerm || offset || revalidationKey)
    ) {
      loadRef.current();
    }
  }, [autoSync, limit, offset, revalidationKey, searchTerm]);

  usePolling({
    load,
    autoSync,
    errorMessage,
    loading,
    refreshInterval,
  });

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return {
    currentPageRecords: loadedPages.get(offset) || [],
    allPageRecords: allPageRecordsRef.current,
    recordsTotalCount: recordsTotalCountRef.current,
    loadedPages,
    load,
    loading,
    loadNextPage,
    responseData,
    reset: resetRef.current,
    hasNextPage: hasNextPageRef.current,
    errorMessage,
    ...rest,
  };
};
