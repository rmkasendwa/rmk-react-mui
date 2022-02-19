import { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
    <DndProvider backend={HTML5Backend}>
      <KanbanBoardProvider
        value={{
          lanes,
        }}
      >
        <DragAndDropContainer {...props} />
      </KanbanBoardProvider>
    </DndProvider>
  );
};

export default KanbanBoard;
