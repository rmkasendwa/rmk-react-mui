import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  Grid,
  darken,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { CSSProperties, forwardRef, useState } from 'react';

import { useFileUpload } from '../hooks';
import { IFile, ILoadableFile, TFileUploadFunction } from '../interfaces';
import CloseButton from './CloseButton';
import ImagePreview from './ImagePreview';
import { ITextFieldProps } from './InputFields';

export interface IImageSelectorProps
  extends Pick<
    ITextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: IFile[];
  upload?: TFileUploadFunction;
}

export const ImageSelector = forwardRef<HTMLDivElement, IImageSelectorProps>(
  function ImageSelector(
    { helperText, error, onChange, name, id, value, upload },
    ref
  ) {
    const [selectedImageFile, setSelectedImageFile] =
      useState<ILoadableFile | null>(null);
    const [fileField, setFileField] = useState<HTMLInputElement | null>(null);
    const { files: images, setFiles: setImages } = useFileUpload({
      fileField,
      upload,
      name,
      id,
      value,
      onChange,
    });

    const handleClickImageRemoveButton = (index: number) => {
      images.splice(index, 1);
      setImages([...images]);
    };

    const { palette } = useTheme();
    const wrapperStyle: CSSProperties = {};
    error && (wrapperStyle.borderColor = palette.error.main);

    return (
      <>
        <FormControl ref={ref} fullWidth error={error}>
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
            <Grid container spacing={1.5}>
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
