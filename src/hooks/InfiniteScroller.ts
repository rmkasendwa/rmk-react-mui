import { useEffect, useRef } from 'react';

const LOAD_NEXT_BOUNDARY_THRESHOLD = 80;

export interface UseLoadOnScrollToBottomOptions {
  element?: HTMLElement;
  bottomThreshold?: number;
  load: () => void;
  onChangeScrollLength?: (scrollLength: {
    scrollTop: number;
    scrollLeft: number;
  }) => void;
  shouldLoadOnScroll?: boolean;
  invertScrollDirection?: boolean;
}

/**
 * Calls the load function when an element is scrolled to bottom
 */
export const useLoadOnScrollToBottom = ({
  element,
  bottomThreshold = LOAD_NEXT_BOUNDARY_THRESHOLD,
  load,
  onChangeScrollLength,
  shouldLoadOnScroll = true,
  invertScrollDirection = false,
}: UseLoadOnScrollToBottomOptions) => {
  // Refs
  const loadRef = useRef(load);
  const onChangeScrollLengthRef = useRef(onChangeScrollLength);
  useEffect(() => {
    loadRef.current = load;
    onChangeScrollLengthRef.current = onChangeScrollLength;
  }, [load, onChangeScrollLength]);

  useEffect(() => {
    if (element && shouldLoadOnScroll) {
      const scrollEventCallback = () => {
        const scrollTop = Math.abs(element.scrollTop);
        const scrollLeft = Math.abs(element.scrollLeft);
        const hasScrolledToBottom = (() => {
          if (invertScrollDirection) {
            return scrollTop < bottomThreshold;
          }
          return (
            Math.abs(scrollTop + element.offsetHeight - element.scrollHeight) <
            bottomThreshold
          );
        })();
        if (
          element.scrollHeight > element.offsetHeight &&
          hasScrolledToBottom
        ) {
          loadRef.current();
        }
        onChangeScrollLengthRef.current &&
          onChangeScrollLengthRef.current({
            scrollTop,
            scrollLeft,
          });
      };
      element.addEventListener('scroll', scrollEventCallback);
      scrollEventCallback();
      return () => {
        element.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [bottomThreshold, element, invertScrollDirection, shouldLoadOnScroll]);
};
