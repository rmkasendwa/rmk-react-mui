import { Box } from '@mui/material';
import { useFormikContext } from 'formik';
import { FC, useEffect, useState } from 'react';

import { flickerElement } from '../utils/page';

export interface IErrorFieldHighlighterProps {}

export const ErrorFieldHighlighter: FC<IErrorFieldHighlighterProps> = () => {
  const { isValid, submitCount } = useFormikContext();
  const [formElement, setFormElement] = useState<HTMLFormElement | null>(null);

  useEffect(() => {
    if (submitCount > 0 && !isValid && formElement) {
      const fieldsWithError = formElement.querySelectorAll('.Mui-error');
      fieldsWithError[0]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      fieldsWithError.forEach((field) => flickerElement(field));
    }
  }, [formElement, isValid, submitCount]);

  return (
    <Box
      className="error-field-highlighter"
      component="span"
      ref={(element: HTMLSpanElement) => {
        setFormElement(element?.closest('form'));
      }}
    />
  );
};

export default ErrorFieldHighlighter;
