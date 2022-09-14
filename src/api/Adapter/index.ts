import axios, { AxiosResponse, CancelTokenSource } from 'axios';

import { CANCELLED_API_REQUEST_MESSAGE } from '../../constants';
import { IRequestOptions } from '../../interfaces/Utils';
import { SessionTimeoutError } from '../../utils/errors';
import StorageManager from '../../utils/StorageManager';
import { queueRequest } from './RequestQueue';

const HOST_URL = typeof window !== 'undefined' ? window.location.origin : '';

const FAILED_REQUEST_RETRY_STATUS_BLACKLIST: number[] = [400, 401, 404, 500];
const MAX_REQUEST_RETRY_COUNT = 2;

export interface IAPIAdapterConfiguration {
  HOST_URL: string;
  getFullResourceURL: (path: string) => string;
}

export const APIAdapterConfiguration: IAPIAdapterConfiguration = {
  HOST_URL,
  getFullResourceURL: (path) => {
    if (path.match(/^https?:/)) return path;
    return APIAdapterConfiguration.HOST_URL + path;
  },
};

export const defaultRequestHeaders: Record<string, string> = {};

const setDefaultRequestHeaders = () => {
  const cachedDefaultRequestHeaders: Record<string, string> | null =
    StorageManager.get('defaultRequestHeaders');
  cachedDefaultRequestHeaders &&
    Object.assign(defaultRequestHeaders, cachedDefaultRequestHeaders);
};
setDefaultRequestHeaders();

if (typeof window !== 'undefined') {
  window.addEventListener('focus', setDefaultRequestHeaders);
}

export const patchDefaultRequestHeaders = (headers: Record<string, string>) => {
  Object.assign(defaultRequestHeaders, headers);
  StorageManager.add('defaultRequestHeaders', defaultRequestHeaders);
};

export interface IHeaderController {
  rotateHeaders?: (
    responseHeaders: Record<string, string>,
    requestHeaders: Record<string, string>
  ) => Record<string, string>;
}
export const HeaderController: IHeaderController = {};

const pendingRequestCancelTokenSources: CancelTokenSource[] = [];

const fetchData = async <T = any>(
  path: string,
  { headers = {}, label = 'operation', ...options }: IRequestOptions
): Promise<AxiosResponse<T>> => {
  const defaultHeaders = { ...defaultRequestHeaders };
  const url = APIAdapterConfiguration.getFullResourceURL(path);

  return new Promise((resolve, reject) => {
    queueRequest(
      {
        ...options,
        url,
        resolve,
        reject,
      },
      async (resolve, reject) => {
        const fetchData = async (retryCount = 0): Promise<any> => {
          const cancelTokenSource = axios.CancelToken.source();
          options.getRequestController &&
            options.getRequestController({
              cancelRequest: () => {
                cancelTokenSource.cancel(CANCELLED_API_REQUEST_MESSAGE);
              },
            });
          pendingRequestCancelTokenSources.push(cancelTokenSource);
          const response = await axios(url, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...headers,
            },
            cancelToken: cancelTokenSource.token,
            withCredentials: true,
          }).catch((err) => {
            pendingRequestCancelTokenSources.splice(
              pendingRequestCancelTokenSources.indexOf(cancelTokenSource),
              1
            );
            const cancelPendingRequests = () => {
              pendingRequestCancelTokenSources.forEach((cancelTokenSource) =>
                cancelTokenSource.cancel()
              );
            };
            const { response, message } = err;
            if (response?.data) {
              const errorMessage: string =
                `Error: '${label}' failed. ` +
                (() => {
                  if (typeof response.data.message === 'string')
                    return response.data.message;
                  if (Array.isArray(response.data.message)) {
                    return response.data.message
                      .filter((message: any) => typeof message === 'string')
                      .join('\n');
                  }
                  if (
                    Array.isArray(response.data.errors) &&
                    response.data.errors.length > 0
                  ) {
                    return response.data.errors
                      .map((err: any) => {
                        return err.message;
                      })
                      .join('\n');
                  }
                  return 'Something went wrong';
                })();
              if (['User session timed out'].includes(errorMessage)) {
                cancelPendingRequests();
                return reject(new SessionTimeoutError(errorMessage));
              }
              return reject(new Error(errorMessage));
            }
            if (response?.status === 401) {
              cancelPendingRequests();
              return reject(new SessionTimeoutError('Session timed out'));
            }

            if (message && !String(message).match(/request\sfailed/gi)) {
              return reject(new Error(`Error: '${label}' failed. ${message}`));
            }
            return reject(
              new Error(`Error: '${label}' failed. Something went wrong`)
            );
          });
          if (response) {
            pendingRequestCancelTokenSources.splice(
              pendingRequestCancelTokenSources.indexOf(cancelTokenSource),
              1
            );
            if (!Array.isArray(response.data.errors)) {
              if (HeaderController.rotateHeaders) {
                patchDefaultRequestHeaders(
                  HeaderController.rotateHeaders(
                    response.headers,
                    defaultHeaders
                  )
                );
              }
              return resolve(response);
            } else if (
              !FAILED_REQUEST_RETRY_STATUS_BLACKLIST.includes(
                response.status
              ) &&
              retryCount < MAX_REQUEST_RETRY_COUNT
            ) {
              return fetchData(retryCount + 1);
            }
          }
        };
        fetchData();
      }
    );
  });
};

export const get = <T = any>(path: string, options: IRequestOptions = {}) => {
  return fetchData<T>(path, options);
};

const getRequestDefaultOptions = ({ ...options }: IRequestOptions = {}) => {
  options.headers || (options.headers = {});

  if (options.data && !options.headers['Content-Type']) {
    if (options.data instanceof FormData) {
      options.headers['Content-Type'] = 'multipart/form-data';
    } else if (typeof options.data === 'object') {
      options.data = JSON.stringify(options.data);
      options.headers['Content-Type'] = 'application/json';
    }
  }

  return options;
};

export const post = async <T = any>(
  path: string,
  { ...options }: IRequestOptions = {}
) => {
  options.method = 'POST';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const put = async <T = any>(
  path: string,
  { ...options }: IRequestOptions = {}
) => {
  options.method = 'PUT';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const patch = async <T = any>(
  path: string,
  { ...options }: IRequestOptions = {}
) => {
  options.method = 'PATCH';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const del = <T = any>(path: string, options: IRequestOptions = {}) => {
  options.method = 'DELETE';
  return fetchData<T>(path, options);
};

export const login = async <T = any>(
  username: string,
  password: string,
  endpointPath = '/v1/login'
) => {
  const { data } = await post<T>(endpointPath, {
    data: {
      username,
      password,
    },
    label: 'Logging in',
  });
  return data;
};

export const logout = async () => {
  StorageManager.remove('token');
};
