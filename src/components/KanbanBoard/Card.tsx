import { Box, SxProps, Theme, alpha, useTheme } from '@mui/material';
import { FC, useContext, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { ICard, KanbanBoardContext } from './KanbanBoardContext';

export interface ICardProps extends ICard {
  onDragStart?: (props: ICardProps) => void;
  onDragEnd?: (props: ICardProps) => void;
  isGhost?: boolean;
}

const Card: FC<ICardProps> = (props) => {
  const {
    title,
    description,
    onDragStart,
    isGhost = false,
    onDragEnd,
    id,
    laneId,
  } = props;
  const { palette } = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const { setActiveCard, setMovingCard } = useContext(KanbanBoardContext);

  // Dropping
  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
    hover: (item: ICardProps) => {
      if (!ref.current || item.id === props.id) {
        return;
      }
      if (setActiveCard) {
        setActiveCard((prevActiveCard) => {
          if (
            !prevActiveCard ||
            (prevActiveCard.id !== id && prevActiveCard.laneId !== laneId)
          ) {
            return { id, laneId };
          }
          return prevActiveCard;
        });
      }
    },
  });

  // Dragging
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'card',
    item: () => props,
    canDrag: !isGhost,
    end: () => {
      onDragEnd && onDragEnd(props);
    },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      const canDrag = monitor.canDrag();
      const item = monitor.getItem();
      if (isDragging && !canDrag && ref.current && !monitor.didDrop()) {
        if (setMovingCard) {
          setMovingCard((prevMovingCard) => {
            if (
              !prevMovingCard ||
              (prevMovingCard.id !== id && prevMovingCard.laneId !== laneId)
            ) {
              return { id, laneId };
            }
            return prevMovingCard;
          });
        }
        onDragStart && onDragStart(item);
      }
      return {
        isDragging,
      };
    },
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const sx: SxProps<Theme> = {
    border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
    backgroundColor: palette.background.default,
    px: 2,
    mb: 1,
    borderRadius: 1,
    p: 1,
    cursor: 'pointer',
    minWidth: 250,
  };

  if (isDragging) {
    sx.opacity = 0;
  }

  drag(drop(ref));
  return (
    <Box ref={ref} data-handler-id={handlerId}>
      <Box component="article" sx={sx}>
        <Box component="header" sx={{ pb: 1, fontSize: 14 }}>
          {title}
        </Box>
        <Box
          component="section"
          sx={{
            color: palette.text.secondary,
          }}
        >
          {description}
        </Box>
      </Box>
    </Box>
  );
};

export default Card;
