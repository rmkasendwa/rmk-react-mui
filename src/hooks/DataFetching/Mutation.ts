import { useCallback, useRef } from 'react';

import { APIFunction } from '../../models/Utils';
import { useAPIService } from './APIService';

export const useMutation = <MutateFunction extends APIFunction>(
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
  inputMutateRef.current = inputMutate;

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
