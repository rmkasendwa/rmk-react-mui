import { FC, createContext } from 'react';

interface ILoadingContext {
  load?: () => void;
  loading: boolean;
  loaded?: boolean;
  errorMessage?: string;
}
export const LoadingContext = createContext<ILoadingContext>({
  loading: false,
  errorMessage: '',
});

export interface ILoadingProviderProps {
  value: ILoadingContext;
}

export const LoadingProvider: FC<ILoadingProviderProps> = ({
  children,
  value,
}) => {
  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};
