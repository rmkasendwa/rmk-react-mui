import { Alert, AlertProps } from '@mui/material';
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
export const MessagingContext = createContext<IMessagingContext>({
  showSuccessMessage: () => {
    // Do nothing
  },
});

export interface IMessagingProviderProps {
  children: ReactNode;
  SuccessMessageAlertProps?: Partial<AlertProps>;
}

export const MessagingProvider: FC<IMessagingProviderProps> = ({
  children,
  SuccessMessageAlertProps = {},
}) => {
  const { sx: SuccessMessageAlertPropsSx, ...SuccessMessageAlertPropsRest } =
    SuccessMessageAlertProps;
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
          severity="success"
          variant="filled"
          {...SuccessMessageAlertPropsRest}
          onClose={handleClose}
          sx={{ width: '100%', ...SuccessMessageAlertPropsSx }}
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
