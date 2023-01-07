import 'draft-js/dist/Draft.css';

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  TextFieldProps,
} from '@mui/material';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { FC, useState } from 'react';

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

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
  > {}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  helperText,
  error,
  className,
  placeholder,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <FormControl
      fullWidth
      {...{ error, className }}
      sx={{
        '.rich-text-editor [data-contents]': {
          minHeight: 200,
        },
      }}
    >
      <Box>
        {BLOCK_TYPES.map(({ label, style }) => {
          return (
            <Button
              key={label}
              color={style === blockType ? 'primary' : 'inherit'}
              onMouseDown={() => {
                setEditorState((prevEditorState) => {
                  return RichUtils.toggleBlockType(prevEditorState, style);
                });
              }}
              sx={{
                minWidth: 'auto',
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>
      <Box>
        {INLINE_STYLES.map(({ label, style }) => {
          return (
            <Button
              key={label}
              color={currentStyle.has(style) ? 'primary' : 'inherit'}
              onMouseDown={() => {
                setEditorState((prevEditorState) => {
                  return RichUtils.toggleInlineStyle(prevEditorState, style);
                });
              }}
              sx={{
                minWidth: 'auto',
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        {...{ placeholder }}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RichTextEditor;
