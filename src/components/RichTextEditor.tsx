import 'draft-js/dist/Draft.css';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Box,
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  FormControl,
  FormHelperText,
  TextFieldProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import {
  ContentState,
  Editor,
  EditorState,
  RichUtils,
  convertFromHTML,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { forwardRef, useState } from 'react';

const INLINE_STYLES = [
  { label: <FormatBoldIcon />, style: 'BOLD' },
  { label: <FormatItalicIcon />, style: 'ITALIC' },
  { label: <FormatUnderlinedIcon />, style: 'UNDERLINE' },
];

export interface RichTextEditorClasses {
  /** Styles applied to the root element. */
  root: string;
  toolGroup: string;
}

export type RichTextEditorClassKey = keyof RichTextEditorClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRichTextEditor: RichTextEditorProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRichTextEditor: keyof RichTextEditorClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRichTextEditor?: {
      defaultProps?: ComponentsProps['MuiRichTextEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRichTextEditor'];
      variants?: ComponentsVariants['MuiRichTextEditor'];
    };
  }
}

export interface RichTextEditorProps
  extends Pick<
    TextFieldProps,
    | 'helperText'
    | 'error'
    | 'onChange'
    | 'name'
    | 'id'
    | 'className'
    | 'placeholder'
    | 'required'
  > {
  value?: string;
}

export function getRichTextEditorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiRichTextEditor', slot);
}

export const richTextEditorClasses: RichTextEditorClasses =
  generateUtilityClasses('MuiRichTextEditor', ['root', 'toolGroup']);

const slots = {
  root: ['root'],
  toolGroup: ['toolGroup'],
};

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiRichTextEditor' });
    const {
      helperText,
      error,
      className,
      placeholder,
      value,
      name,
      id,
      onChange,
    } = props;

    const classes = composeClasses(
      slots,
      getRichTextEditorUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();
    const [editorState, setEditorState] = useState(() => {
      if (value) {
        const { contentBlocks, entityMap } = convertFromHTML(value);
        return EditorState.createWithContent(
          ContentState.createFromBlockArray(contentBlocks, entityMap)
        );
      }
      return EditorState.createEmpty();
    });
    const currentStyle = editorState.getCurrentInlineStyle();

    return (
      <FormControl
        ref={ref}
        {...{ error }}
        className={clsx(classes.root)}
        fullWidth
      >
        <Box
          sx={{
            display: 'flex',
            boxShadow: `0 0 5px ${alpha(palette.text.primary, 0.1)}`,
            p: 0.5,
            borderRadius: '4px',
          }}
        >
          <Box className={classes.toolGroup}>
            <Button
              color="inherit"
              onMouseDown={() => {
                setEditorState((prevEditorState) => {
                  return EditorState.undo(prevEditorState);
                });
              }}
              size="small"
              sx={{
                minWidth: 'auto',
              }}
            >
              <UndoIcon />
            </Button>
            <Button
              color="inherit"
              onMouseDown={() => {
                setEditorState((prevEditorState) => {
                  return EditorState.redo(prevEditorState);
                });
              }}
              size="small"
              sx={{
                minWidth: 'auto',
              }}
            >
              <RedoIcon />
            </Button>
          </Box>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{
              mx: 1,
            }}
          />
          <Box className={classes.toolGroup}>
            {INLINE_STYLES.map(({ label, style }) => {
              return (
                <Button
                  key={style}
                  color={currentStyle.has(style) ? 'primary' : 'inherit'}
                  onMouseDown={() => {
                    setEditorState((prevEditorState) => {
                      return RichUtils.toggleInlineStyle(
                        prevEditorState,
                        style
                      );
                    });
                  }}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{
            py: 1,
            '[data-contents]': {
              minHeight: 200,
            },
          }}
        >
          <Editor
            editorState={editorState}
            onChange={(nextEditorState) => {
              setEditorState(nextEditorState);
              const rawContentState = convertToRaw(
                nextEditorState.getCurrentContent()
              );
              const event: any = new Event('change', { bubbles: true });
              Object.defineProperty(event, 'target', {
                writable: false,
                value: { id, name, value: draftToHtml(rawContentState) },
              });
              onChange && onChange(event);
            }}
            {...{ placeholder }}
          />
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default RichTextEditor;
