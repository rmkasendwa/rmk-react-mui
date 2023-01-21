import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface IMessagingContext {
  showSuccessMessage: (message: ReactNode) => void;
}
export const MessagingContext = createContext<IMessagingContext>({} as any);

export interface IMessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: FC<IMessagingProviderProps> = ({
  children,
}) => {
  const [message, setMessage] = useState<ReactNode>('');

  const showSuccessMessage = useCallback((message: ReactNode) => {
    setMessage(message);
  }, []);

  const handleClose = () => {
    setMessage('');
  };

  return (
    <MessagingContext.Provider
      value={{
        showSuccessMessage,
      }}
    >
      {children}
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </MessagingContext.Provider>
  );
};

export const useMessagingContext = () => {
  return useContext(MessagingContext);
};
