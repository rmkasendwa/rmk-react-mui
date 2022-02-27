import { FC } from 'react';

import DragAndDropContainer, {
  IDragAndDropContainerProps,
} from './DragAndDropContainer';
import { ILane, KanbanBoardProvider } from './KanbanBoardContext';

export interface IKanbanBoardProps extends IDragAndDropContainerProps {
  lanes: ILane[];
}

export const KanbanBoard: FC<IKanbanBoardProps> = (props) => {
  const { lanes } = props;
  return (
    <KanbanBoardProvider
      value={{
        lanes,
      }}
    >
      <DragAndDropContainer {...props} />
    </KanbanBoardProvider>
  );
};

export default KanbanBoard;
