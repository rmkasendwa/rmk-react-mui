export * from './data';
export * from './page';
export * from './theme';

export interface RootState {
  theme: {
    darkMode: boolean;
  };
  page: {
    title: string;
  };
  data: Record<string, any>;
}
