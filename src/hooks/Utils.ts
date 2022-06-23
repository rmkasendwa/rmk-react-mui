import { useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CANCELLED_API_REQUEST_MESSAGE } from '../constants';
import { APIContext } from '../contexts/APIContext';
import { APIDataContext } from '../contexts/APIDataContext';
import { ITaggedAPIRequest, TAPIFunction } from '../interfaces/Utils';
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
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (key && data[key] && isComponentMountedRef.current) {
      setRecord(data[key]);
    }
  }, [data, key]);

  const load = useCallback(
    async (apiFunction?: TAPIFunction, tag?: string, polling = false) => {
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
        const data = await call(() => (apiFunction as TAPIFunction)()).catch(
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
    setCreated,
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

const DEFAULT_SYNC_TIMEOUT = 5 * 60 * 1000;
export const useRecord = <T>(
  recordFinder: TAPIFunction,
  defautValue: T,
  key?: string,
  loadOnMount = true,
  autoSync = true
) => {
  const nextSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [apiFunction] = useState<TAPIFunction>(() => recordFinder);
  const {
    load: apiServiceLoad,
    loading,
    errorMessage,
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
    if (autoSync && !busy && !loading && !errorMessage) {
      const mouseMoveEventCallback = () => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        nextSyncTimeoutRef.current = setTimeout(() => {
          load(true);
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
  }, [autoSync, busy, errorMessage, load, loading]);

  return {
    load,
    loading,
    errorMessage,
    busy,
    ...rest,
  };
};

export const useRecords = <T>(
  recordFinder: TAPIFunction,
  key?: string,
  loadOnMount = true,
  autoSync = true
) => {
  const { record, setRecord, ...rest } = useRecord<T[]>(
    recordFinder,
    [],
    key,
    loadOnMount,
    autoSync
  );

  return {
    records: record,
    setRecords: setRecord,
    ...rest,
  };
};

export const useAPIDataContext = () => {
  return useContext(APIDataContext);
};

export const useSmallScreen = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};
