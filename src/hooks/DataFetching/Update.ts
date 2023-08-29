import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

/**
 * Hook that can be used to update a record.
 *
 * @param updateFunction The API function that will be used to update the record.
 * @returns The record update state.
 */
export const useUpdate = <UpdateFunction extends APIFunction>(
  updateFunction: UpdateFunction
) => {
  const {
    mutate: update,
    mutating: updating,
    mutated: updated,
    setMutated: setUpdated,
    mutatedRecord: updatedRecord,
    ...rest
  } = useMutation(updateFunction);

  return {
    update,
    updating,
    updated,
    updatedRecord,
    setUpdated,
    ...rest,
  };
};
