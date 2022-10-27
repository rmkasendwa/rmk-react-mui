import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface BrowserContext {
  browser: boolean;
}
export const BrowserContext = createContext<BrowserContext>({
  browser: false,
});

export interface BrowserProviderProps {
  children: ReactNode;
}

export const BrowserProvider: FC<BrowserProviderProps> = ({ children }) => {
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
