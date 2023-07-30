import { useEffect, useRef } from 'react';

export interface DragToScrollProps {
  targetElement?: HTMLElement | null;
  scrollableElement?: HTMLElement | null;
}
export const useDragToScroll = ({
  targetElement,
  scrollableElement = targetElement,
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
  const beginMomentumTracking = () => {
    cancelMomentumTracking();
    momentumIdRef.current = requestAnimationFrame(momentumLoop);
  };
  const beginMomentumTrackingRef = useRef(beginMomentumTracking);
  beginMomentumTrackingRef.current = beginMomentumTracking;

  const cancelMomentumTracking = () => {
    momentumIdRef.current && cancelAnimationFrame(momentumIdRef.current);
  };
  const cancelMomentumTrackingRef = useRef(cancelMomentumTracking);
  cancelMomentumTrackingRef.current = cancelMomentumTracking;

  const momentumLoop = () => {
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
    if (targetElement && scrollableElement) {
      const mouseDownEventCallback = (event: MouseEvent) => {
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
      const mouseLeaveEventCallback = () => {
        isDownRef.current = false;
      };
      const mouseUpEventCallback = () => {
        isDownRef.current = false;
        beginMomentumTrackingRef.current();
      };
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

      targetElement.addEventListener('mousedown', mouseDownEventCallback);
      window.addEventListener('mouseup', mouseUpEventCallback);
      window.addEventListener('mouseleave', mouseLeaveEventCallback);
      window.addEventListener('mousemove', mouseMoveEventCallback);

      return () => {
        targetElement.removeEventListener('mousedown', mouseDownEventCallback);
        window.removeEventListener('mouseup', mouseUpEventCallback);
        window.removeEventListener('mouseleave', mouseLeaveEventCallback);
        window.removeEventListener('mousemove', mouseMoveEventCallback);
      };
    }
  }, [scrollableElement, targetElement]);
};
