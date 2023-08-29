import { useCallback, useRef } from 'react';

import { APIFunction } from '../../models/Utils';
import { useAPIService } from './APIService';

/**
 * Hook that can be used to mutate a record.
 *
 * @param mutateFunction The function that will be used to mutate the data.
 * @returns The record mutation state.
 */
export const useMutation = <MutateFunction extends APIFunction>(
  mutateFunction: MutateFunction
) => {
  const {
    load: baseMutate,
    loading: mutating,
    record: mutatedRecord,
    loaded: mutated,
    setLoaded: setMutated,
    ...rest
  } = useAPIService<Awaited<ReturnType<MutateFunction>> | null>(null);

  const inputMutateRef = useRef(mutateFunction);
  inputMutateRef.current = mutateFunction;

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
