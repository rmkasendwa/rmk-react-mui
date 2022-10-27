import hash from 'object-hash';

import { RequestOptions } from '../../interfaces/Utils';

type Resolve = (payload?: any) => void;

type Reject = (err?: any) => void;

interface QueuedRequestOptions extends RequestOptions {
  url: string;
  resolve: Resolve;
  reject: Reject;
}

const requestQueue: Record<string, QueuedRequestOptions[]> = {};

export const queueRequest = (
  requestOptions: QueuedRequestOptions,
  callback: (resolve: Resolve, reject: Reject) => void
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
