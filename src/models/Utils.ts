import { ButtonProps } from '@mui/material';
import { ElementType, RefObject, ReactNode } from 'react';

export interface RecordFinderRequestController {
  cancelRequest: () => void;
}

export interface PaginatedRequestParams {
  limit?: number;
  offset?: number;
  showRecords?: boolean;
  searchTerm?: string;
}

export interface PaginatedResponseData<DataRow> {
  records: DataRow[];
  recordsTotalCount?: number;
  hasNextPage?: boolean;
  loadedPageKey?: number;
}

export type APIFunction<T = any> = (...args: any) => Promise<T>;

export interface RequestController {
  cancelRequest: () => void;
}

export interface LoadingProps {
  loading: boolean;
  errorMessage: string;
}

export interface FileContainer {
  id?: string;
  base64?: string;
  url?: string;
  name: string;
  size: number;
  originalFile: File;
  extraParams?: any;
}

export interface LoadableFile extends FileContainer {
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

export interface AsyncProcess {
  onProgress: (progress: number) => void;
  onError: (err: Error) => void;
  onSuccess: (payload: any) => void;
  onComplete: () => void;
}

export interface AsyncProcessController {
  cancel: () => void;
}

export type FileUploadFunction = (
  file: File,
  options: AsyncProcess
) => AsyncProcessController;

export type FileDownloadFunction = (
  downloadProps: Pick<FileContainer, 'id' | 'extraParams'>,
  options: AsyncProcess
) => AsyncProcessController;

export interface TaggedAPIRequest {
  id: string;
  errorMessage?: string;
  loading?: boolean;
}

export type PrimitiveDataType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'date'
  | 'enum';

export type ExoticDataType =
  | PrimitiveDataType
  | 'checkbox'
  | 'currency'
  | 'dateTime'
  | 'email'
  | 'percentage'
  | 'phoneNumber'
  | 'time'
  | 'timestamp';

export type DropdownOptionValue = string | number;

export interface DropdownOption<Entity = any>
  extends Partial<Pick<ButtonProps, 'onClick' | 'sx'>> {
  /**
   * The value of the option.
   */
  value: DropdownOptionValue;

  /**
   * The label of the option.
   */
  label: ReactNode;

  /**
   * The label of the option when it is selected.
   * If not provided, the `label` will be used.
   */
  selectedOptionLabel?: ReactNode;

  /**
   * The searchable label of the option.
   * If not provided, the `label` will be used.
   */
  searchableLabel?: string;

  /**
   * The label of the option when it matches the search term.
   */
  searchMatchLabel?: ReactNode;

  /**
   * The description of the option.
   * It will be displayed in a tooltip when the option is hovered.
   */
  description?: ReactNode;

  /**
   * The icon to display before the label.
   */
  icon?: ReactNode;

  /**
   * Whether the option is selectable.
   * @default true
   */
  selectable?: boolean;
  isDropdownOption?: boolean;
  isDropdownOptionWrapped?: boolean;

  /**
   * The component or tag used to render the option.
   * @default Button
   */
  component?: ElementType;

  /**
   * The ref to be passed to the rendered option element.
   */
  ref?: RefObject<HTMLElement | null>;

  /**
   * The entity being represented by the option.
   */
  entity?: Entity;
}

export interface EllipsisMenuToolProps<Entity = any> {
  options: DropdownOption<Entity>[];
}

export type CrudMode = 'create' | 'view' | 'edit' | 'delete';
