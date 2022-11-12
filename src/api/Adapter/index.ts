import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import axios, { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';

import { CANCELLED_API_REQUEST_MESSAGE } from '../../constants';
import { RequestOptions, ResponseProcessor } from '../../interfaces/Utils';
import { REDIRECTION_ERROR_MESSAGES } from '../../utils/JWT';
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

export interface RequestController {
  rotateHeaders?: (
    responseHeaders: Record<string, string>,
    requestHeaders: Record<string, string>
  ) => Record<string, string>;
  processResponse?: ResponseProcessor;
  processResponseError?: (err: AxiosError<any>) => any;
}
export const RequestController: RequestController = {};

const pendingRequestCancelTokenSources: CancelTokenSource[] = [];

const fetchData = async <T = any>(
  path: string,
  {
    headers = {},
    label = 'operation',
    processResponse,
    ...options
  }: RequestOptions
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
          })
            .then(async (response) => {
              const requestControllerResponse = await (() => {
                if (RequestController.processResponse) {
                  return RequestController.processResponse(response);
                }
                return response;
              })();
              if (processResponse) {
                return processResponse(requestControllerResponse);
              }
              return response;
            })
            .catch(async (err: AxiosError) => {
              pendingRequestCancelTokenSources.splice(
                pendingRequestCancelTokenSources.indexOf(cancelTokenSource),
                1
              );
              const cancelPendingRequests = () => {
                pendingRequestCancelTokenSources.forEach((cancelTokenSource) =>
                  cancelTokenSource.cancel()
                );
              };
              if (RequestController.processResponseError) {
                err = await RequestController.processResponseError(err);
              }
              const { response, message } = err as any;
              if (response?.data) {
                // Extracting server side error message
                const message = (() => {
                  if (typeof response.data.message === 'string') {
                    return response.data.message;
                  }
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
                if (REDIRECTION_ERROR_MESSAGES.includes(message)) {
                  cancelPendingRequests();
                  return reject(Error(message));
                }
                return reject(
                  Error(`Error: '${label}' failed with message "${message}"`)
                );
              }
              if (response?.status === 401) {
                cancelPendingRequests();
                return reject(Error('Session timed out'));
              }

              if (message && !String(message).match(/request\sfailed/gi)) {
                return reject(
                  Error(`Error: '${label}' failed with message "${message}"`)
                );
              }
              return reject(
                Error(`Error: '${label}' failed. Something went wrong`)
              );
            });
          if (response) {
            pendingRequestCancelTokenSources.splice(
              pendingRequestCancelTokenSources.indexOf(cancelTokenSource),
              1
            );
            if (!Array.isArray(response.data.errors)) {
              if (RequestController.rotateHeaders) {
                patchDefaultRequestHeaders(
                  RequestController.rotateHeaders(
                    response.headers as any,
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

export const get = <T = any>(path: string, options: RequestOptions = {}) => {
  return fetchData<T>(path, options);
};

const getRequestDefaultOptions = ({ ...options }: RequestOptions = {}) => {
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
  { ...options }: RequestOptions = {}
) => {
  options.method = 'POST';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const put = async <T = any>(
  path: string,
  { ...options }: RequestOptions = {}
) => {
  options.method = 'PUT';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const patch = async <T = any>(
  path: string,
  { ...options }: RequestOptions = {}
) => {
  options.method = 'PATCH';
  return fetchData<T>(path, getRequestDefaultOptions(options));
};

export const del = <T = any>(path: string, options: RequestOptions = {}) => {
  options.method = 'DELETE';
  return fetchData<T>(path, options);
};

export const logout = async () => {
  StorageManager.remove('token');
};
