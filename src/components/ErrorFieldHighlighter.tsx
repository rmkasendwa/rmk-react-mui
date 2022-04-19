import { useFormikContext } from 'formik';
import { FC, ReactNode, useEffect } from 'react';

import { flickerElement } from '../utils/page';

export interface IErrorFieldHighlighterProps {
  children?: ReactNode;
}

export const ErrorFieldHighlighter: FC<IErrorFieldHighlighterProps> = ({
  children,
}) => {
  const { isValid, submitCount } = useFormikContext();

  useEffect(() => {
    if (submitCount > 0 && !isValid) {
      const fieldsWithError = document.querySelectorAll('.Mui-error');
      fieldsWithError[0]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      fieldsWithError.forEach((field) => flickerElement(field));
    }
  }, [isValid, submitCount]);

  return <>{children}</>;
};

export default ErrorFieldHighlighter;
