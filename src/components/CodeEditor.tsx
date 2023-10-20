import Editor, { EditorProps } from '@monaco-editor/react';
import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface CodeEditorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CodeEditorClassKey = keyof CodeEditorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCodeEditor: CodeEditorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCodeEditor: keyof CodeEditorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCodeEditor?: {
      defaultProps?: ComponentsProps['MuiCodeEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCodeEditor'];
      variants?: ComponentsVariants['MuiCodeEditor'];
    };
  }
}
//#endregion

export const getCodeEditorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCodeEditor', slot);
};

const slots: Record<CodeEditorClassKey, [CodeEditorClassKey]> = {
  root: ['root'],
};

export const codeEditorClasses: CodeEditorClasses = generateUtilityClasses(
  'MuiCodeEditor',
  Object.keys(slots) as CodeEditorClassKey[]
);

export interface CodeEditorProps
  extends EditorProps,
    Partial<Pick<BoxProps, 'className' | 'sx'>> {}

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  function CodeEditor(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCodeEditor' });
    const { className, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getCodeEditorUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();

    return (
      <Box
        ref={ref}
        className={clsx(classes.root)}
        sx={{
          minHeight: 300,
          position: 'relative',
          ...sx,
          '&>section': {
            position: 'absolute !important',
            height: '100% !important',
          },
        }}
      >
        <Editor
          theme={palette.mode === 'light' ? 'light' : 'vs-dark'}
          {...rest}
        />
      </Box>
    );
  }
);

export default CodeEditor;
