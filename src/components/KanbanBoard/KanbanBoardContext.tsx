import { BoxProps } from '@mui/material/Box';
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { LaneProps } from './Lane';

export type KanbanBoardId = string | number;

export interface KanbanBoardTool {
  icon?: ReactNode;
  label: string;
}

export interface KanbanBoardLaneTool extends KanbanBoardTool {
  onClick?: (laneId: KanbanBoardId) => void;
}

export type KanbanBoardLaneToolItem = KanbanBoardLaneTool | 'DIVIDER';

export interface KanbanBoardCardTool extends KanbanBoardTool {
  onClick?: (laneId: KanbanBoardId, cardId: KanbanBoardId) => void;
}

export type KanbanBoardCardToolItem = KanbanBoardCardTool | 'DIVIDER';

export interface CardIdentifier {
  id: KanbanBoardId;
  laneId: KanbanBoardId;
}

export interface Card extends CardIdentifier, Omit<BoxProps, 'title' | 'id'> {
  title: ReactNode;
  description: ReactNode;
  draggable?: boolean;
  tools?: KanbanBoardCardToolItem[];
}

export interface Lane extends Omit<BoxProps, 'title' | 'id'> {
  id: KanbanBoardId;
  title: ReactNode;
  cards: Card[];
  showCardCount?: boolean;
  loading?: boolean;
  errorMessage?: string;
  footer?: ReactNode;
  draggable?: boolean;
  tools?: KanbanBoardLaneToolItem[];
}

export interface DropResult {
  addedIndex?: number | null;
  removedIndex?: number | null;
  payload?: any;
}

export type CardClickHandler = (
  cardId: KanbanBoardId,
  laneId: KanbanBoardId
) => void;

export type CardMoveAcrossLanesHandler = (
  fromLaneId: KanbanBoardId,
  toLaneId: KanbanBoardId,
  cardId: KanbanBoardId
) => void;

export interface KanbanBoardContext {
  lanes: LaneProps[];
  onCardDrop?: (laneId: KanbanBoardId | null, dropResult: DropResult) => void;
  onLaneDrop?: (dropResult: DropResult) => void;
  toLaneId?: KanbanBoardId | null;
  fromLaneId?: KanbanBoardId | null;
  setFromLaneId?: Dispatch<SetStateAction<KanbanBoardId | null>>;
  setToLaneId?: Dispatch<SetStateAction<KanbanBoardId | null>>;
  onCardClick?: CardClickHandler;
  onCardMoveAcrossLanes?: CardMoveAcrossLanesHandler;
  dragging?: boolean;
  setDragging?: Dispatch<SetStateAction<boolean>>;
}
export const KanbanBoardContext = createContext<KanbanBoardContext>({
  lanes: [],
});

export interface KanbanBoardProviderProps {
  lanes: Lane[];
  onCardClick?: CardClickHandler;
  onCardMoveAcrossLanes?: CardMoveAcrossLanesHandler;
  children: ReactNode;
}

export const KanbanBoardProvider: FC<KanbanBoardProviderProps> = ({
  children,
  lanes: propLanes,
  onCardClick,
  onCardMoveAcrossLanes,
}) => {
  const [fromLaneId, setFromLaneId] = useState<KanbanBoardId | null>(null);
  const [toLaneId, setToLaneId] = useState<KanbanBoardId | null>(null);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [dragging, setDragging] = useState(false);

  const onCardDrop = useCallback(
    (
      laneId: string | number | null,
      { addedIndex, removedIndex, payload }: DropResult
    ) => {
      if (laneId != null && (removedIndex != null || addedIndex != null)) {
        const lane = lanes.find((lane) => lane.id === laneId);
        if (lane) {
          const laneIndex = lanes.indexOf(lane);
          const newLane = { ...lane };
          if (removedIndex != null) {
            payload = newLane.cards.splice(removedIndex, 1)[0];
          }
          if (addedIndex != null) {
            newLane.cards.splice(addedIndex, 0, payload);
          }
          lanes.splice(laneIndex, 1, newLane);
          setLanes([...lanes]);
        }
      }
    },
    [lanes]
  );

  const onLaneDrop = useCallback(
    ({ addedIndex, removedIndex, payload }: DropResult) => {
      if (removedIndex != null || addedIndex != null) {
        if (removedIndex != null) {
          payload = lanes.splice(removedIndex, 1)[0];
        }
        if (addedIndex != null) {
          lanes.splice(addedIndex, 0, payload);
        }
        setLanes([...lanes]);
      }
    },
    [lanes]
  );

  useEffect(() => {
    setLanes(propLanes);
  }, [propLanes]);

  return (
    <KanbanBoardContext.Provider
      value={{
        lanes,
        onCardDrop,
        onLaneDrop,
        fromLaneId,
        setFromLaneId,
        toLaneId,
        setToLaneId,
        onCardClick,
        onCardMoveAcrossLanes,
        dragging,
        setDragging,
      }}
    >
      {children}
    </KanbanBoardContext.Provider>
  );
};
