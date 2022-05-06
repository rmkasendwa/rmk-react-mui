import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Card,
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
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageScale, setImageScale] = useState(1);
    const [userTransformed, setUserTransformed] = useState(false);
    const { palette } = useTheme();
    const alphaBGColor = alpha(palette.text.primary, 0.3);

    useEffect(() => {
      if (imageSource) {
        setImage(null);
        setUserTransformed(false);
      }
    }, [imageSource]);

    useEffect(() => {
      if (imageSource) {
        const image = new Image();
        const adjustImageScale = () => {
          if (!userTransformed) {
            const {
              innerWidth: windowInnerWidth,
              innerHeight: windowInnerHeight,
            } = window;
            const { width, height } = image;
            const windowAspectRatio = windowInnerWidth / windowInnerHeight;
            const imageAspectRatio = width / height;
            setImageScale(() => {
              const scale = (() => {
                if (imageAspectRatio > windowAspectRatio) {
                  return (windowInnerWidth - 50) / width;
                } else {
                  return (windowInnerHeight - 50) / height;
                }
              })();
              if (scale < 1) {
                return scale;
              }
              return 1;
            });
          }
        };
        const windowResizeCallback = () => adjustImageScale();
        image.onload = () => {
          adjustImageScale();
          setImage(image);
        };
        image.src = imageSource;
        window.addEventListener('resize', windowResizeCallback);
        return () => {
          window.removeEventListener('resize', windowResizeCallback);
        };
      }
    }, [imageSource, userTransformed]);

    useEffect(() => {
      const mousewheelCallback = (event: any) => {
        setImageScale((prevImageScale) => {
          const delta = event.wheelDelta ?? -event.detail;
          if (delta > 0) {
            const nextImageScale = prevImageScale + 0.1;
            if (nextImageScale > 4) {
              return 4;
            }
            return nextImageScale;
          } else {
            const nextImageScale = prevImageScale - 0.1;
            if (nextImageScale < 0.25) {
              return 0.25;
            }
            return nextImageScale;
          }
        });
        setUserTransformed(true);
      };
      window.addEventListener('mousewheel', mousewheelCallback);
      return () => {
        window.removeEventListener('mousewheel', mousewheelCallback);
      };
    }, []);

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
                  <Card
                    sx={{
                      transform: `scale(${imageScale})`,
                      width: image?.width,
                      height: image?.height,
                      backgroundImage: `url(${imageSource})`,
                    }}
                  />
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
