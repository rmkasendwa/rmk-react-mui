import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import { darken } from '@mui/system/colorManipulator';
import { FC, useEffect, useState } from 'react';
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

export interface KanbanBoardDragAndDropContainerProps
  extends Pick<Lane, 'showCardCount' | 'loading' | 'errorMessage'>,
    BoxProps {}

const KanbanBoardDragAndDropContainer: FC<
  KanbanBoardDragAndDropContainerProps
> = ({ showCardCount = false, loading = false, errorMessage, sx, ...rest }) => {
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
      ref={(boardWrapper: HTMLDivElement | null) => {
        setBoardWrapper(boardWrapper);
      }}
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
};

export default KanbanBoardDragAndDropContainer;
