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

export interface IImage {
  id?: string;
  base64: string;
  originalFile: File;
}

export interface IImageUploadOptions {
  onProgress: (progress: number) => void;
  onError: (err: Error) => void;
  onSuccess: (payload: any) => void;
  onComplete: () => void;
}

export interface IImageUploadController {
  cancel: () => void;
}

export type IImageUploadFunction = (
  imageFile: File,
  options: IImageUploadOptions
) => IImageUploadController;
