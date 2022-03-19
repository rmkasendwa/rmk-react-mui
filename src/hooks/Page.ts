import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setPageTitle } from '../redux';

export const usePageTitle = (pageTitle: string) => {
  const dispatch = useDispatch();
  const [localPageTitle, setLocalPageTitle] = useState(pageTitle);

  useEffect(() => {
    dispatch(setPageTitle(localPageTitle));
  }, [dispatch, localPageTitle]);

  return {
    setPageTitle: setLocalPageTitle,
  };
};
