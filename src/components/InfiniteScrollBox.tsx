import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import {
  UseLoadOnScrollToBottomOptions,
  useLoadOnScrollToBottom,
} from '../hooks/InfiniteScroller';
import RenderIfVisible from './RenderIfVisible';

export interface InfiniteScrollBoxClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type InfiniteScrollBoxClassKey = keyof InfiniteScrollBoxClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiInfiniteScrollBox: InfiniteScrollBoxProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiInfiniteScrollBox: keyof InfiniteScrollBoxClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiInfiniteScrollBox?: {
      defaultProps?: ComponentsProps['MuiInfiniteScrollBox'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiInfiniteScrollBox'];
      variants?: ComponentsVariants['MuiInfiniteScrollBox'];
    };
  }
}

export interface InfiniteScrollBoxProps
  extends Partial<BoxProps>,
    Omit<UseLoadOnScrollToBottomOptions, 'element'> {
  paging?: boolean;
  dataElements?: ReactNode[];
  dataElementLength?: number;
  focusedElementIndex?: number;
  onChangeFocusedDataElement?: (dataElementIndex: number) => void;
  onSelectDataElement?: (dataElementIndex: number) => void;
  onClose?: () => void;
}

export function getInfiniteScrollBoxUtilityClass(slot: string): string {
  return generateUtilityClass('MuiInfiniteScrollBox', slot);
}

export const infiniteScrollBoxClasses: InfiniteScrollBoxClasses =
  generateUtilityClasses('MuiInfiniteScrollBox', ['root']);

const slots = {
  root: ['root'],
};

export const InfiniteScrollBox = forwardRef<
  HTMLDivElement,
  InfiniteScrollBoxProps
>(function InfiniteScrollBox(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiInfiniteScrollBox' });
  const {
    className,
    bottomThreshold,
    load,
    shouldLoadOnScroll,
    invertScrollDirection,
    onChangeScrollLength,
    dataElementLength,
    children,
    paging = false,
    dataElements,
    onSelectDataElement,
    onClose,
    focusedElementIndex: focusedElementIndexProp,
    onChangeFocusedDataElement,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getInfiniteScrollBoxUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const isInitialMountRef = useRef(true);
  const elementRef = useRef<HTMLDivElement>();
  const loadRef = useRef(load);
  const onChangeFocusedDataElementRef = useRef(onChangeFocusedDataElement);
  const onSelectDataElementRef = useRef(onSelectDataElement);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    loadRef.current = load;
    onChangeFocusedDataElementRef.current = onChangeFocusedDataElement;
    onSelectDataElementRef.current = onSelectDataElement;
    onCloseRef.current = onClose;
  }, [load, onChangeFocusedDataElement, onClose, onSelectDataElement]);

  const limit = (() => {
    return (
      (() => {
        if (elementRef.current?.offsetHeight && dataElementLength) {
          return Math.ceil(elementRef.current.offsetHeight / dataElementLength);
        }
        return 0;
      })() + 1
    );
  })();

  const [offset, setOffset] = useState(0);

  useLoadOnScrollToBottom({
    bottomThreshold,
    load,
    shouldLoadOnScroll,
    invertScrollDirection,
    onChangeScrollLength: (scrollLength) => {
      const { scrollTop } = scrollLength;
      if (dataElementLength) {
        setOffset(Math.floor(scrollTop / dataElementLength));
      }
      onChangeScrollLength && onChangeScrollLength(scrollLength);
    },
    element: elementRef.current,
  });

  const [focusedElementIndex, setFocusedElementIndex] = useState(0);

  useEffect(() => {
    if (focusedElementIndexProp != null) {
      setFocusedElementIndex(focusedElementIndexProp);
    }
  }, [focusedElementIndexProp]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      onChangeFocusedDataElementRef.current &&
        onChangeFocusedDataElementRef.current(focusedElementIndex);
    }
  }, [focusedElementIndex]);

  useEffect(() => {
    if (dataElements && dataElementLength) {
      const keydownCallback = (event: KeyboardEvent) => {
        event.preventDefault();
        const nextFocusedOptionIndex = (() => {
          switch (event.key) {
            case 'ArrowUp':
              if (!loadRef.current || focusedElementIndex > 0) {
                return (
                  (!!focusedElementIndex
                    ? focusedElementIndex
                    : dataElements.length) - 1
                );
              }
              return 0;
            case 'ArrowDown':
              return (focusedElementIndex + 1) % dataElements.length;
            case 'Enter':
              if (focusedElementIndex != null) {
                onSelectDataElementRef.current &&
                  onSelectDataElementRef.current(focusedElementIndex);
              }
              break;
            case 'Escape':
              onCloseRef.current && onCloseRef.current();
              break;
          }
        })();
        if (
          nextFocusedOptionIndex != null &&
          elementRef.current?.offsetHeight
        ) {
          setFocusedElementIndex(nextFocusedOptionIndex);
          if (elementRef.current) {
            // TODO: Scroll to element if not visible
            if (nextFocusedOptionIndex > offset + limit - 1) {
            } else {
            }
          }
        }
      };
      window.addEventListener('keydown', keydownCallback);
      return () => {
        window.removeEventListener('keydown', keydownCallback);
      };
    }
  }, [dataElementLength, dataElements, focusedElementIndex, limit, offset]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return (
    <Box
      ref={mergeRefs([elementRef, ref])}
      {...rest}
      className={clsx(classes.root)}
    >
      {(() => {
        if (dataElements) {
          const displayableDataSet = paging
            ? dataElements.slice(offset, offset + limit)
            : dataElements;
          return (
            <Box
              sx={{
                m: 0,
                p: 0,
                minHeight:
                  paging && dataElementLength
                    ? dataElements.length * dataElementLength
                    : undefined,
              }}
            >
              {dataElementLength ? (
                <Box sx={{ height: offset * dataElementLength }} />
              ) : null}
              {displayableDataSet.map((dataElement, index) => {
                return (
                  <RenderIfVisible
                    key={index}
                    defaultPlaceholderDimensions={{
                      height: dataElementLength,
                    }}
                    unWrapChildrenIfVisible
                    initialVisible
                  >
                    {dataElement}
                  </RenderIfVisible>
                );
              })}
            </Box>
          );
        }
        return children;
      })()}
    </Box>
  );
});

export default InfiniteScrollBox;
