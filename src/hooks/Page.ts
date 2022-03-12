import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setPageTitle } from '../redux';

export const usePageTitle = (pageTitle: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle(pageTitle));
  }, [dispatch, pageTitle]);
};
