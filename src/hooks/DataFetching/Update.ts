import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

export const useUpdate = <UpdateFunction extends APIFunction>(
  inputUpdate: UpdateFunction
) => {
  const {
    mutate: update,
    mutating: updating,
    mutated: updated,
    setMutated: setUpdated,
    mutatedRecord: updatedRecord,
    ...rest
  } = useMutation(inputUpdate);

  return {
    update,
    updating,
    updated,
    updatedRecord,
    setUpdated,
    ...rest,
  };
};
