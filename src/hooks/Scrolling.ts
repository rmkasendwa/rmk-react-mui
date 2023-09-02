import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Represents the properties for the useDragToScroll hook.
 */
export interface DragToScrollProps {
  /**
   * The element to which the drag-to-scroll functionality is applied.
   */
  targetElementRef?: MutableRefObject<HTMLElement | null | undefined>;

  /**
   * The scrollable element where the content should be scrolled.
   * If not provided, the targetElement will be used as the scrollable element.
   */
  scrollableElementRef?: MutableRefObject<HTMLElement | null | undefined>;

  /**
   * Flag to enable or disable the drag-to-scroll functionality.
   * If set to false, the scrolling behavior will be disabled.
   */
  enableDragToScroll?: boolean;

  cancelMomentumTrackingRef?: MutableRefObject<(() => void) | undefined>;
}

/**
 * Hook to enable drag-to-scroll functionality for an element.
 *
 * @param props The properties for the useDragToScroll hook.
 */
export const useDragToScroll = ({
  targetElementRef,
  scrollableElementRef,
  enableDragToScroll = true,
  cancelMomentumTrackingRef: cancelMomentumTrackingRefProp,
}: DragToScrollProps) => {
  //#region Refs
  const momentumIdRef = useRef<number>();
  const isDownRef = useRef(false);

  const velXRef = useRef(0);
  const velYRef = useRef(0);

  const startXRef = useRef<number>();
  const startYRef = useRef<number>();

  const scrollLeftRef = useRef<number>();
  const scrollTopRef = useRef<number>();
  //#endregion

  //#region Utility functions
  // Function to start tracking momentum when scrolling
  const beginMomentumTracking = () => {
    cancelMomentumTracking();
    momentumIdRef.current = requestAnimationFrame(momentumLoop);
  };
  const beginMomentumTrackingRef = useRef(beginMomentumTracking);
  beginMomentumTrackingRef.current = beginMomentumTracking;

  // Function to cancel the momentum tracking animation
  const cancelMomentumTracking = () => {
    momentumIdRef.current && cancelAnimationFrame(momentumIdRef.current);
  };
  const cancelMomentumTrackingRef = useRef(cancelMomentumTracking);
  cancelMomentumTrackingRef.current = cancelMomentumTracking;
  cancelMomentumTrackingRefProp &&
    (cancelMomentumTrackingRefProp.current = cancelMomentumTracking);

  // Function to handle the momentum animation loop
  const momentumLoop = () => {
    const scrollableElement =
      scrollableElementRef?.current || targetElementRef?.current;
    if (scrollableElement) {
      scrollableElement.scrollLeft += velXRef.current;
      scrollableElement.scrollTop += velYRef.current;
      velXRef.current *= 0.95;
      velYRef.current *= 0.95;
      if (Math.abs(velXRef.current) > 0.5 || Math.abs(velYRef.current) > 0.5) {
        momentumIdRef.current = requestAnimationFrame(momentumLoop);
      }
    }
  };
  const momentumLoopRef = useRef(momentumLoop);
  momentumLoopRef.current = momentumLoop;
  //#endregion

  useEffect(() => {
    const scrollableElement =
      scrollableElementRef?.current || targetElementRef?.current;
    const targetElement = targetElementRef?.current;
    if (enableDragToScroll && targetElement && scrollableElement) {
      // Function to handle the mouse down event
      const mouseDownEventCallback = (event: MouseEvent) => {
        if (event.button !== 0) return;
        window.removeEventListener('mouseup', mouseUpEventCallback);
        window.addEventListener('mouseup', mouseUpEventCallback);
        isDownRef.current = true;

        //#region Compute X
        startXRef.current = event.pageX - scrollableElement.offsetLeft;
        scrollLeftRef.current = scrollableElement.scrollLeft;
        //#endregion

        //#region Compute Y
        startYRef.current = event.pageY - scrollableElement.offsetTop;
        scrollTopRef.current = scrollableElement.scrollTop;
        //#endregion

        cancelMomentumTracking();
      };

      // Function to handle the mouse leave event
      const mouseLeaveEventCallback = () => {
        window.removeEventListener('mouseup', mouseUpEventCallback);
        isDownRef.current = false;
      };

      // Function to handle the mouse up event
      const mouseUpEventCallback = () => {
        window.removeEventListener('mouseup', mouseUpEventCallback);
        isDownRef.current = false;
        beginMomentumTrackingRef.current();
      };

      // Function to handle the mouse move event
      const mouseMoveEventCallback = (event: MouseEvent) => {
        if (!isDownRef.current) return;
        event.preventDefault();
        //#region Compute X
        if (startXRef.current != null && scrollLeftRef.current != null) {
          const x = event.pageX - scrollableElement.offsetLeft;
          const prevScrollLeft = scrollableElement.scrollLeft;
          const walkX = (x - startXRef.current) * 3;
          scrollableElement.scrollLeft = scrollLeftRef.current - walkX;
          velXRef.current = scrollableElement.scrollLeft - prevScrollLeft;
        }
        //#endregion

        //#region Compute Y
        if (startYRef.current != null && scrollTopRef.current != null) {
          const y = event.pageY - scrollableElement.offsetTop;
          const prevScrollTop = scrollableElement.scrollTop;
          const walkY = (y - startYRef.current) * 3;
          scrollableElement.scrollTop = scrollTopRef.current - walkY;
          velYRef.current = scrollableElement.scrollTop - prevScrollTop;
        }
        //#endregion
      };

      //#region Add event listeners
      targetElement.addEventListener('mousedown', mouseDownEventCallback);
      window.addEventListener('mouseleave', mouseLeaveEventCallback);
      window.addEventListener('mousemove', mouseMoveEventCallback);
      //#endregion

      //#region Clean up event listeners when the component is unmounted
      return () => {
        targetElement.removeEventListener('mousedown', mouseDownEventCallback);
        window.removeEventListener('mouseup', mouseUpEventCallback);
        window.removeEventListener('mouseleave', mouseLeaveEventCallback);
        window.removeEventListener('mousemove', mouseMoveEventCallback);
      };
      //#endregion
    }
  }, [enableDragToScroll, scrollableElementRef, targetElementRef]);
};
