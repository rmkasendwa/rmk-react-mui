import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import { darken } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import {
  Container as BaseContainer,
  Draggable as BaseDraggable,
} from 'react-smooth-dnd';

import RenderIfVisible from '../RenderIfVisible';
import { useKanbanBoardContext } from './KanbanBoardContext';
import KanbanBoardLane from './KanbanBoardLane';
import { Lane } from './models';

const Container = BaseContainer as any;
const Draggable = BaseDraggable as any;

export interface KanbanBoardDragAndDropContainerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type KanbanBoardDragAndDropContainerClassKey =
  keyof KanbanBoardDragAndDropContainerClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKanbanBoardDragAndDropContainer: KanbanBoardDragAndDropContainerProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKanbanBoardDragAndDropContainer: keyof KanbanBoardDragAndDropContainerClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKanbanBoardDragAndDropContainer?: {
      defaultProps?: ComponentsProps['MuiKanbanBoardDragAndDropContainer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKanbanBoardDragAndDropContainer'];
      variants?: ComponentsVariants['MuiKanbanBoardDragAndDropContainer'];
    };
  }
}
//#endregion

export const getKanbanBoardDragAndDropContainerUtilityClass = (
  slot: string
) => {
  return generateUtilityClass('MuiKanbanBoardDragAndDropContainer', slot);
};

const slots: Record<
  KanbanBoardDragAndDropContainerClassKey,
  [KanbanBoardDragAndDropContainerClassKey]
> = {
  root: ['root'],
};

export const kanbanBoardDragAndDropContainerClasses: KanbanBoardDragAndDropContainerClasses =
  generateUtilityClasses(
    'MuiKanbanBoardDragAndDropContainer',
    Object.keys(slots) as KanbanBoardDragAndDropContainerClassKey[]
  );

export interface KanbanBoardDragAndDropContainerProps
  extends Pick<Lane, 'showCardCount' | 'loading' | 'errorMessage'>,
    Partial<BoxProps> {}

export const KanbanBoardDragAndDropContainer = forwardRef<
  any,
  KanbanBoardDragAndDropContainerProps
>(function KanbanBoardDragAndDropContainer(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiKanbanBoardDragAndDropContainer',
  });
  const {
    className,
    showCardCount = false,
    loading = false,
    errorMessage,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getKanbanBoardDragAndDropContainerUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { lanes, onLaneDrop, dragging, setDragging } = useKanbanBoardContext();
  const { palette } = useTheme();
  const [boardWrapper, setBoardWrapper] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (boardWrapper && dragging) {
      const borderOffset = 40;
      let scrollingTimeout: NodeJS.Timeout;
      const scrollHorizontally = (direction: 'left' | 'right', tick = 1) => {
        const { scrollLeft, scrollWidth } = boardWrapper;
        const { width } = boardWrapper.getBoundingClientRect();
        const { canScroll, scrollDistance } = (() => {
          const scrollDistance = 5 + tick;
          switch (direction) {
            case 'right':
              return {
                canScroll: scrollLeft + width < scrollWidth,
                scrollDistance: scrollLeft + scrollDistance,
              };
            case 'left':
              return {
                canScroll: scrollLeft > 0,
                scrollDistance: scrollLeft - scrollDistance,
              };
          }
        })();
        if (canScroll) {
          boardWrapper.scrollLeft = scrollDistance;
          scrollingTimeout = setTimeout(
            () => scrollHorizontally(direction, tick + 1),
            50
          );
        } else {
          clearTimeout(scrollingTimeout);
        }
      };
      const mouseMoveEventCallback = (event: MouseEvent) => {
        const { width, height, x, y } = boardWrapper.getBoundingClientRect();
        if (
          event.clientX >= x &&
          event.clientX <= width + x &&
          event.clientY >= y + borderOffset &&
          event.clientY <= height + y
        ) {
          if (width + x - event.clientX <= borderOffset) {
            scrollHorizontally('right');
          } else if (event.clientX - x <= borderOffset) {
            scrollHorizontally('left');
          } else {
            clearTimeout(scrollingTimeout);
          }
        } else {
          clearTimeout(scrollingTimeout);
        }
      };
      window.addEventListener('mousemove', mouseMoveEventCallback);
      return () => {
        clearTimeout(scrollingTimeout);
        window.removeEventListener('mousemove', mouseMoveEventCallback);
      };
    }
  }, [boardWrapper, dragging]);

  return (
    <Box
      {...rest}
      ref={mergeRefs([
        (boardWrapper: HTMLDivElement | null) => {
          setBoardWrapper(boardWrapper);
        },
        ref,
      ])}
      className={clsx(classes.root)}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        overflowY: 'hidden',
        py: 1,
        px: 3,
        alignItems: 'flex-start',
        height: '100%',
        width: '100%',
        position: 'absolute',
        ...sx,
        [`
          &>.smooth-dnd-container.horizontal
        `]: {
          gap: 2,
        },
        [`
          &>.smooth-dnd-container.horizontal>.smooth-dnd-draggable-wrapper,
          &>.smooth-dnd-container.horizontal>.undraggable-wrapper
        `]: {
          display: 'inline-block',
          height: '100%',
        },
        '& .smooth-dnd-draggable-wrapper .column-drag-handle': {
          cursor: 'grab',
        },
        '& .undraggable-wrapper .column-drag-handle': {
          userSelect: 'none',
        },
        '& .smooth-dnd-ghost': {
          transform: `rotate(3deg) scale(0.95)`,
          cursor: 'grab',
        },
      }}
    >
      <Container
        orientation="horizontal"
        dragHandleSelector=".column-drag-handle"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'cards-drop-preview',
        }}
        onDrop={({ addedIndex, removedIndex, payload }: any) => {
          onLaneDrop && onLaneDrop({ addedIndex, removedIndex, payload });
        }}
        onDragStart={() => {
          setDragging && setDragging(true);
        }}
        onDragEnd={() => {
          setDragging && setDragging(false);
        }}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          position: 'relative',
          height: '100%',
          minWidth: 'auto',
        }}
      >
        {lanes.map(({ id, draggable = true, sx, ...rest }) => {
          const laneStyles: any = {};
          if (!draggable) {
            laneStyles.bgcolor = darken(
              palette.background.default,
              palette.mode === 'dark' ? 0.7 : 0.05
            );
          }
          const lane = (
            <RenderIfVisible
              stayRendered
              displayPlaceholder={false}
              sx={{
                height: '100%',
                width: 362,
              }}
            >
              <KanbanBoardLane
                {...{ id, ...rest, showCardCount, loading, errorMessage }}
                sx={{ ...laneStyles, ...sx }}
              />
            </RenderIfVisible>
          );
          if (!draggable) {
            return (
              <Box key={id} className="undraggable-wrapper">
                {lane}
              </Box>
            );
          }
          return <Draggable key={id}>{lane}</Draggable>;
        })}
      </Container>
    </Box>
  );
});

export default KanbanBoardDragAndDropContainer;
