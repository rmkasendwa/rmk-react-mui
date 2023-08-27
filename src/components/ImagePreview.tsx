import CloseIcon from '@mui/icons-material/Close';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Modal, { ModalProps } from '@mui/material/Modal';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

export interface ImagePreviewClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ImagePreviewClassKey = keyof ImagePreviewClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiImagePreview: ImagePreviewProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiImagePreview: keyof ImagePreviewClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiImagePreview?: {
      defaultProps?: ComponentsProps['MuiImagePreview'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiImagePreview'];
      variants?: ComponentsVariants['MuiImagePreview'];
    };
  }
}
//#endregion

export const getImagePreviewUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiImagePreview', slot);
};

const slots: Record<ImagePreviewClassKey, [ImagePreviewClassKey]> = {
  root: ['root'],
};

export const imagePreviewClasses: ImagePreviewClasses = generateUtilityClasses(
  'MuiImagePreview',
  Object.keys(slots) as ImagePreviewClassKey[]
);

export interface ImagePreviewProps extends Omit<ModalProps, 'children'> {
  imageSource?: string;
}

export const ImagePreview = forwardRef<HTMLDivElement, ImagePreviewProps>(
  function ImagePreview(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiImagePreview' });
    const { className, imageSource, onClose, ...rest } = props;

    const classes = composeClasses(
      slots,
      getImagePreviewUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const imageScaleRef = useRef(1);
    const translationRef = useRef({ x: 0, y: 0 });
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [userTransformed, setUserTransformed] = useState(false);
    const [imagePreviewElement, setImagePreviewElement] =
      useState<HTMLDivElement | null>(null);

    const { spacing, palette } = useTheme();
    const alphaBGColor = alpha(palette.text.primary, 0.3);

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
        ref={mergeRefs([
          ref,
          (modal: HTMLDivElement) => {
            if (modal) {
              Object.assign(modal.style, {
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              });
            }
          },
        ])}
        {...rest}
        className={clsx(classes.root)}
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
                  <IconButton
                    onClick={() => {
                      onClose?.({}, 'backdropClick');
                    }}
                    sx={{
                      bgcolor: alphaBGColor,
                      '&:hover': {
                        bgcolor: alphaBGColor,
                      },
                      color: palette.background.paper,
                      position: 'fixed',
                      top: spacing(3),
                      right: spacing(3),
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
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
