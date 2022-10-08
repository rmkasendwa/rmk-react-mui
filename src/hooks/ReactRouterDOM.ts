import { useSearchParams } from 'react-router-dom';

import { useSetSearchParam } from './Utils';

export const useReactRouterDOMSearchParams = () => {
  const [searchParams, baseSetSearchParams] = useSearchParams();
  const { setSearchParams } = useSetSearchParam(baseSetSearchParams);

  return {
    searchParams,
    setSearchParams,
  };
};
