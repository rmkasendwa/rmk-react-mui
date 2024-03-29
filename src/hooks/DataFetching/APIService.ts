import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CANCELLED_API_REQUEST_MESSAGES } from '../../constants';
import { useAPIContext } from '../../contexts/APIContext';
import { APIFunction } from '../../models/Utils';

/**
 * Calls an API function and sets the record loading state.
 *
 * @param apiFunction The API function to call
 * @param polling Whether the API function is being called for polling
 * @returns The response of the API function
 */
export type APIServiceLoadFunction<Data> = (
  apiFunction?: APIFunction,
  polling?: boolean
) => Promise<Data>;

export interface APIServiceState<Data> {
  /**
   * Calls an API function and sets the data loading state.
   *
   * @param apiFunction The API function to call
   * @param polling Whether the API function is being called for polling
   * @returns The response of the API function
   */
  load: APIServiceLoadFunction<Data>;

  /**
   * Whether the data is being loaded.
   */
  loading: boolean;

  /**
   * Whether the data has been loaded.
   */
  loaded: boolean;

  /**
   * Sets the data loaded state.
   */
  setLoaded: Dispatch<SetStateAction<boolean>>;

  /**
   * The error message of the API service.
   */
  errorMessage: string;

  /**
   * Sets the error message of the API service.
   */
  setErrorMessage: Dispatch<SetStateAction<string>>;

  /**
   * The data returned by the API service.
   */
  record: Data;

  /**
   * Sets the data of the API service.
   */
  setRecord: Dispatch<SetStateAction<Data>>;

  /**
   * Resets the data loading state.
   */
  reset: () => void;
}

/**
 * A hook that provides a record loading state for an API service
 *
 * @param defaultValue The default value of the record
 * @param loadOnMount Whether to load the record on mount
 * @returns The record loading state of the API service
 */
export const useAPIService = <Data>(
  defaultValue: Data,
  loadOnMount = false
): APIServiceState<Data> => {
  //#region Refs
  const isComponentMountedRef = useRef(true);
  //#endregion

  const { call } = useAPIContext();
  const [record, setRecord] = useState<Data>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(loadOnMount);
  const [errorMessage, setErrorMessage] = useState('');

  const load: APIServiceLoadFunction<Data> = useCallback(
    async (apiFunction, polling = false) => {
      if (apiFunction) {
        setErrorMessage('');
        setLoaded(false);
        setLoading(true);
        const response = await call(apiFunction)
          .then(async (payload) => {
            const response = await payload;
            if (isComponentMountedRef.current) {
              setRecord(response);
              setLoaded(true);
            }
            return payload;
          })
          .catch((err) => {
            if (
              !CANCELLED_API_REQUEST_MESSAGES.some((message) => {
                return String(err.message)
                  .toLowerCase()
                  .match(message.toLowerCase());
              }) &&
              !polling
            ) {
              setErrorMessage(err.message);
            }
          });
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
        return response;
      }
    },
    [call]
  );

  const resetRef = useRef(() => {
    setRecord(defaultValue);
    setLoaded(false);
    setLoading(loadOnMount);
    setErrorMessage('');
  });

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
    reset: resetRef.current,
  };
};
