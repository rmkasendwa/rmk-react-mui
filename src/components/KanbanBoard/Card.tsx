import { Box, SxProps, Theme, alpha, useTheme } from '@mui/material';
import { FC, ReactNode, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

export interface ICardProps {
  id: string | number;
  title: ReactNode;
  description: ReactNode;
  onDragStart?: (element: ICardProps) => void;
  onDragEnd?: () => void;
  isGhost?: boolean;
}

const Card: FC<ICardProps> = (props) => {
  const {
    title,
    description,
    id,
    onDragStart,
    isGhost = false,
    onDragEnd,
  } = props;
  const { palette } = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);

  // Dropping
  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
  });

  // Dragging
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'card',
    item: () => ({ id, element: ref.current }),
    canDrag: !isGhost,
    end: () => {
      onDragEnd && onDragEnd();
    },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging && onDragStart && ref.current && !monitor.didDrop()) {
        onDragStart(props);
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
