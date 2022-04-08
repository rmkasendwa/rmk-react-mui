import { useMediaQuery, useTheme } from '@mui/material';
import { useFormikContext } from 'formik';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CANCELLED_API_REQUEST_MESSAGE } from '../constants';
import { APIContext, APIDataContext, LoadingContext } from '../contexts';
import { IAPIFunction, ITaggedAPIRequest } from '../interfaces';
import { RootState, updateData } from '../redux';

export const useAPIService = <T>(defautValue: T, key?: string) => {
  const isComponentMountedRef = useRef(true);
  const taggedAPIRequestsRef = useRef<ITaggedAPIRequest[]>([]);
  const data = useSelector((state: RootState) => {
    const { data } = state;
    return data;
  });
  if (key && data[key]) {
    defautValue = data[key];
  }
  const { call } = useContext(APIContext);
  const [record, setRecord] = useState<T>(defautValue);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (key && data[key] && isComponentMountedRef.current) {
      setRecord(data[key]);
    }
  }, [data, key]);

  const load = useCallback(
    async (apiFunction?: IAPIFunction, tag?: string, polling = false) => {
      if (apiFunction) {
        setErrorMessage('');
        setLoaded(false);
        setLoading(true);
        const taggedAPIRequest = (() => {
          if (tag) {
            return {
              id: tag,
              loading: true,
            } as ITaggedAPIRequest;
          }
        })();
        taggedAPIRequest && taggedAPIRequestsRef.current.push(taggedAPIRequest);
        const data = await call(() => (apiFunction as IAPIFunction)()).catch(
          (err) => {
            if (
              !String(err.message).match(CANCELLED_API_REQUEST_MESSAGE) &&
              !polling
            ) {
              setErrorMessage(err.message);
            }
          }
        );
        if (
          taggedAPIRequest &&
          taggedAPIRequestsRef.current.includes(taggedAPIRequest)
        ) {
          taggedAPIRequestsRef.current.splice(
            taggedAPIRequestsRef.current.indexOf(taggedAPIRequest),
            1
          );
        }
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
          setPolling(false);
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
    polling,
    setPolling,
    busy,
    setBusy,
    taggedAPIRequests: taggedAPIRequestsRef.current,
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

const DEFAULT_SYNC_TIMEOUT = 60 * 1000;
export const useRecord = <T>(
  recordFinder: IAPIFunction,
  defautValue: T,
  key?: string,
  loadOnMount = true
) => {
  const nextSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [apiFunction] = useState<IAPIFunction>(() => recordFinder);
  const {
    load: apiServiceLoad,
    loading,
    errorMessage,
    polling,
    setPolling,
    busy,
    ...rest
  } = useAPIService<T>(defautValue, key);

  const load = useCallback(
    (polling = false) => {
      apiServiceLoad(apiFunction, undefined, polling);
    },
    [apiFunction, apiServiceLoad]
  );

  useEffect(() => {
    loadOnMount && load();
  }, [load, loadOnMount]);

  useEffect(() => {
    if (!busy && !loading && !errorMessage) {
      const mouseMoveEventCallback = () => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        nextSyncTimeoutRef.current = setTimeout(() => {
          setPolling(true);
        }, DEFAULT_SYNC_TIMEOUT);
      };
      window.addEventListener('mousemove', mouseMoveEventCallback);
      mouseMoveEventCallback();
      return () => {
        window.removeEventListener('mousemove', mouseMoveEventCallback);
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
      };
    }
  }, [busy, errorMessage, load, loading, setPolling]);

  useEffect(() => {
    if (polling && !loading) {
      load(true);
    }
  }, [load, loading, polling]);

  return {
    load,
    loading,
    errorMessage,
    polling,
    setPolling,
    busy,
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
