import { ReactNode, useEffect, useRef, useState } from 'react';

const LOAD_NEXT_BOUNDARY_THRESHOLD = 80;

export interface UseLoadOnScrollToBottomOptions {
  element?: HTMLElement | null;
  bottomThreshold?: number;
  load?: () => void;
  onChangeScrollLength?: (scrollLength: {
    scrollTop: number;
    scrollLeft: number;
  }) => void;
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
  dataElementLength,
  paging = false,
  dataElements,
  onSelectDataElement,
  onClose,
  focusedElementIndex: focusedElementIndexProp,
  onChangeFocusedDataElement,
  enableKeyboardNavigationWrapping = false,
  keyboardFocusElement: keyboardFocusElementProp,
}: UseLoadOnScrollToBottomOptions) => {
  // Refs
  const isInitialMountRef = useRef(true);

  const loadRef = useRef(load);
  loadRef.current = load;

  const onChangeScrollLengthRef = useRef(onChangeScrollLength);
  onChangeScrollLengthRef.current = onChangeScrollLength;

  const onChangeFocusedDataElementRef = useRef(onChangeFocusedDataElement);
  onChangeFocusedDataElementRef.current = onChangeFocusedDataElement;

  const onSelectDataElementRef = useRef(onSelectDataElement);
  onSelectDataElementRef.current = onSelectDataElement;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const limit = (() => {
    return (
      (() => {
        if (element?.offsetHeight && dataElementLength) {
          return Math.ceil(element.offsetHeight / dataElementLength);
        }
        return dataElementLength ?? 0;
      })() + 1
    );
  })();

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
    element,
    enableKeyboardNavigationWrapping,
    keyboardFocusElementProp,
  ]);

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
          hasScrolledToBottom &&
          loadRef.current
        ) {
          loadRef.current();
        }
        onChangeScrollLengthRef.current &&
          onChangeScrollLengthRef.current({
            scrollTop,
            scrollLeft,
          });
        if (dataElementLength) {
          setOffset(Math.floor(scrollTop / dataElementLength));
        }
      };
      element.addEventListener('scroll', scrollEventCallback);
      const scrollCallbackTimeout = setTimeout(() => scrollEventCallback(), 0);
      return () => {
        clearTimeout(scrollCallbackTimeout);
        element.removeEventListener('scroll', scrollEventCallback);
      };
    }
  }, [
    bottomThreshold,
    dataElementLength,
    element,
    invertScrollDirection,
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
