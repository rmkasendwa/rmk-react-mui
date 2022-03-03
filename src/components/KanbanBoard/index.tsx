import { FC } from 'react';

import DragAndDropContainer, {
  IDragAndDropContainerProps,
} from './DragAndDropContainer';
import {
  ILane,
  KanbanBoardProvider,
  TCardClickHandler,
  TCardMoveAcrossLanesHandler,
} from './KanbanBoardContext';

export interface IKanbanBoardProps extends IDragAndDropContainerProps {
  lanes: ILane[];
  onCardClick?: TCardClickHandler;
  onCardMoveAcrossLanes?: TCardMoveAcrossLanesHandler;
}

export const KanbanBoard: FC<IKanbanBoardProps> = ({
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
