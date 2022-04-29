import hash from 'object-hash';
import { useEffect, useState } from 'react';

import { ITextFieldProps } from '../components';
import { IFile, IFileUploadFunction, IUploadableFile } from '../interfaces';

export interface IUseFileUploadOptions
  extends Pick<
    ITextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: IFile[];
  fileField?: HTMLInputElement | null;
  upload?: IFileUploadFunction;
  convertFilesToBase64?: boolean;
}
export const useFileUpload = ({
  fileField,
  upload,
  name,
  id,
  value,
  onChange,
  convertFilesToBase64 = true,
}: IUseFileUploadOptions) => {
  const [files, setFiles] = useState<IUploadableFile[]>([]);

  useEffect(() => {
    if (fileField) {
      const changeEventCallback = async () => {
        if (fileField.files && fileField.files.length > 0) {
          const existingFileNames: string[] = files.map(
            (image) => image.originalFile.name + image.originalFile.size
          );
          const newImages = await Promise.all(
            [...fileField.files]
              .filter((file) => {
                return !existingFileNames.includes(file.name + file.size);
              })
              .map((file) => {
                const { name, size } = file;
                if (convertFilesToBase64) {
                  return new Promise<IUploadableFile>((resolve, reject) => {
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
          const nextImages = [
            ...files,
            ...(upload
              ? newImages.map((newImage) => {
                  const { originalFile } = newImage;
                  const retryImageUpload = () => {
                    setFiles((prevImages) => {
                      const stateImage = prevImages.find(
                        ({ originalFile: stateImageFile }) =>
                          stateImageFile === originalFile
                      );
                      if (stateImage) {
                        stateImage.uploadError = '';
                        delete stateImage.retryUpload;
                        Object.assign(stateImage, uploadImageFile());
                        return [...prevImages];
                      }
                      return prevImages;
                    });
                  };
                  const uploadImageFile = () => {
                    const { cancel } = upload(originalFile, {
                      onProgress: (progress) => {
                        setFiles((prevImages) => {
                          const stateImage = prevImages.find(
                            ({ originalFile: stateImageFile }) =>
                              stateImageFile === originalFile
                          );
                          if (stateImage) {
                            stateImage.uploadProgress = progress;
                            return [...prevImages];
                          }
                          return prevImages;
                        });
                      },
                      onError: (err) => {
                        setFiles((prevImages) => {
                          const stateImage = prevImages.find(
                            ({ originalFile: stateImageFile }) =>
                              stateImageFile === originalFile
                          );
                          if (stateImage) {
                            stateImage.uploadError = err.message;
                            stateImage.retryUpload = retryImageUpload;
                            return [...prevImages];
                          }
                          return prevImages;
                        });
                      },
                      onSuccess: (payload) => {
                        if (payload.id) {
                          setFiles((prevImages) => {
                            const stateImage = prevImages.find(
                              ({ originalFile: stateImageFile }) =>
                                stateImageFile === originalFile
                            );
                            if (stateImage) {
                              stateImage.id = payload.id;
                              return [...prevImages];
                            }
                            return prevImages;
                          });
                        }
                      },
                      onComplete: () => {
                        setFiles((prevImages) => {
                          const stateImage = prevImages.find(
                            ({ originalFile: stateImageFile }) =>
                              stateImageFile === originalFile
                          );
                          if (stateImage) {
                            stateImage.uploading = false;
                            delete stateImage.cancelUpload;
                            return [...prevImages];
                          }
                          return prevImages;
                        });
                      },
                    });
                    return {
                      ...newImage,
                      uploading: true,
                      cancelUpload: cancel,
                    };
                  };
                  return uploadImageFile();
                })
              : newImages),
          ];
          setFiles(nextImages);
        }
      };
      fileField.addEventListener('change', changeEventCallback);
      return () => {
        fileField.removeEventListener('change', changeEventCallback);
      };
    }
  }, [convertFilesToBase64, fileField, files, upload]);

  useEffect(() => {
    setFiles((prevFiles) => {
      if (value && hash(value) !== hash(prevFiles)) {
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
          value: [...files],
        },
      });
      onChange(event);
    }
  }, [files, id, name, onChange]);

  return { files, setFiles };
};
