import { FC, ReactNode, createContext, useContext } from 'react';

export interface IAPIDataContext {
  preferStale?: boolean;
}
export const APIDataContext = createContext<IAPIDataContext>({
  preferStale: false,
});

export interface IAPIDataProviderProps {
  value: IAPIDataContext;
  children: ReactNode;
}

export const APIDataProvider: FC<IAPIDataProviderProps> = ({
  children,
  value,
}) => {
  return (
    <APIDataContext.Provider value={value}>{children}</APIDataContext.Provider>
  );
};

export const useAPIDataContext = () => {
  return useContext(APIDataContext);
};
