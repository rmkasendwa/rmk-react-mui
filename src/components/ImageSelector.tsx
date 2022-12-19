import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { darken } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { CSSProperties, forwardRef, useEffect, useState } from 'react';

import { useFileUpload } from '../hooks/Files';
import {
  FileContainer,
  FileUploadFunction,
  LoadableFile,
} from '../interfaces/Utils';
import { flickerElement } from '../utils/page';
import CloseButton from './CloseButton';
import ImagePreview from './ImagePreview';
import { TextFieldProps } from './InputFields/TextField';

export interface ImageSelectorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ImageSelectorClassKey = keyof ImageSelectorClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiImageSelector: ImageSelectorProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiImageSelector: keyof ImageSelectorClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiImageSelector?: {
      defaultProps?: ComponentsProps['MuiImageSelector'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiImageSelector'];
      variants?: ComponentsVariants['MuiImageSelector'];
    };
  }
}

export interface ImageSelectorProps
  extends Pick<
    TextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id' | 'className'
  > {
  value?: FileContainer[];
  upload?: FileUploadFunction;
}

export function getImageSelectorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiImageSelector', slot);
}

export const imageSelectorClasses: ImageSelectorClasses =
  generateUtilityClasses('MuiImageSelector', ['root']);

const slots = {
  root: ['root'],
};

export const ImageSelector = forwardRef<HTMLDivElement, ImageSelectorProps>(
  function ImageSelector(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiImageSelector' });
    const {
      className,
      helperText,
      error,
      onChange,
      name,
      id,
      value,
      upload,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getImageSelectorUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const [imageThumbnailContainer, setImageThumbnailContainer] =
      useState<HTMLDivElement | null>(null);
    const [selectedImageFile, setSelectedImageFile] =
      useState<LoadableFile | null>(null);
    const [fileField, setFileField] = useState<HTMLInputElement | null>(null);

    const {
      files: images,
      setFiles: setImages,
      duplicateFileSelections,
    } = useFileUpload({
      fileField,
      upload,
      name,
      id,
      value,
      onChange,
    });

    const handleClickImageRemoveButton = (index: number) => {
      setImages((prevImages) => {
        prevImages.splice(index, 1);
        return [...prevImages];
      });
    };

    useEffect(() => {
      if (imageThumbnailContainer && duplicateFileSelections.length > 0) {
        [
          ...imageThumbnailContainer.querySelectorAll(
            '.image-selector-thumbnail'
          ),
        ]
          .filter((_, index) => {
            return duplicateFileSelections.includes(index);
          })
          .forEach((thumbnail) => flickerElement(thumbnail));
      }
    }, [duplicateFileSelections, imageThumbnailContainer]);

    const { palette } = useTheme();
    const wrapperStyle: CSSProperties = {};
    error && (wrapperStyle.borderColor = palette.error.main);

    return (
      <>
        <FormControl
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          fullWidth
          error={error}
        >
          <Card
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: darken(palette.background.paper, 0.03),
              borderStyle: 'dashed',
              ...wrapperStyle,
            }}
          >
            <input
              type="file"
              ref={(fileField) => {
                setFileField(fileField);
              }}
              multiple
              accept=".jpg,.png,.jpeg,.bmp"
              style={{ display: 'none' }}
            />
            <Grid
              ref={(imageThumbnailContainer) => {
                setImageThumbnailContainer(imageThumbnailContainer);
              }}
              container
              spacing={1.5}
            >
              {images.map((image, index) => {
                const {
                  base64,
                  uploading,
                  uploadProgress,
                  uploadError,
                  cancelUpload,
                  retryUpload,
                } = image;
                return (
                  <Grid item xs={4} sm={3} md={2} key={index}>
                    <Card
                      className="image-selector-thumbnail"
                      onClick={() => setSelectedImageFile(image)}
                      sx={{
                        borderRadius: 1,
                        position: 'relative',
                        cursor: 'zoom-in',
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
                        <CloseButton
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClickImageRemoveButton(index);
                            cancelUpload && cancelUpload();
                          }}
                          size="small"
                          IconProps={{ sx: { fontSize: '12px' } }}
                        />
                        {retryUpload && (
                          <CloseButton
                            onClick={(event) => {
                              event.stopPropagation();
                              retryUpload();
                            }}
                            size="small"
                            icon={<ReplayIcon sx={{ fontSize: '12px' }} />}
                          />
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
              })}
              <Grid item xs={4} sm={3} md={2}>
                <Button
                  onClick={() => {
                    fileField?.click();
                  }}
                  sx={{
                    borderRadius: 1,
                    width: '100%',
                    height: `80px !important`,
                    bgcolor: palette.background.paper,
                    color: '#BABCC1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    '&:hover': {
                      bgcolor: palette.background.paper,
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
        <ImagePreview
          open={Boolean(selectedImageFile)}
          onClose={() => setSelectedImageFile(null)}
          imageSource={selectedImageFile?.base64}
        />
      </>
    );
  }
);

export default ImageSelector;
