import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  keyframes,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { useFormikContext } from 'formik';
import { ReactNode, forwardRef, useCallback, useEffect, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
import scrollIntoView from 'scroll-into-view-if-needed';

export interface FormikErrorFieldHighlighterClasses {
  /** Styles applied to the root element. */
  root: string;
  flicker: string;
}

export type FormikErrorFieldHighlighterClassKey =
  keyof FormikErrorFieldHighlighterClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikErrorFieldHighlighter: FormikErrorFieldHighlighterProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikErrorFieldHighlighter: keyof FormikErrorFieldHighlighterClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikErrorFieldHighlighter?: {
      defaultProps?: ComponentsProps['MuiFormikErrorFieldHighlighter'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikErrorFieldHighlighter'];
      variants?: ComponentsVariants['MuiFormikErrorFieldHighlighter'];
    };
  }
}

export const flickerAnimation = keyframes`
  0% {
    opacity: 0;
  }
  10%,
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export type FormikErrorFieldHighlighterFunctionChildrenProps = {
  scrollToErrorFields: () => void;
};

export type FormikErrorFieldHighlighterFunctionChildren = (
  props: FormikErrorFieldHighlighterFunctionChildrenProps
) => ReactNode;

export interface FormikErrorFieldHighlighterProps
  extends Partial<Omit<BoxProps, 'children'>> {
  children: FormikErrorFieldHighlighterFunctionChildren | ReactNode;
}

export function getFormikErrorFieldHighlighterUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiFormikErrorFieldHighlighter', slot);
}

export const formikErrorFieldHighlighterClasses: FormikErrorFieldHighlighterClasses =
  generateUtilityClasses('MuiFormikErrorFieldHighlighter', ['root', 'flicker']);

const slots = {
  root: ['root'],
  flicker: ['flicker'],
};

export const FormikErrorFieldHighlighter = forwardRef<
  HTMLDivElement,
  FormikErrorFieldHighlighterProps
>(function FormikErrorFieldHighlighter(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikErrorFieldHighlighter',
  });
  const { className, children, sx, ...rest } = props;

  const classes = composeClasses(
    slots,
    getFormikErrorFieldHighlighterUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const formElementsWrapperRef = useRef<HTMLDivElement>();
  const { isValid, submitCount } = useFormikContext();

  const scrollToErrorFields = useCallback(() => {
    if (!isValid && formElementsWrapperRef.current) {
      const fieldsWithError =
        formElementsWrapperRef.current.querySelectorAll('.Mui-error');
      if (fieldsWithError.length > 0) {
        scrollIntoView(fieldsWithError[0], {
          scrollMode: 'if-needed',
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        fieldsWithError.forEach((field) => {
          field.classList.add(classes.flicker);
          setTimeout(() => field.classList.remove(classes.flicker), 1000);
        });
      }
    }
  }, [classes.flicker, isValid]);

  const scrollToErrorFieldsRef = useRef(scrollToErrorFields);
  scrollToErrorFieldsRef.current = scrollToErrorFields;

  useEffect(() => {
    if (submitCount > 0 && !isValid) {
      scrollToErrorFieldsRef.current();
    }
  }, [isValid, submitCount]);

  return (
    <Box
      ref={mergeRefs([ref, formElementsWrapperRef])}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        ...sx,
        [`.${classes.flicker}`]: {
          animation: `0.1s linear 0s infinite normal none running ${flickerAnimation}`,
        },
      }}
    >
      {typeof children === 'function'
        ? children({ scrollToErrorFields })
        : children}
    </Box>
  );
});

export default FormikErrorFieldHighlighter;
