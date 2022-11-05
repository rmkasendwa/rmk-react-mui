import { PageHistory } from '../interfaces/Page';

export * from './Page';

export interface RootState {
  page: {
    title: string;
    history: PageHistory;
  };
}
