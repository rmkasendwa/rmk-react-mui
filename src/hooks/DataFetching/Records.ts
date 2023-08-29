import { Dispatch, SetStateAction } from 'react';

import { APIFunction } from '../../models/Utils';
import { QueryOptions } from './models';
import { useRecord } from './Record';

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
