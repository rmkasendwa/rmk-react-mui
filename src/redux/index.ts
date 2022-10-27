import { PageHistory } from '../interfaces/Page';

export * from './Page';
export * from './Theme';

export interface RootState {
  theme: {
    darkMode: boolean;
  };
  page: {
    title: string;
    history: PageHistory;
  };
}
