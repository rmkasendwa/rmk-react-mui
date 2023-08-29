import { useCallback, useEffect, useRef } from 'react';

import { RecordFinderRequestController } from '../../models/Utils';
import { useAPIService } from './APIService';
import { GetStaleWhileRevalidateFunction, QueryOptions } from './models';

export type CacheableDataFinderOptions = {
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
};

/**
 * Finds data from the cache or makes a request to the API.
 */
export type CacheableDataFinder<Data> = (
  options: CacheableDataFinderOptions
) => Promise<Data>;

export interface CacheableDataProps<Data> extends QueryOptions {
  /**
   * The default value of the data.
   */
  defaultValue?: Data;
}

/**
 * Hook that can be used to find data from the cache or make a request to the API.
 *
 * @param recordFinder The function that will be used to find the data.
 * @param options The options for the hook.
 * @returns The data and the functions to load it.
 */
export const useCacheableData = <Data>(
  recordFinder?: CacheableDataFinder<Data>,
  {
    defaultValue,
    loadOnMount = true,
    revalidationKey,
  }: CacheableDataProps<Data> = {}
) => {
  //#region Refs
  const isInitialMountRef = useRef(true);

  const recordFinderRef = useRef(recordFinder);
  recordFinderRef.current = recordFinder;

  const pendingDataRequestControllerRef =
    useRef<RecordFinderRequestController | null>(null);
  //#endregion

  const {
    load: baseLoad,
    loading,
    errorMessage,
    record,
    setRecord,
    ...rest
  } = useAPIService(defaultValue, loadOnMount);

  const load = useCallback(() => {
    return baseLoad(async () => {
      if (recordFinderRef.current) {
        if (pendingDataRequestControllerRef.current) {
          pendingDataRequestControllerRef.current.cancelRequest();
          pendingDataRequestControllerRef.current = null;
        }

        const responseData = await recordFinderRef
          .current({
            getRequestController: (requestController) => {
              pendingDataRequestControllerRef.current = requestController;
            },
            getStaleWhileRevalidate: (data) => {
              setRecord(data);
            },
          })
          .finally(() => {
            pendingDataRequestControllerRef.current = null;
          });

        return responseData;
      }
    });
  }, [baseLoad, setRecord]);

  useEffect(() => {
    if (loadOnMount && isInitialMountRef.current) {
      load();
    }
  }, [load, loadOnMount]);

  useEffect(() => {
    if (!isInitialMountRef.current && revalidationKey) {
      load();
    }
  }, [load, revalidationKey]);

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
    data: record,
    setData: setRecord,
    ...rest,
  };
};
