import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

/**
 * Hook that can be used to create a record.
 *
 * @param createFunction The API function that will be used to create the record.
 * @returns The record creation state.
 */
export const useCreate = <CreateFunction extends APIFunction>(
  createFunction: CreateFunction
) => {
  const {
    mutate: create,
    mutating: creating,
    mutated: created,
    setMutated: setCreated,
    mutatedRecord: createdRecord,
    ...rest
  } = useMutation(createFunction);

  return {
    create,
    creating,
    created,
    setCreated,
    createdRecord,
    ...rest,
  };
};
