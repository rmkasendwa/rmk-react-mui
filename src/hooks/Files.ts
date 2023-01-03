import { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';

import { TextFieldProps } from '../components/InputFields/TextField';
import {
  FileContainer,
  FileDownloadFunction,
  FileUploadFunction,
  LoadableFile,
} from '../interfaces/Utils';

export interface UseFileUploadOptions
  extends Pick<
    TextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: FileContainer[];
  fileField?: HTMLInputElement | null;
  upload?: FileUploadFunction;
  download?: FileDownloadFunction;
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
}: UseFileUploadOptions) => {
  const [files, setFiles] = useState<LoadableFile[]>(value || []);
  const [duplicateFileSelections, setDuplicateFileSelections] = useState<
    number[]
  >([]);

  // Refs
  const isInitialMount = useRef(true);
  const onChangeRef = useRef(onChange);
  const downloadRef = useRef(download);
  const uploadRef = useRef(upload);
  const filesRef = useRef(files);
  useEffect(() => {
    isInitialMount.current = false;
    onChangeRef.current = onChange;
    downloadRef.current = download;
    uploadRef.current = upload;
    filesRef.current = files;
  }, [download, files, onChange, upload]);

  const getLoadableFilesRef = useRef((files: FileContainer[]) => {
    return files.map((file) => {
      const loadableFile: LoadableFile = { ...file };
      const { originalFile, id, extraParams } = file;

      const upload = uploadRef.current;
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
                    ({ originalFile: stateFile }) => stateFile === originalFile
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
              stateFile.cancelUpload = () => {
                cancel();
                setFiles((prevFiles) => {
                  if (prevFiles.includes(stateFile)) {
                    prevFiles.splice(prevFiles.indexOf(stateFile), 1);
                    return [...prevFiles];
                  }
                  return prevFiles;
                });
              };
              return [...prevFiles];
            }
            return prevFiles;
          });
        };
        loadableFile.upload = uploadFile;
      }

      const download = downloadRef.current;
      if (download) {
        const retryFileDownload = () => {
          setFiles((prevFiles) => {
            const stateFile = prevFiles.find(
              ({ id: stateId }) => stateId === id
            );
            if (stateFile) {
              stateFile.downloadError = '';
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
              stateFile.cancelDownload = () => {
                cancel();
                setFiles((prevFiles) => {
                  const stateFile = prevFiles.find(
                    ({ id: stateId }) => stateId === id
                  );
                  if (stateFile) {
                    stateFile.downloading = false;
                    delete stateFile.downloadError;
                    delete stateFile.downloadProgress;
                    return [...prevFiles];
                  }
                  return prevFiles;
                });
              };
              return [...prevFiles];
            }
            return prevFiles;
          });
        };
        loadableFile.download = downloadFile;
      }
      return loadableFile;
    });
  });

  useEffect(() => {
    if (fileField) {
      const changeEventCallback = async () => {
        if (fileField.files && fileField.files.length > 0) {
          const [selectedFiles, duplicateFileSelections] = [
            ...fileField.files,
          ].reduce(
            (accumulator, file) => {
              const existingFile = filesRef.current.find(({ name, size }) => {
                return file.name === name && file.size === size;
              });
              if (existingFile) {
                accumulator[1].push(filesRef.current.indexOf(existingFile));
              } else {
                accumulator[0].push(file);
              }
              return accumulator;
            },
            [[], []] as [File[], number[]]
          );

          const newFiles = await Promise.all(
            selectedFiles.map((file) => {
              const { name, size } = file;
              if (convertFilesToBase64) {
                return new Promise<LoadableFile>((resolve, reject) => {
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
                id: uniqid(),
                name,
                size,
              };
            })
          );
          fileField.value = '';
          const newLoadableFiles = getLoadableFilesRef.current(newFiles);
          const nextFiles = [...filesRef.current, ...newLoadableFiles];
          setFiles(nextFiles);
          setDuplicateFileSelections(duplicateFileSelections);
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
  }, [convertFilesToBase64, fileField]);

  useEffect(() => {
    setFiles((prevFiles) => {
      if (
        value &&
        JSON.stringify(
          value.map(({ id, name, size }) => ({ id, name, size }))
        ) !==
          JSON.stringify(
            prevFiles.map(({ id, name, size }) => ({ id, name, size }))
          )
      ) {
        return value;
      }
      return prevFiles;
    });
  }, [value]);

  useEffect(() => {
    if (onChangeRef.current && !isInitialMount.current) {
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
              } as FileContainer;
            }
          ),
        },
      });
      onChangeRef.current(event);
    }
  }, [files, id, name]);

  return { files, duplicateFileSelections, setFiles };
};
