import { FC, ReactNode, createContext } from 'react';

export interface ILoadingContext {
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
  children: ReactNode;
}

export const LoadingProvider: FC<ILoadingProviderProps> = ({
  children,
  value,
}) => {
  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};
