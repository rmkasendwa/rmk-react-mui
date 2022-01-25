export * from './theme/actions';

export interface RootState {
  theme: {
    darkMode: boolean;
  };
  page: {
    title: string;
  };
  data: Record<string, any>;
}
