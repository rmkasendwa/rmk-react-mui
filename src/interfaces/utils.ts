import { AxiosRequestConfig } from 'axios';

export type IAPIFunction = () => Promise<any>;

export interface IAPI {
  call: <T extends IAPIFunction>(func: T) => Promise<ReturnType<T>>;
}

export interface IReduxAction {
  type: string;
  payload?: any;
}

export interface IRequestOptions extends AxiosRequestConfig {
  getRequestController?: (controller: { cancelRequest: () => void }) => void;
  label?: string;
}

export interface ILoadingProps {
  loading: boolean;
  errorMessage: string;
}
