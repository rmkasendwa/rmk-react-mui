import hash from 'object-hash';

import { IRequestOptions } from '../../interfaces/Utils';

type TResolve = (payload?: any) => void;

type TReject = (err?: any) => void;

interface IQueuedRequestOptions extends IRequestOptions {
  url: string;
  resolve: TResolve;
  reject: TReject;
}

const requestQueue: Record<string, IQueuedRequestOptions[]> = {};

export const queueRequest = (
  requestOptions: IQueuedRequestOptions,
  callback: (resolve: TResolve, reject: TReject) => void
) => {
  const hashableRequestOptions = { ...requestOptions };
  if (hashableRequestOptions.data instanceof FormData) {
    hashableRequestOptions.data = Date.now();
  }
  const requestKey = hash(JSON.stringify(hashableRequestOptions));
  if (requestQueue[requestKey]) {
    requestQueue[requestKey].push(requestOptions);
  } else {
    requestQueue[requestKey] = [requestOptions];
    callback(
      (payload) => {
        resolveRequest(requestKey, payload);
      },
      (err) => {
        rejectRequest(requestKey, err);
      }
    );
  }
};

const dequeueRequest = (url: string) => {
  delete requestQueue[url];
};

const resolveRequest = (requestKey: string, payload: any) => {
  if (requestQueue[requestKey]?.length > 0) {
    requestQueue[requestKey].forEach(({ resolve }) => {
      resolve(payload);
    });
    dequeueRequest(requestKey);
  }
};

const rejectRequest = (requestKey: string, err: any) => {
  if (requestQueue[requestKey]?.length > 0) {
    requestQueue[requestKey].forEach(({ reject }) => {
      reject(err);
    });
    dequeueRequest(requestKey);
  }
};
