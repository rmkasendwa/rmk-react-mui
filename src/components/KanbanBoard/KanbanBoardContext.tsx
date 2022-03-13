import { BoxProps } from '@mui/material';
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

import { ILaneProps } from './Lane';

export type TKanbanBoardId = string | number;

export interface ICardIdentifier {
  id: TKanbanBoardId;
  laneId: TKanbanBoardId;
}

export interface ICard extends ICardIdentifier, Omit<BoxProps, 'title' | 'id'> {
  title: ReactNode;
  description: ReactNode;
}

export interface ILane extends Omit<BoxProps, 'title' | 'id'> {
  id: TKanbanBoardId;
  title: ReactNode;
  cards: ICard[];
  showCardCount?: boolean;
  loading?: boolean;
  errorMessage?: string;
  footer?: ReactNode;
}

export interface IDropResult {
  addedIndex?: number | null;
  removedIndex?: number | null;
  payload?: any;
}

export type TCardClickHandler = (
  cardId: TKanbanBoardId,
  laneId: TKanbanBoardId
) => void;

export type TCardMoveAcrossLanesHandler = (
  fromLaneId: TKanbanBoardId,
  toLaneId: TKanbanBoardId,
  cardId: TKanbanBoardId
) => void;

export interface IKanbanBoardContext {
  lanes: ILaneProps[];
  onCardDrop?: (laneId: TKanbanBoardId | null, dropResult: IDropResult) => void;
  onLaneDrop?: (dropResult: IDropResult) => void;
  toLaneId?: TKanbanBoardId | null;
  fromLaneId?: TKanbanBoardId | null;
  setFromLaneId?: Dispatch<SetStateAction<TKanbanBoardId | null>>;
  setToLaneId?: Dispatch<SetStateAction<TKanbanBoardId | null>>;
  onCardClick?: TCardClickHandler;
  onCardMoveAcrossLanes?: TCardMoveAcrossLanesHandler;
}
export const KanbanBoardContext = createContext<IKanbanBoardContext>({
  lanes: [],
});

export interface IKanbanBoardProviderProps {
  lanes: ILane[];
  onCardClick?: TCardClickHandler;
  onCardMoveAcrossLanes?: TCardMoveAcrossLanesHandler;
}

export const KanbanBoardProvider: FC<IKanbanBoardProviderProps> = ({
  children,
  lanes: propLanes,
  onCardClick,
  onCardMoveAcrossLanes,
}) => {
  const [fromLaneId, setFromLaneId] = useState<TKanbanBoardId | null>(null);
  const [toLaneId, setToLaneId] = useState<TKanbanBoardId | null>(null);
  const [lanes, setLanes] = useState<ILane[]>([]);

  const onCardDrop = useCallback(
    (
      laneId: string | number | null,
      { addedIndex, removedIndex, payload }: IDropResult
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
    ({ addedIndex, removedIndex, payload }: IDropResult) => {
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
      }}
    >
      {children}
    </KanbanBoardContext.Provider>
  );
};
