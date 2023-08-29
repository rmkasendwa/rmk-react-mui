import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

export const useDelete = <DeleteFunction extends APIFunction>(
  inputDelete: DeleteFunction
) => {
  const {
    mutate: _delete,
    mutating: deleting,
    mutated: deleted,
    setMutated: setDeleted,
    mutatedRecord: deletedRecord,
    ...rest
  } = useMutation(inputDelete);

  return {
    _delete,
    deleting,
    deleted,
    setDeleted,
    deletedRecord,
    ...rest,
  };
};
