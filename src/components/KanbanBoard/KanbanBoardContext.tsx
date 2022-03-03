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

export interface ICardIdentifier {
  id: string | number;
  laneId: string | number;
}

export interface ICard extends ICardIdentifier, Omit<BoxProps, 'title' | 'id'> {
  title: ReactNode;
  description: ReactNode;
}

export interface ILane extends Omit<BoxProps, 'title' | 'id'> {
  id: string | number;
  title: ReactNode;
  cards: ICard[];
  showCardCount?: boolean;
  loading?: boolean;
  errorMessage?: string;
}

export interface IDropResult {
  addedIndex?: number | null;
  removedIndex?: number | null;
  payload?: any;
}

export type TCardClickHandler = (
  cardId: string | number,
  laneId: string | number
) => void;

export type TCardMoveAcrossLanesHandler = (
  fromLaneId: string | number,
  toLaneId: string | number,
  cardId: string | number
) => void;

export interface IKanbanBoardContext {
  lanes: ILaneProps[];
  onCardDrop?: (
    laneId: string | number | null,
    dropResult: IDropResult
  ) => void;
  onLaneDrop?: (dropResult: IDropResult) => void;
  toLaneId?: string | number | null;
  fromLaneId?: string | number | null;
  setFromLaneId?: Dispatch<SetStateAction<string | number | null>>;
  setToLaneId?: Dispatch<SetStateAction<string | number | null>>;
  onCardClick?: TCardClickHandler;
  onCardMoveAcrossLanes?: TCardMoveAcrossLanesHandler;
}
export const KanbanBoardContext = createContext<IKanbanBoardContext>({
  lanes: [],
});

export interface IKanbanBoardProviderProps {
  value: {
    lanes: ILane[];
    onCardClick?: TCardClickHandler;
    onCardMoveAcrossLanes?: TCardMoveAcrossLanesHandler;
  };
}

export const KanbanBoardProvider: FC<IKanbanBoardProviderProps> = ({
  children,
  value: { lanes: propLanes, onCardClick, onCardMoveAcrossLanes },
}) => {
  const [fromLaneId, setFromLaneId] = useState<string | number | null>(null);
  const [toLaneId, setToLaneId] = useState<string | number | null>(null);
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
          console.log({ laneId, payload });
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
