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
import { Fragment, forwardRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

import {
  UseLoadOnScrollToBottomOptions,
  useLoadOnScrollToBottom,
} from '../hooks/InfiniteScroller';

export interface InfiniteScrollBoxClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type InfiniteScrollBoxClassKey = keyof InfiniteScrollBoxClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiInfiniteScrollBox: InfiniteScrollBoxProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiInfiniteScrollBox: keyof InfiniteScrollBoxClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiInfiniteScrollBox?: {
      defaultProps?: ComponentsProps['MuiInfiniteScrollBox'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiInfiniteScrollBox'];
      variants?: ComponentsVariants['MuiInfiniteScrollBox'];
    };
  }
}
//#endregion

export const getInfiniteScrollBoxUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiInfiniteScrollBox', slot);
};

const slots: Record<InfiniteScrollBoxClassKey, [InfiniteScrollBoxClassKey]> = {
  root: ['root'],
};

export const infiniteScrollBoxClasses: InfiniteScrollBoxClasses =
  generateUtilityClasses(
    'MuiInfiniteScrollBox',
    Object.keys(slots) as InfiniteScrollBoxClassKey[]
  );

export interface InfiniteScrollBoxProps
  extends Partial<BoxProps>,
    Omit<UseLoadOnScrollToBottomOptions, 'element'> {
  PagingContainer?: Partial<BoxProps>;
}

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
    paging,
    dataElements,
    onSelectDataElement,
    onClose,
    focusedElementIndex,
    onChangeFocusedDataElement,
    enableKeyboardNavigationWrapping,
    keyboardFocusElement,
    PagingContainer = {},
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

  const { sx: PagingContainerSx, ...PagingContainerRest } = PagingContainer;

  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const {
    dataElementsContainerHeight,
    dataElementsContainerFillerElementHeight,
    displayableDataSet,
  } = useLoadOnScrollToBottom({
    bottomThreshold,
    load,
    shouldLoadOnScroll,
    invertScrollDirection,
    paging,
    dataElements,
    onSelectDataElement,
    onClose,
    focusedElementIndex,
    onChangeFocusedDataElement,
    enableKeyboardNavigationWrapping,
    keyboardFocusElement,
    dataElementLength,
    onChangeScrollLength,
    element,
  });

  return (
    <Box
      ref={mergeRefs([ref, (element: any) => setElement(element)])}
      {...rest}
      className={clsx(classes.root)}
      tabIndex={0}
    >
      {(() => {
        if (displayableDataSet) {
          return (
            <Box
              {...PagingContainerRest}
              sx={{
                ...PagingContainerSx,
                minHeight: dataElementsContainerHeight,
              }}
            >
              {dataElementsContainerFillerElementHeight ? (
                <Box
                  sx={{ height: dataElementsContainerFillerElementHeight }}
                />
              ) : null}
              {displayableDataSet.map((dataElement, index) => {
                return <Fragment key={index}>{dataElement}</Fragment>;
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
