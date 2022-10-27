import { FC } from 'react';

import DragAndDropContainer, {
  DragAndDropContainerProps,
} from './DragAndDropContainer';
import {
  CardClickHandler,
  CardMoveAcrossLanesHandler,
  KanbanBoardProvider,
  Lane,
} from './KanbanBoardContext';

export * from './KanbanBoardContext';

export interface KanbanBoardProps extends DragAndDropContainerProps {
  lanes: Lane[];
  onCardClick?: CardClickHandler;
  onCardMoveAcrossLanes?: CardMoveAcrossLanesHandler;
}

export const KanbanBoard: FC<KanbanBoardProps> = ({
  lanes,
  onCardClick,
  onCardMoveAcrossLanes,
  ...rest
}) => {
  return (
    <KanbanBoardProvider
      {...{
        lanes,
        onCardClick,
        onCardMoveAcrossLanes,
      }}
    >
      <DragAndDropContainer {...rest} />
    </KanbanBoardProvider>
  );
};

export default KanbanBoard;
