import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

/**
 * Hook that can be used to delete a record.
 *
 * @param deleteFunction The API function that will be used to delete the record.
 * @returns The record deletion state.
 */
export const useDelete = <DeleteFunction extends APIFunction>(
  deleteFunction: DeleteFunction
) => {
  const {
    mutate: _delete,
    mutating: deleting,
    mutated: deleted,
    setMutated: setDeleted,
    mutatedRecord: deletedRecord,
    ...rest
  } = useMutation(deleteFunction);

  return {
    _delete,
    deleting,
    deleted,
    setDeleted,
    deletedRecord,
    ...rest,
  };
};
