import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  alpha,
  darken,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

import { IFile, IFileUploadFunction, IUploadableFile } from '../interfaces';
import { ITextFieldProps } from './InputFields';

export interface IImageSelectorProps
  extends Pick<ITextFieldProps, 'helperText' | 'error' | 'onChange'> {
  value?: IFile[];
  setFieldValue?: (value: IFile[]) => void;
  onChange?: any;
  upload?: IFileUploadFunction;
}

export const ImageSelector: FC<IImageSelectorProps> = ({
  helperText,
  error,
  setFieldValue,
  value,
  upload,
}) => {
  const fileFieldRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<IUploadableFile[]>([]);

  const handleClick = () => {
    fileFieldRef?.current?.click();
  };
  const handleClickImageRemoveButton = (index: number) => {
    images.splice(index, 1);
    setFieldValue ? setFieldValue([...images]) : setImages([...images]);
  };

  useEffect(() => {
    if (fileFieldRef.current) {
      const fileFieldNode = fileFieldRef.current;
      const changeEventCallback = async () => {
        if (fileFieldNode.files && fileFieldNode.files.length > 0) {
          const existingFileNames: string[] = images.map(
            (image) => image.originalFile.name + image.originalFile.size
          );
          const newImages = await Promise.all(
            [...fileFieldNode.files]
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
          fileFieldNode.value = '';
          const nextImages = [
            ...images,
            ...(upload
              ? newImages.map((newImage) => {
                  const { originalFile } = newImage;
                  const retryImageUpload = () => {
                    setImages((prevImages) => {
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
                        setImages((prevImages) => {
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
                        setImages((prevImages) => {
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
                          setImages((prevImages) => {
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
                        setImages((prevImages) => {
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
          (setFieldValue || setImages)(nextImages);
        }
      };
      fileFieldNode.addEventListener('change', changeEventCallback);
      return () => {
        fileFieldNode.removeEventListener('change', changeEventCallback);
      };
    }
  }, [images, setFieldValue, upload]);

  useEffect(() => {
    if (
      value &&
      value.map(({ base64 }) => base64).join('') !==
        images.map(({ base64 }) => base64).join('')
    ) {
      setImages(value);
    }
  }, [images, value]);

  const theme = useTheme();

  const alphaBGColor = alpha(theme.palette.text.primary, 0.3);
  const wrapperStyle: CSSProperties = {};
  error && (wrapperStyle.borderColor = theme.palette.error.main);

  return (
    <FormControl fullWidth error={error}>
      <Card
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: darken(theme.palette.background.paper, 0.03),
          borderStyle: 'dashed',
          ...wrapperStyle,
        }}
      >
        <input
          type="file"
          ref={fileFieldRef}
          multiple
          accept=".jpg,.png,.jpeg,.bmp"
          style={{ display: 'none' }}
        />
        <Grid container spacing={1.5}>
          {images.map(
            (
              {
                base64,
                uploading,
                uploadProgress,
                uploadError,
                cancelUpload,
                retryUpload,
              },
              index
            ) => {
              return (
                <Grid item xs={4} sm={3} md={2} key={index}>
                  <Card
                    sx={{
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <Avatar
                      sx={{
                        borderRadius: 1,
                        width: '100%',
                        height: 80,
                        bgcolor: '#fff',
                        opacity: uploading || uploadError ? 0.3 : 1,
                      }}
                      src={base64}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 5,
                        top: 5,
                        display: 'flex',
                        gap: '5px',
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          handleClickImageRemoveButton(index);
                          cancelUpload && cancelUpload();
                        }}
                        sx={{
                          bgcolor: alphaBGColor,
                          '&:hover': {
                            bgcolor: alphaBGColor,
                          },
                          color: theme.palette.background.paper,
                        }}
                        size="small"
                      >
                        <CloseIcon sx={{ fontSize: '12px' }} />
                      </IconButton>
                      {retryUpload && (
                        <IconButton
                          onClick={retryUpload}
                          sx={{
                            bgcolor: alphaBGColor,
                            '&:hover': {
                              bgcolor: alphaBGColor,
                            },
                            color: theme.palette.background.paper,
                          }}
                          size="small"
                        >
                          <ReplayIcon sx={{ fontSize: '12px' }} />
                        </IconButton>
                      )}
                    </Box>
                    {uploadProgress && (uploading || uploadError) ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          height: 3,
                          borderRadius: '4px',
                          width: `${uploadProgress}%`,
                          bgcolor: uploadError ? '#D04437' : '#006BFF',
                          bottom: 0,
                        }}
                      />
                    ) : null}
                  </Card>
                </Grid>
              );
            }
          )}
          <Grid item xs={4} sm={3} md={2}>
            <Button
              onClick={handleClick}
              sx={{
                borderRadius: 1,
                width: '100%',
                height: `80px !important`,
                bgcolor: theme.palette.background.paper,
                color: '#BABCC1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: 'none',
                '&:hover': {
                  bgcolor: theme.palette.background.paper,
                },
              }}
            >
              <CameraAltIcon />
              <Typography
                variant="body2"
                sx={{ fontSize: 12, color: '#BABCC1' }}
              >
                Add Photos
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Card>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ImageSelector;
