import { FC } from 'react';

import { KanbanBoardProvider } from './KanbanBoardContext';
import KanbanBoardDragAndDropContainer, {
  KanbanBoardDragAndDropContainerProps,
} from './KanbanBoardDragAndDropContainer';
import { CardClickHandler, CardMoveAcrossLanesHandler, Lane } from './models';

export * from './KanbanBoardContext';

export interface KanbanBoardProps extends KanbanBoardDragAndDropContainerProps {
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
      <KanbanBoardDragAndDropContainer {...rest} />
    </KanbanBoardProvider>
  );
};

export default KanbanBoard;
