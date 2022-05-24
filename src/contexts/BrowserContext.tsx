import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface IBrowserContext {
  browser: boolean;
}
export const BrowserContext = createContext<IBrowserContext>({
  browser: false,
});

export interface IBrowserProviderProps {
  children: ReactNode;
}

export const BrowserProvider: FC<IBrowserProviderProps> = ({ children }) => {
  const [browser, setBrowser] = useState(false);
  const value = useMemo(() => {
    return { browser };
  }, [browser]);

  useEffect(() => {
    setBrowser(true);
  }, []);

  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
};

export const useBrowser = () => {
  return useContext(BrowserContext);
};
