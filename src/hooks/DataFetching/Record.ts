import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { APIFunction } from '../../models/Utils';
import { useAPIService } from './APIService';
import { QueryOptions } from './models';

export interface RecordProps<LoadableRecord> extends QueryOptions {
  /**
   * The default value that will be used for the record.
   */
  defaultValue?: LoadableRecord;
}

/**
 * Hook that can be used to find a record.
 *
 * @param recordFinder The API function that will be used to find the record.
 * @param inProps The options for the hook.
 * @returns The record state.
 */
export const useRecord = <LoadableRecord>(
  recordFinder?: APIFunction<LoadableRecord>,
  inProps: RecordProps<LoadableRecord> = {}
) => {
  const { defaultValue, loadOnMount = true, revalidationKey } = inProps;

  //#region Refs
  const isInitialMountRef = useRef(true);
  const recordFinderRef = useRef(recordFinder);
  recordFinderRef.current = recordFinder;
  //#endregion

  const {
    load: baseLoad,
    loading,
    errorMessage,
    record,
    setRecord,
    ...rest
  } = useAPIService(defaultValue, loadOnMount);

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
    record: record ?? null,
    setRecord: setRecord as Dispatch<SetStateAction<LoadableRecord | null>>,
    ...rest,
  };
};
