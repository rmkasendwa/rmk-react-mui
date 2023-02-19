import { useEffect, useRef } from 'react';

const LOAD_NEXT_BOUNDARY_THRESHOLD = 80;

export interface UseLoadOnScrollToBottomOptions {
  element?: HTMLElement;
  bottomThreshold?: number;
  load: () => void;
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
  shouldLoadOnScroll = true,
  invertScrollDirection = false,
}: UseLoadOnScrollToBottomOptions) => {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    if (element && shouldLoadOnScroll) {
      const scrollEventCallback = () => {
        const scrollTop = Math.abs(element.scrollTop);
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
      };
      element.addEventListener('scroll', scrollEventCallback);
      scrollEventCallback();
      return () => {
        element.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [bottomThreshold, element, invertScrollDirection, shouldLoadOnScroll]);
};
