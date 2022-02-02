import { FC, createContext } from 'react';

export interface IAPIDataContext {
  preferStale?: boolean;
}
export const APIDataContext = createContext<IAPIDataContext>({
  preferStale: false,
});

export interface IAPIDataProviderProps {
  value: IAPIDataContext;
}

export const APIDataProvider: FC<IAPIDataProviderProps> = ({
  children,
  value,
}) => {
  return (
    <APIDataContext.Provider value={value}>{children}</APIDataContext.Provider>
  );
};
