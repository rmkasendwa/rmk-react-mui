import { useSearchParams } from 'react-router-dom';

import { useSetSearchParam } from './Paths';

export const useReactRouterDOMSearchParams = () => {
  const [searchParams, baseSetSearchParams] = useSearchParams();
  const { setSearchParams } = useSetSearchParam(baseSetSearchParams);

  return {
    searchParams,
    setSearchParams,
  };
};
