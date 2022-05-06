import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Grid,
  IconButton,
  Modal,
  ModalProps,
  alpha,
  useTheme,
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';

export interface IImagePreviewProps extends Omit<ModalProps, 'children'> {
  imageSource?: string;
}

export const ImagePreview = forwardRef<HTMLDivElement, IImagePreviewProps>(
  function ImagePreview({ imageSource, onClose, ...rest }, ref) {
    const [imageScale, setImageScale] = useState(1);
    const { palette } = useTheme();
    const alphaBGColor = alpha(palette.text.primary, 0.3);
    useEffect(() => {
      if (imageSource) {
        const image = new Image();
        image.onload = () => {
          const {
            innerWidth: windowInnerWidth,
            innerHeight: windowInnerHeight,
          } = window;
          const { width, height } = image;
          const windowAspectRatio = windowInnerWidth / windowInnerHeight;
          const imageAspectRatio = width / height;
          if (imageAspectRatio > windowAspectRatio) {
            setImageScale((windowInnerWidth - 50) / width);
          } else {
            setImageScale((windowInnerHeight - 50) / height);
          }
        };
        image.src = imageSource;
      }
    }, [imageSource]);

    return (
      <Modal
        {...rest}
        {...{ onClose }}
        ref={(modal: HTMLDivElement) => {
          if (modal) {
            Object.assign(modal.style, {
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            });
          }
          typeof ref === 'function' && ref(modal);
        }}
      >
        <>
          {(() => {
            if (imageSource) {
              return (
                <>
                  <Box
                    sx={{
                      transform: `scale(${imageScale})`,
                    }}
                  >
                    <img src={imageSource} alt="Selected File" />
                  </Box>
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 0,
                      right: 0,
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        alignItems: 'center',
                      }}
                    >
                      <Grid item sx={{ p: 3 }}>
                        <IconButton
                          onClick={() => {
                            onClose && onClose({}, 'backdropClick');
                          }}
                          sx={{
                            bgcolor: alphaBGColor,
                            '&:hover': {
                              bgcolor: alphaBGColor,
                            },
                            color: palette.background.paper,
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              );
            }
          })()}
        </>
      </Modal>
    );
  }
);

export default ImagePreview;
