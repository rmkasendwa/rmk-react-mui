import hash from 'object-hash';
import { useCallback, useEffect, useState } from 'react';

import { ITextFieldProps } from '../components';
import {
  IFile,
  ILoadableFile,
  TFileDownloadFunction,
  TFileUploadFunction,
} from '../interfaces';

export interface IUseFileUploadOptions
  extends Pick<
    ITextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: IFile[];
  fileField?: HTMLInputElement | null;
  upload?: TFileUploadFunction;
  download?: TFileDownloadFunction;
  convertFilesToBase64?: boolean;
}
export const useFileUpload = ({
  fileField,
  upload,
  download,
  name,
  id,
  value,
  onChange,
  convertFilesToBase64 = true,
}: IUseFileUploadOptions) => {
  const [files, setFiles] = useState<ILoadableFile[]>([]);

  const getLoadableFiles = useCallback(
    (files: IFile[]) => {
      return files.map((file) => {
        const loadableFile: ILoadableFile = { ...file };
        const { originalFile, id, extraParams } = file;

        if (upload) {
          const retryFileUpload = () => {
            setFiles((prevFiles) => {
              const stateFile = prevFiles.find(
                ({ originalFile: stateFile }) => stateFile === originalFile
              );
              if (stateFile) {
                stateFile.uploadError = '';
                delete stateFile.retryUpload;
                Object.assign(stateFile, uploadFile());
                return [...prevFiles];
              }
              return prevFiles;
            });
          };
          const uploadFile = () => {
            const { cancel } = upload(originalFile, {
              onProgress: (progress) => {
                setFiles((prevFiles) => {
                  const stateFile = prevFiles.find(
                    ({ originalFile: stateFile }) => stateFile === originalFile
                  );
                  if (stateFile) {
                    stateFile.uploadProgress = progress;
                    return [...prevFiles];
                  }
                  return prevFiles;
                });
              },
              onError: (err) => {
                setFiles((prevFiles) => {
                  const stateFile = prevFiles.find(
                    ({ originalFile: stateFile }) => stateFile === originalFile
                  );
                  if (stateFile) {
                    stateFile.uploadError = err.message;
                    stateFile.retryUpload = retryFileUpload;
                    return [...prevFiles];
                  }
                  return prevFiles;
                });
              },
              onSuccess: (payload) => {
                if (payload.id) {
                  setFiles((prevFiles) => {
                    const stateFile = prevFiles.find(
                      ({ originalFile: stateFile }) =>
                        stateFile === originalFile
                    );
                    if (stateFile) {
                      stateFile.id = payload.id;
                      return [...prevFiles];
                    }
                    return prevFiles;
                  });
                }
              },
              onComplete: () => {
                setFiles((prevFiles) => {
                  const stateFile = prevFiles.find(
                    ({ originalFile: stateFile }) => stateFile === originalFile
                  );
                  if (stateFile) {
                    stateFile.uploading = false;
                    delete stateFile.cancelUpload;
                    return [...prevFiles];
                  }
                  return prevFiles;
                });
              },
            });
            setFiles((prevFiles) => {
              const stateFile = prevFiles.find(
                ({ originalFile: stateFile }) => stateFile === originalFile
              );
              if (stateFile) {
                stateFile.uploading = true;
                stateFile.cancelUpload = cancel;
                return [...prevFiles];
              }
              return prevFiles;
            });
          };
          loadableFile.upload = uploadFile;
        }

        if (download) {
          const retryFileDownload = () => {
            setFiles((prevFiles) => {
              const stateFile = prevFiles.find(
                ({ id: stateId }) => stateId === id
              );
              if (stateFile) {
                stateFile.uploadError = '';
                delete stateFile.retryDownload;
                Object.assign(stateFile, downloadFile());
                return [...prevFiles];
              }
              return prevFiles;
            });
          };
          const downloadFile = () => {
            const { cancel } = download(
              { id, extraParams },
              {
                onProgress: (progress) => {
                  setFiles((prevFiles) => {
                    const stateFile = prevFiles.find(
                      ({ id: stateId }) => stateId === id
                    );
                    if (stateFile) {
                      stateFile.downloadProgress = progress;
                      return [...prevFiles];
                    }
                    return prevFiles;
                  });
                },
                onError: (err) => {
                  setFiles((prevFiles) => {
                    const stateFile = prevFiles.find(
                      ({ id: stateId }) => stateId === id
                    );
                    if (stateFile) {
                      stateFile.downloadError = err.message;
                      stateFile.retryDownload = retryFileDownload;
                      return [...prevFiles];
                    }
                    return prevFiles;
                  });
                },
                onSuccess: (payload) => {
                  if (payload.id) {
                    setFiles((prevFiles) => {
                      const stateFile = prevFiles.find(
                        ({ id: stateId }) => stateId === id
                      );
                      if (stateFile) {
                        stateFile.id = payload.id;
                        return [...prevFiles];
                      }
                      return prevFiles;
                    });
                  }
                },
                onComplete: () => {
                  setFiles((prevFiles) => {
                    const stateFile = prevFiles.find(
                      ({ id: stateId }) => stateId === id
                    );
                    if (stateFile) {
                      stateFile.downloading = false;
                      delete stateFile.cancelDownload;
                      return [...prevFiles];
                    }
                    return prevFiles;
                  });
                },
              }
            );
            setFiles((prevFiles) => {
              const stateFile = prevFiles.find(
                ({ id: stateId }) => stateId === id
              );
              if (stateFile) {
                stateFile.downloading = true;
                stateFile.cancelDownload = cancel;
                return [...prevFiles];
              }
              return prevFiles;
            });
          };
          loadableFile.download = downloadFile;
        }
        return loadableFile;
      });
    },
    [download, upload]
  );

  useEffect(() => {
    if (fileField) {
      const changeEventCallback = async () => {
        if (fileField.files && fileField.files.length > 0) {
          const existingFileNames: string[] = files.map(
            (image) => image.originalFile.name + image.originalFile.size
          );
          const newFiles = await Promise.all(
            [...fileField.files]
              .filter((file) => {
                return !existingFileNames.includes(file.name + file.size);
              })
              .map((file) => {
                const { name, size } = file;
                if (convertFilesToBase64) {
                  return new Promise<ILoadableFile>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () =>
                      resolve({
                        base64: reader.result as string,
                        originalFile: file,
                        name,
                        size,
                      });
                    reader.onerror = (error) => reject(error);
                  });
                }
                return {
                  originalFile: file,
                  name,
                  size,
                };
              })
          );
          fileField.value = '';
          const newLoadableFiles = getLoadableFiles(newFiles);
          const nextFiles = [...files, ...newLoadableFiles];
          setFiles(nextFiles);
          newLoadableFiles.forEach(({ upload }) => {
            upload && upload();
          });
        }
      };
      fileField.addEventListener('change', changeEventCallback);
      return () => {
        fileField.removeEventListener('change', changeEventCallback);
      };
    }
  }, [convertFilesToBase64, fileField, files, getLoadableFiles]);

  useEffect(() => {
    setFiles((prevFiles) => {
      if (
        value &&
        hash(value.map(({ id, name, size }) => ({ id, name, size }))) !==
          hash(prevFiles.map(({ id, name, size }) => ({ id, name, size })))
      ) {
        return value;
      }
      return prevFiles;
    });
  }, [value]);

  useEffect(() => {
    if (onChange) {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          id,
          name,
          value: files.map(
            ({ id, base64, name, size, originalFile, extraParams }) => {
              return {
                id,
                base64,
                name,
                size,
                originalFile,
                extraParams,
              } as IFile;
            }
          ),
        },
      });
      onChange(event);
    }
  }, [files, id, name, onChange]);

  return { files, setFiles };
};
