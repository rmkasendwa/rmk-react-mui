import Box, { BoxProps } from '@mui/material/Box';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';

export interface IDefaultPlaceholderDimensions {
  width: number;
  height: number;
}

export interface IRenderIfVisibleProps {
  /**
   * Whether the element should be visible initially or not.
   * Useful e.g. for always setting the first N items to visible.
   * Default: false
   */
  initialVisible?: boolean;
  /**
   * How far outside the viewport in pixels should elements be considered visible?
   */
  visibleOffset?: number;
  /**
   * Should the element stay rendered after it becomes visible?
   */
  stayRendered?: boolean;
  rootNode?: HTMLElement | null;
  /**
   * The element to render is visible
   */
  children: ReactNode;
  /**
   * The default dimensions given to the placeholder element to avoid flickering.
   * Note: The placeholder dimensions will change when the element is rendered
   * if they are different from the element dimensions
   */
  defaultPlaceholderDimensions?: IDefaultPlaceholderDimensions;
  /**
   * Props to be assigned to placeholder element
   */
  PlaceholderProps?: Partial<BoxProps>;
}

export const RenderIfVisible: FC<IRenderIfVisibleProps> = ({
  initialVisible = false,
  visibleOffset = 1000,
  stayRendered = false,
  rootNode = null,
  children,
  defaultPlaceholderDimensions = { width: 0, height: 0 },
  PlaceholderProps = {},
}) => {
  const { sx: placeholderPropsSx, ...placeholderPropsRest } = PlaceholderProps;
  const [isVisible, setIsVisible] = useState(initialVisible);
  const wasVisible = useRef(initialVisible);
  const placeholderDimensionsRef = useRef(defaultPlaceholderDimensions);
  const wrapperElementRef = useRef<HTMLDivElement>(null);

  // Set visibility with intersection observer
  useEffect(() => {
    if (wrapperElementRef.current) {
      const wrapperElement = wrapperElementRef.current!;
      const observer = new IntersectionObserver(
        (entries) => {
          // Before switching off `isVisible`, set the height of the placeholder
          if (!entries[0].isIntersecting) {
            placeholderDimensionsRef.current = {
              width: wrapperElement.offsetWidth,
              height: wrapperElement.offsetHeight,
            };
          }
          if (typeof window !== undefined && window.requestIdleCallback) {
            window.requestIdleCallback(
              () => setIsVisible(entries[0].isIntersecting),
              {
                timeout: 600,
              }
            );
          } else {
            setIsVisible(entries[0].isIntersecting);
          }
        },
        {
          root: rootNode,
          rootMargin: `${visibleOffset}px 0px ${visibleOffset}px 0px`,
        }
      );
      observer.observe(wrapperElement);
      return () => {
        if (wrapperElement) {
          observer.unobserve(wrapperElement);
        }
      };
    }
  }, [rootNode, visibleOffset]);

  useEffect(() => {
    if (isVisible) {
      wasVisible.current = true;
    }
  }, [isVisible]);

  return (
    <Box ref={wrapperElementRef}>
      {(() => {
        if (isVisible || (stayRendered && wasVisible.current)) {
          return children;
        }
        return (
          <Box
            {...placeholderPropsRest}
            sx={{
              ...placeholderPropsSx,
              ...placeholderDimensionsRef.current,
            }}
          />
        );
      })()}
    </Box>
  );
};

export default RenderIfVisible;
