import { APIFunction } from '../../models/Utils';
import { useMutation } from './Mutation';

export const useCreate = <CreateFunction extends APIFunction>(
  inputCreate: CreateFunction
) => {
  const {
    mutate: create,
    mutating: creating,
    mutated: created,
    setMutated: setCreated,
    mutatedRecord: createdRecord,
    ...rest
  } = useMutation(inputCreate);

  return {
    create,
    creating,
    created,
    setCreated,
    createdRecord,
    ...rest,
  };
};
