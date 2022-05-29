import { TPageHistory } from '../interfaces/Page';

export * from './Data';
export * from './Page';
export * from './Theme';

export interface RootState {
  theme: {
    darkMode: boolean;
  };
  page: {
    title: string;
    history: TPageHistory;
  };
  data: Record<string, any>;
}
