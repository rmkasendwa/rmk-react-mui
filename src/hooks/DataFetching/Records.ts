import { Dispatch, SetStateAction } from 'react';

import { APIFunction } from '../../models/Utils';
import { QueryOptions } from './models';
import { useRecord } from './Record';

/**
 * Hook that can be used to find records.
 *
 * @param recordFinder The function that will be used to find the records.
 * @param param1 The options for the hook.
 * @returns The records loading state.
 */
export const useRecords = <LoadableRecord>(
  recordFinder?: APIFunction<LoadableRecord[]>,
  { ...inputRest }: QueryOptions = {}
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
