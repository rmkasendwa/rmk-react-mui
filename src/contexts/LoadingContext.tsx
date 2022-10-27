import { FC, ReactNode, createContext, useContext } from 'react';

export interface LoadingContext {
  load?: () => void;
  loading: boolean;
  loaded?: boolean;
  locked?: boolean;
  errorMessage?: string;
}
export const LoadingContext = createContext<LoadingContext>({
  loading: false,
  errorMessage: '',
});

export interface LoadingProviderProps {
  value: LoadingContext;
  children: ReactNode;
}

export const LoadingProvider: FC<LoadingProviderProps> = ({
  children,
  value,
}) => {
  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  return useContext(LoadingContext);
};
