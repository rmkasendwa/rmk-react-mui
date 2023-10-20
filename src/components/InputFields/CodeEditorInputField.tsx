import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  FormControl,
  FormHelperText,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useCallback, useRef } from 'react';

import CodeEditor, { CodeEditorProps } from '../CodeEditor';
import FieldSet from '../FieldSet';
import { TextFieldProps } from './TextField';

export interface CodeEditorInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CodeEditorInputFieldClassKey = keyof CodeEditorInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCodeEditorInputField: CodeEditorInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCodeEditorInputField: keyof CodeEditorInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCodeEditorInputField?: {
      defaultProps?: ComponentsProps['MuiCodeEditorInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCodeEditorInputField'];
      variants?: ComponentsVariants['MuiCodeEditorInputField'];
    };
  }
}
//#endregion

export const getCodeEditorInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCodeEditorInputField', slot);
};

const slots: Record<
  CodeEditorInputFieldClassKey,
  [CodeEditorInputFieldClassKey]
> = {
  root: ['root'],
};

export const codeEditorInputFieldClasses: CodeEditorInputFieldClasses =
  generateUtilityClasses(
    'MuiCodeEditorInputField',
    Object.keys(slots) as CodeEditorInputFieldClassKey[]
  );

export interface CodeEditorInputFieldProps
  extends Partial<Omit<CodeEditorProps, 'onChange'>>,
    Partial<
      Pick<
        TextFieldProps,
        'onChange' | 'error' | 'helperText' | 'name' | 'id' | 'variant'
      >
    > {}

export const CodeEditorInputField = forwardRef<any, CodeEditorInputFieldProps>(
  function CodeEditorInputField(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiCodeEditorInputField',
    });
    const {
      className,
      variant,
      onChange,
      id,
      name,
      error,
      helperText,
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getCodeEditorInputFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    //#region Refs
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    //#endregion

    const triggerChangeEvent = useCallback(
      (code?: string) => {
        if (onChangeRef.current) {
          const event: any = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: {
              name,
              id,
              value: code,
            },
          });
          onChangeRef.current(event);
        }
      },
      [id, name]
    );

    const codeEditorElement = (
      <CodeEditor
        {...rest}
        onChange={(code) => {
          triggerChangeEvent(code);
        }}
      />
    );

    return (
      <FormControl
        ref={ref}
        className={clsx(classes.root)}
        error={error}
        sx={{
          display: 'flex',
          width: 'auto',
          ...sx,
        }}
      >
        {(() => {
          if (variant === 'outlined') {
            return (
              <FieldSet
                error={error}
                sx={{
                  p: 0,
                  overflow: 'hidden',
                }}
              >
                {codeEditorElement}
              </FieldSet>
            );
          }
          return codeEditorElement;
        })()}
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default CodeEditorInputField;
