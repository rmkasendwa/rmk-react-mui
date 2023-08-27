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
import { omit } from 'lodash';
import { ReactNode, forwardRef, useEffect, useRef } from 'react';
import { IntersectionOptions, useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';

export interface RenderIfVisibleClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type RenderIfVisibleClassKey = keyof RenderIfVisibleClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRenderIfVisible: RenderIfVisibleProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRenderIfVisible: keyof RenderIfVisibleClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRenderIfVisible?: {
      defaultProps?: ComponentsProps['MuiRenderIfVisible'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRenderIfVisible'];
      variants?: ComponentsVariants['MuiRenderIfVisible'];
    };
  }
}
//#endregion

export const getRenderIfVisibleUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiRenderIfVisible', slot);
};

const slots: Record<RenderIfVisibleClassKey, [RenderIfVisibleClassKey]> = {
  root: ['root'],
};

export const renderIfVisibleClasses: RenderIfVisibleClasses =
  generateUtilityClasses(
    'MuiRenderIfVisible',
    Object.keys(slots) as RenderIfVisibleClassKey[]
  );

export interface DefaultPlaceholderDimensions {
  height?: number;
  width?: number;
}

export interface RenderIfVisibleProps
  extends Partial<Omit<BoxProps, 'ref'>>,
    Partial<Pick<IntersectionOptions, 'threshold'>> {
  /**
   * Whether the element should be visible initially or not.
   * Useful e.g. for always setting the first N items to visible.
   *
   * @default false
   *
   */
  initialVisible?: boolean;
  /**
   * How far outside the viewport in pixels should elements be considered visible?
   *
   */
  visibleOffset?: number;
  /**
   * Should the element stay rendered after it becomes visible?
   *
   */
  stayRendered?: boolean;
  rootNode?: HTMLElement | null;
  /**
   * The element to render is visible
   *
   */
  children: ReactNode;
  /**
   * The default dimensions given to the placeholder element to avoid flickering.
   * Note: The placeholder dimensions will change when the element is rendered if they are different from the element dimensions
   */
  defaultPlaceholderDimensions?: DefaultPlaceholderDimensions;
  /**
   * Default width and height to be assigned to placeholder element
   *
   * @default { height: 50 }
   *
   */
  PlaceholderProps?: Partial<BoxProps>;
  /**
   * Determines if the placeholder should be displayed
   *
   * @default true
   *
   */
  displayPlaceholder?: boolean;
  /**
   * If true children elements will be rendered without a Box wrapper.
   * Note: If this property is set to true, it automatically sets stayRendered to true
   *
   * @default false
   *
   */
  unWrapChildrenIfVisible?: boolean;
  /**
   * The time to wait for idle window before displaying visible element.
   *
   * @default 600
   */
  visibilityDelay?: number;
  onChangeVisibility?: (isVisible: boolean) => void;
}

export const RenderIfVisible = forwardRef<any, RenderIfVisibleProps>(
  function RenderIfVisible(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiRenderIfVisible' });
    const {
      className,
      initialVisible = false,
      children,
      defaultPlaceholderDimensions = { height: 50 },
      PlaceholderProps = {},
      unWrapChildrenIfVisible = false,
      displayPlaceholder = true,
      onChangeVisibility,
      threshold = 0,
      ...rest
    } = omit(props, 'stayRendered');

    let { stayRendered = false } = props;

    const classes = composeClasses(
      slots,
      getRenderIfVisibleUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: placeholderPropsSx, ...placeholderPropsRest } =
      PlaceholderProps;
    unWrapChildrenIfVisible && (stayRendered = true);

    const isMountedRef = useRef(true);
    const wasVisibleRef = useRef(initialVisible);
    const placeholderDimensionsRef = useRef(defaultPlaceholderDimensions);
    const onChangeVisibilityRef = useRef(onChangeVisibility);
    useEffect(() => {
      onChangeVisibilityRef.current = onChangeVisibility;
    }, [onChangeVisibility]);

    const { ref: anchorRef, inView: isVisible } = useInView({
      initialInView: initialVisible,
      threshold,
    });

    useEffect(() => {
      if (isVisible) {
        wasVisibleRef.current = true;
      }
      onChangeVisibilityRef.current && onChangeVisibilityRef.current(isVisible);
    }, [isVisible]);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    if (unWrapChildrenIfVisible && (isVisible || wasVisibleRef.current)) {
      return <>{children}</>;
    }

    return (
      <Box
        ref={mergeRefs([ref, anchorRef])}
        {...rest}
        className={clsx(classes.root)}
      >
        {(() => {
          if (
            (isVisible || (stayRendered && wasVisibleRef.current)) &&
            !unWrapChildrenIfVisible
          ) {
            return children;
          }
          if (displayPlaceholder) {
            return (
              <Box
                {...placeholderPropsRest}
                sx={{
                  ...placeholderDimensionsRef.current,
                  ...placeholderPropsSx,
                }}
              />
            );
          }
        })()}
      </Box>
    );
  }
);

export default RenderIfVisible;
