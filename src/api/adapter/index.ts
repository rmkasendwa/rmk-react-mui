import axios from 'axios';
import * as queryString from 'query-string';

import { IRequestOptions, IUser } from '../../interfaces';
import { SessionTimeoutError } from '../../utils/errors';
import StorageManager from '../../utils/StorageManager';
import { queueRequest } from './request-queue';

interface IRequestHeaders {
  Authorization?: string;
}

export const HOST_URL = window.location.origin;

const FAILED_REQUEST_RETRY_STATUS_BLACKLIST: number[] = [400, 401, 404, 500];
const MAX_REQUEST_RETRY_COUNT = 2;
const requestHeaders: IRequestHeaders = {};

const getAuthorizationToken = (authorization: string) =>
  `Bearer ${authorization}`;
const token: string | null = StorageManager.get('token');
token && (requestHeaders.Authorization = getAuthorizationToken(token));

const fetchData = async <T = any>(
  path: string,
  { headers = {}, label, ...options }: IRequestOptions
): Promise<T> => {
  const defaultHeaders = { ...requestHeaders };
  const cancelTokenSource = axios.CancelToken.source();
  options.getRequestController &&
    options.getRequestController({
      cancelRequest: () => {
        cancelTokenSource.cancel();
      },
    });
  const url = (() => {
    if (path.match(/^https?:/)) return path;
    return HOST_URL + path;
  })();

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
          const response = await axios(url, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...headers,
            },
            cancelToken: cancelTokenSource.token,
            withCredentials: true,
          }).catch((err) => {
            const { response } = err;
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
                return reject(new SessionTimeoutError(errorMessage));
              }
              return reject(new Error(errorMessage));
            }
            if (response?.status === 401) {
              return reject(new SessionTimeoutError('Session timed out'));
            }
            return reject(
              new Error(`Error: '${label}' failed. Something went wrong`)
            );
          });
          if (response) {
            if (!Array.isArray(response.data.errors)) {
              if (response.headers.authorization) {
                requestHeaders.Authorization = getAuthorizationToken(
                  response.headers.authorization
                );
                StorageManager.add('token', response.headers.authorization);
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

export const get = (path: string, options: IRequestOptions = {}) => {
  return fetchData(path, options);
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

export const post = async (
  path: string,
  { ...options }: IRequestOptions = {}
): Promise<any> => {
  options.method = 'POST';
  return fetchData(path, getRequestDefaultOptions(options));
};

export const patch = async (
  path: string,
  { ...options }: IRequestOptions = {}
): Promise<any> => {
  options.method = 'PATCH';
  return fetchData(path, getRequestDefaultOptions(options));
};

export const login = async (
  username: string,
  password: string,
  endpointPath = '/v1/login'
): Promise<IUser> => {
  const { data } = await post(endpointPath, {
    data: {
      username,
      password,
    },
    label: 'Logging in',
  });
  return data;
};

export const loginWithAuthParams = async (
  authParams: Record<string, string>,
  loginUrl: string
): Promise<IUser> => {
  // Getting token
  const { data: tokenData } = await post(loginUrl, {
    data: queryString.stringify(authParams),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    label: 'Logging in',
  });
  requestHeaders.Authorization = getAuthorizationToken(tokenData.token);
  StorageManager.add('token', tokenData.token);

  // Getting authorized user
  const { data: userData } = await get('/api/v1/auth', {
    label: 'Loading user account details',
  });
  const user: IUser = {
    fullName: userData['user.name'],
    email: userData['user.id'],
    profilePictureUrl: userData['user.pic'],
  };
  return user;
};

export const logout = async () => {
  StorageManager.remove('token');
};
