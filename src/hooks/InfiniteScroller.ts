import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';

const LOAD_NEXT_BOUNDARY_THRESHOLD = 80;

export interface UseLoadOnScrollToBottomOptions {
  element?: HTMLElement | null;
  elementRef?: RefObject<HTMLElement | null | undefined>;
  bottomThreshold?: number;
  load?: () => void;
  onChangeScrollLength?: (scrollLength: {
    scrollTop: number;
    scrollLeft: number;
  }) => void;
  changeEventCallbackTimeout?: number;
  shouldLoadOnScroll?: boolean;
  invertScrollDirection?: boolean;
  paging?: boolean;
  dataElements?: ReactNode[];
  dataElementLength?: number;
  focusedElementIndex?: number;
  keyboardFocusElement?: HTMLElement | HTMLElement[] | null;
  onChangeFocusedDataElement?: (dataElementIndex: number) => void;
  onSelectDataElement?: (dataElementIndex: number) => void;
  onClose?: () => void;
  enableKeyboardNavigationWrapping?: boolean;
  orientation?: 'vertical' | 'horizontal';
  revalidationKey?: string;
}

/**
 * Calls the load function when an element is scrolled to bottom
 */
export const useLoadOnScrollToBottom = ({
  elementRef,
  element: elementProp,
  bottomThreshold = LOAD_NEXT_BOUNDARY_THRESHOLD,
  load,
  onChangeScrollLength,
  changeEventCallbackTimeout = 0,
  shouldLoadOnScroll = true,
  invertScrollDirection = false,
  dataElementLength,
  paging = false,
  dataElements,
  onSelectDataElement,
  onClose,
  focusedElementIndex: focusedElementIndexProp,
  onChangeFocusedDataElement,
  enableKeyboardNavigationWrapping = false,
  keyboardFocusElement: keyboardFocusElementProp,
  orientation = 'vertical',
  revalidationKey,
}: UseLoadOnScrollToBottomOptions) => {
  //#region Refs
  const isInitialMountRef = useRef(true);

  const loadRef = useRef(load);
  loadRef.current = load;

  const onChangeScrollLengthRef = useRef(onChangeScrollLength);
  onChangeScrollLengthRef.current = onChangeScrollLength;
  const changeEventCallbackTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const onChangeFocusedDataElementRef = useRef(onChangeFocusedDataElement);
  onChangeFocusedDataElementRef.current = onChangeFocusedDataElement;

  const onSelectDataElementRef = useRef(onSelectDataElement);
  onSelectDataElementRef.current = onSelectDataElement;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  //#endregion

  const limit = Math.max(
    25,
    (() => {
      const element = elementProp ?? elementRef?.current;
      if (element?.offsetHeight && dataElementLength) {
        return Math.ceil(element.offsetHeight / dataElementLength);
      }
      return dataElementLength ?? 0;
    })()
  );

  const [offset, setOffset] = useState(0);

  const [focusedElementIndex, setFocusedElementIndex] = useState(
    focusedElementIndexProp
  );

  useEffect(() => {
    if (focusedElementIndexProp != null) {
      setFocusedElementIndex(focusedElementIndexProp);
    }
  }, [focusedElementIndexProp]);

  useEffect(() => {
    if (!isInitialMountRef.current && focusedElementIndex != null) {
      onChangeFocusedDataElementRef.current &&
        onChangeFocusedDataElementRef.current(focusedElementIndex);
    }
  }, [focusedElementIndex]);

  useEffect(() => {
    const keyboardFocusElements: HTMLElement[] = [];
    if (keyboardFocusElementProp) {
      if (Array.isArray(keyboardFocusElementProp)) {
        keyboardFocusElements.push(...keyboardFocusElementProp);
      } else {
        keyboardFocusElements.push(keyboardFocusElementProp);
      }
    }

    const element = elementProp ?? elementRef?.current;
    if (element) {
      keyboardFocusElements.push(element);
    }
    if (dataElements && dataElementLength && keyboardFocusElements.length > 0) {
      const keydownCallback = (event: KeyboardEvent) => {
        setFocusedElementIndex((prevFocusedElementIndex = -1) => {
          const nextFocusedOptionIndex = (() => {
            switch (event.key) {
              case 'ArrowUp':
                event.preventDefault();
                if (
                  enableKeyboardNavigationWrapping ||
                  !loadRef.current ||
                  prevFocusedElementIndex > 0
                ) {
                  return (
                    (!!prevFocusedElementIndex
                      ? prevFocusedElementIndex
                      : dataElements.length) - 1
                  );
                }
                return 0;
              case 'ArrowDown':
                event.preventDefault();
                return (prevFocusedElementIndex + 1) % dataElements.length;
              case 'Enter':
              case 'Tab':
                if (
                  prevFocusedElementIndex != null &&
                  onSelectDataElementRef.current
                ) {
                  event.preventDefault();
                  onSelectDataElementRef.current(prevFocusedElementIndex);
                }
                break;
              case 'Escape':
                if (onCloseRef.current) {
                  event.preventDefault();
                  onCloseRef.current();
                }
                break;
            }
          })();
          if (nextFocusedOptionIndex != null && element?.offsetHeight) {
            if (element) {
              const nextFocusedOptionScrollTop =
                nextFocusedOptionIndex * dataElementLength;
              const { scrollTop: scrollUpperBound } = element;
              const scrollLowerBound = scrollUpperBound + element.offsetHeight;

              if (
                nextFocusedOptionScrollTop + dataElementLength >
                scrollLowerBound
              ) {
                element.scrollTop =
                  scrollUpperBound +
                  nextFocusedOptionScrollTop +
                  dataElementLength -
                  scrollLowerBound;
              }
              if (nextFocusedOptionScrollTop < scrollUpperBound) {
                element.scrollTop = nextFocusedOptionScrollTop;
              }
              return nextFocusedOptionIndex;
            }
          }
          return prevFocusedElementIndex >= 0 ? prevFocusedElementIndex : 0;
        });
      };
      keyboardFocusElements.forEach((element) => {
        element.addEventListener('keydown', keydownCallback);
      });
      return () => {
        keyboardFocusElements.forEach((element) => {
          element.removeEventListener('keydown', keydownCallback);
        });
      };
    }
  }, [
    dataElementLength,
    dataElements,
    elementProp,
    elementRef,
    enableKeyboardNavigationWrapping,
    keyboardFocusElementProp,
  ]);

  useEffect(() => {
    const element = elementProp ?? elementRef?.current;
    if (element && shouldLoadOnScroll) {
      revalidationKey;
      const scrollEventCallback = () => {
        const scrollTop = Math.abs(element.scrollTop);
        const scrollLeft = Math.abs(element.scrollLeft);
        switch (orientation) {
          case 'vertical':
            {
              const hasScrolledToBottom = (() => {
                if (invertScrollDirection) {
                  return scrollTop < bottomThreshold;
                }
                return (
                  Math.abs(
                    scrollTop + element.offsetHeight - element.scrollHeight
                  ) < bottomThreshold
                );
              })();
              if (
                element.scrollHeight > element.offsetHeight &&
                hasScrolledToBottom &&
                loadRef.current
              ) {
                loadRef.current();
              }
            }
            break;
          case 'horizontal':
            {
              const hasScrolledToBottom = (() => {
                if (invertScrollDirection) {
                  return scrollLeft < bottomThreshold;
                }
                return (
                  Math.abs(
                    scrollLeft + element.offsetWidth - element.scrollWidth
                  ) < bottomThreshold
                );
              })();
              if (
                element.scrollWidth > element.offsetWidth &&
                hasScrolledToBottom &&
                loadRef.current
              ) {
                loadRef.current();
              }
            }
            break;
        }
        clearTimeout(changeEventCallbackTimeoutRef.current);
        changeEventCallbackTimeoutRef.current = setTimeout(() => {
          onChangeScrollLengthRef.current?.({
            scrollTop,
            scrollLeft,
          });
        }, changeEventCallbackTimeout);
        if (dataElementLength) {
          setOffset(Math.floor(scrollTop / dataElementLength));
        }
      };
      element.addEventListener('scroll', scrollEventCallback);
      scrollEventCallback();
      return () => {
        element.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [
    bottomThreshold,
    changeEventCallbackTimeout,
    dataElementLength,
    elementProp,
    elementRef,
    invertScrollDirection,
    orientation,
    revalidationKey,
    shouldLoadOnScroll,
  ]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const displayableDataSet = (() => {
    if (dataElements) {
      return paging ? dataElements.slice(offset, offset + limit) : dataElements;
    }
  })();

  const dataElementsContainerHeight = (() => {
    if (paging && dataElementLength && dataElements) {
      return dataElements.length * dataElementLength;
    }
  })();

  const dataElementsContainerFillerElementHeight = (() => {
    if (dataElementLength) {
      return offset * dataElementLength;
    }
  })();

  return {
    dataElementsContainerHeight,
    dataElementsContainerFillerElementHeight,
    displayableDataSet,
  };
};
