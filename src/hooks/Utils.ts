import { useMediaQuery, useTheme } from '@mui/material';
import { useFormikContext } from 'formik';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { APIContext, APIDataContext, LoadingContext } from '../contexts';
import { IAPI, IAPIFunction } from '../interfaces';
import { RootState, updateData } from '../redux';

export const useAPIService = <T>(defautValue: T, key?: string) => {
  const data = useSelector((state: RootState) => {
    const { data } = state;
    return data;
  });
  if (key && data[key]) {
    defautValue = data[key];
  }
  const { call }: IAPI = useContext(APIContext);
  const [record, setRecord] = useState<T>(defautValue);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const isComponentMountedRef = useRef(true);

  useEffect(() => {
    if (key && data[key] && isComponentMountedRef.current) {
      setRecord(data[key]);
    }
  }, [data, key]);

  const load = useCallback(
    async (apiFunction?: IAPIFunction) => {
      if (apiFunction) {
        setErrorMessage('');
        setLoaded(false);
        setLoading(true);
        const data = await call(() => (apiFunction as IAPIFunction)()).catch(
          (err) => {
            setErrorMessage(err.message);
          }
        );
        if (data) {
          if (isComponentMountedRef.current) {
            setRecord(data);
            setLoaded(true);
          }
          if (key) {
            dispatch(
              updateData({
                [key]: data,
              })
            );
          }
        }
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [call, key, dispatch]
  );

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  return {
    errorMessage,
    setErrorMessage,
    load,
    loaded,
    loading,
    record,
    setLoaded,
    setRecord,
  };
};

export const useCreate = <T>() => {
  const { load, loading, record, ...rest } = useAPIService<T | null>(null);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    setCreated(record != null);
  }, [record]);

  return {
    create: load,
    creating: loading,
    created,
    createdRecord: record,
    ...rest,
  };
};

export const useUpdate = <T>() => {
  const { create, creating, created, createdRecord, ...rest } = useCreate<T>();

  return {
    update: create,
    updating: creating,
    updated: created,
    updatedRecord: createdRecord,
    ...rest,
  };
};

export const useRecord = <T>(
  recordFinder: IAPIFunction,
  defautValue: T,
  key?: string,
  loadOnMount = true
) => {
  const [apiFunction] = useState<IAPIFunction>(() => recordFinder);
  const { load: apiServiceLoad, ...rest } = useAPIService<T>(defautValue, key);

  const load = useCallback(() => {
    apiServiceLoad(apiFunction);
  }, [apiFunction, apiServiceLoad]);

  useEffect(() => {
    loadOnMount && load();
  }, [load, loadOnMount]);

  return {
    load,
    ...rest,
  };
};

export const useRecords = <T>(
  recordFinder: IAPIFunction,
  key?: string,
  loadOnMount = true
) => {
  const { record, setRecord, ...rest } = useRecord<T[]>(
    recordFinder,
    [],
    key,
    loadOnMount
  );

  return {
    records: record,
    setRecords: setRecord,
    ...rest,
  };
};

export const useLoadingContext = () => {
  return useContext(LoadingContext);
};

export const useAPIDataContext = () => {
  return useContext(APIDataContext);
};

export const useFormikValue = ({
  value,
  name,
}: {
  value?: any;
  name?: string;
}) => {
  const { values } = (useFormikContext() as any) || {};
  return (
    value ??
    (value = (() => {
      if (values && name && values[name] != null) {
        return values[name];
      }
    })())
  );
};

export const useSmallScreen = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};
