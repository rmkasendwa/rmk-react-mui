import { AxiosRequestConfig } from 'axios';

export type TAPIFunction = () => Promise<any>;

export interface IReduxAction {
  type: string;
  payload?: any;
}

export interface IRequestController {
  cancelRequest: () => void;
}

export interface IRequestOptions extends AxiosRequestConfig {
  getRequestController?: (controller: IRequestController) => void;
  label?: string;
}

export interface ILoadingProps {
  loading: boolean;
  errorMessage: string;
}

export interface IFile {
  id?: string;
  base64?: string;
  name: string;
  size: number;
  originalFile: File;
  extraParams?: any;
}

export interface IUploadableFile extends IFile {
  // Upload props
  uploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
  upload?: () => void;
  cancelUpload?: () => void;
  retryUpload?: () => void;

  // Download props
  downloading?: boolean;
  downloadProgress?: number;
  downloadError?: string;
  download?: () => void;
  cancelDownload?: () => void;
  retryDownload?: () => void;
}

export interface IAsyncProcess {
  onProgress: (progress: number) => void;
  onError: (err: Error) => void;
  onSuccess: (payload: any) => void;
  onComplete: () => void;
}

export interface IAsyncProcessController {
  cancel: () => void;
}

export type TFileUploadFunction = (
  file: File,
  options: IAsyncProcess
) => IAsyncProcessController;

export type TFileDownloadFunction = (
  downloadProps: Pick<IFile, 'id' | 'extraParams'>,
  options: IAsyncProcess
) => IAsyncProcessController;

export interface ITaggedAPIRequest {
  id: string;
  errorMessage?: string;
  loading?: boolean;
}
