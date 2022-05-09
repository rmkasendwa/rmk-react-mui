import { Card, Modal, ModalProps, useTheme } from '@mui/material';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import CloseButton from './CloseButton';

export interface IImagePreviewProps extends Omit<ModalProps, 'children'> {
  imageSource?: string;
}

export const ImagePreview = forwardRef<HTMLDivElement, IImagePreviewProps>(
  function ImagePreview({ imageSource, onClose, ...rest }, ref) {
    const imageScaleRef = useRef(1);
    const translationRef = useRef({ x: 0, y: 0 });
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [userTransformed, setUserTransformed] = useState(false);
    const [imagePreviewElement, setImagePreviewElement] =
      useState<HTMLDivElement | null>(null);

    const { spacing } = useTheme();

    const transformImagePreview = useCallback(() => {
      if (imagePreviewElement) {
        imagePreviewElement.style.transform = `translate(${translationRef.current.x}px, ${translationRef.current.y}px) scale(${imageScaleRef.current})`;
      }
    }, [imagePreviewElement]);

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
            imageScaleRef.current = (() => {
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
            })();
            transformImagePreview();
          }
        };
        const windowResizeCallback = () => adjustImageScale();
        image.onload = () => {
          adjustImageScale();
          setImage(image);
          translationRef.current = { x: 0, y: 0 };
        };
        image.src = imageSource;
        window.addEventListener('resize', windowResizeCallback);
        return () => {
          window.removeEventListener('resize', windowResizeCallback);
        };
      }
    }, [imageSource, transformImagePreview, userTransformed]);

    useEffect(() => {
      const mousewheelCallback = (event: any) => {
        imageScaleRef.current = (() => {
          const delta = event.wheelDelta ?? -event.detail;
          if (delta > 0) {
            const nextImageScale = imageScaleRef.current + 0.1;
            if (nextImageScale > 4) {
              return 4;
            }
            return nextImageScale;
          } else {
            const nextImageScale = imageScaleRef.current - 0.1;
            if (nextImageScale < 0.25) {
              return 0.25;
            }
            return nextImageScale;
          }
        })();
        transformImagePreview();
        setUserTransformed(true);
      };
      window.addEventListener('mousewheel', mousewheelCallback);
      return () => {
        window.removeEventListener('mousewheel', mousewheelCallback);
      };
    }, [transformImagePreview]);

    useEffect(() => {
      if (imagePreviewElement) {
        let mousemoveCallback: (event: MouseEvent) => void;
        const mousedownCallback = (event: MouseEvent) => {
          let { clientX: initalClientX, clientY: initalClientY } = event;
          mousemoveCallback = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const dX = clientX - initalClientX;
            const dY = clientY - initalClientY;
            const { x, y } = translationRef.current;
            translationRef.current = {
              x: x + dX,
              y: y + dY,
            };
            initalClientX = clientX;
            initalClientY = clientY;
            transformImagePreview();
          };
          window.addEventListener('mousemove', mousemoveCallback);
        };
        const mouseupCallback = () => {
          window.removeEventListener('mousemove', mousemoveCallback);
        };
        imagePreviewElement.addEventListener('mousedown', mousedownCallback);
        window.addEventListener('mouseup', mouseupCallback);
        return () => {
          imagePreviewElement.removeEventListener(
            'mousedown',
            mousedownCallback
          );
          window.removeEventListener('mouseup', mouseupCallback);
          window.removeEventListener('mousemove', mousemoveCallback);
        };
      }
    }, [imagePreviewElement, transformImagePreview]);

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
                    ref={(imagePreviewElement) => {
                      setImagePreviewElement(imagePreviewElement);
                    }}
                    sx={{
                      transform: `translate(${translationRef.current.x}px, ${translationRef.current.y}px) scale(${imageScaleRef.current})`,
                      width: image?.width,
                      height: image?.height,
                      backgroundImage: `url(${imageSource})`,
                      cursor: 'move',
                    }}
                  />
                  <CloseButton
                    onClick={() => {
                      onClose && onClose({}, 'backdropClick');
                    }}
                    sx={{
                      position: 'fixed',
                      top: spacing(3),
                      right: spacing(3),
                    }}
                  />
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
