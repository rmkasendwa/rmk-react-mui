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
  const velXRef = useRef(0);
  const momentumIdRef = useRef<number>();
  const isDownRef = useRef(false);
  const startXRef = useRef<number>();
  const scrollLeftRef = useRef<number>();
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
      velXRef.current *= 0.95;
      if (Math.abs(velXRef.current) > 0.5) {
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
        if (scrollableElement) {
          isDownRef.current = true;
          startXRef.current = event.pageX - scrollableElement.offsetLeft;
          scrollLeftRef.current = scrollableElement.scrollLeft;
          cancelMomentumTracking();
        }
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
        if (startXRef.current && scrollLeftRef.current) {
          const x = event.pageX - scrollableElement.offsetLeft;
          const walk = (x - startXRef.current) * 3; //scroll-fast
          const prevScrollLeft = scrollableElement.scrollLeft;
          scrollableElement.scrollLeft = scrollLeftRef.current - walk;
          velXRef.current = scrollableElement.scrollLeft - prevScrollLeft;
        }
      };

      targetElement.addEventListener('mousedown', mouseDownEventCallback);
      targetElement.addEventListener('mouseleave', mouseLeaveEventCallback);
      targetElement.addEventListener('mouseup', mouseUpEventCallback);
      targetElement.addEventListener('mousemove', mouseMoveEventCallback);

      return () => {
        targetElement.removeEventListener('mousedown', mouseDownEventCallback);
        targetElement.removeEventListener(
          'mouseleave',
          mouseLeaveEventCallback
        );
        targetElement.removeEventListener('mouseup', mouseUpEventCallback);
        targetElement.removeEventListener('mousemove', mouseMoveEventCallback);
      };
    }
  }, [scrollableElement, targetElement]);
};
