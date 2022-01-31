import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

import { ITextFieldProps } from '../components';
import { IFile, IFileUploadFunction, IUploadableFile } from '../interfaces';
import { useFormikValue } from './utils';

export interface IUseFileUploadOptions
  extends Pick<ITextFieldProps, 'helperText' | 'error' | 'onChange' | 'name'> {
  value?: IFile[];
  fileField?: HTMLInputElement | null;
  upload?: IFileUploadFunction;
}
export const useFileUpload = ({
  fileField,
  upload,
  name,
  value,
  onChange,
}: IUseFileUploadOptions) => {
  const { handleChange } = (useFormikContext() as any) || {};
  value = useFormikValue({ value, name });

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
                return new Promise<IUploadableFile>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () =>
                    resolve({
                      base64: reader.result as string,
                      originalFile: file,
                    });
                  reader.onerror = (error) => reject(error);
                });
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
  }, [fileField, files, upload]);

  useEffect(() => {
    if (
      value &&
      value.map(({ base64 }) => base64).join('') !==
        files.map(({ base64 }) => base64).join('')
    ) {
      setFiles(value);
    }
  }, [files, value]);

  useEffect(() => {
    if (onChange ?? handleChange) {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          value: [...files],
        },
      });
      (onChange ?? handleChange)(event);
    }
  }, [handleChange, files, name, onChange]);

  return { files, setFiles };
};
