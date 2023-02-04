import 'draft-js/dist/Draft.css';

import CodeIcon from '@mui/icons-material/Code';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import {
  Box,
  Button,
  ButtonProps,
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
import { convertFromHTML, convertToHTML } from 'draft-convert';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { Fragment, ReactNode, forwardRef, useEffect, useState } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import RedoIcon from './Icons/RedoIcon';
import UndoIcon from './Icons/UndoIcon';

export type DraftTextAlignment = 'left' | 'center' | 'right';

export type Tool = {
  label: ReactNode;
  isActive?: boolean;
  onMouseDown: () => void;
} & Pick<ButtonProps, 'onMouseDown' | 'className' | 'disabled' | 'sx'>;

export type RichTextEditorTools = {
  UNDO: Tool;
  REDO: Tool;
  BOLD: Tool;
  ITALIC: Tool;
  UNDERLINE: Tool;
  STRIKETHROUGH: Tool;
  CODE: Tool;
  ALIGN_LEFT: Tool;
  ALIGN_CENTER: Tool;
  ALIGN_RIGHT: Tool;
};

const INLINE_STYLES = [
  { label: <FormatBoldIcon />, style: 'BOLD' },
  { label: <FormatItalicIcon />, style: 'ITALIC' },
  { label: <FormatUnderlinedIcon />, style: 'UNDERLINE' },
  { label: <StrikethroughSIcon />, style: 'STRIKETHROUGH' },
  { label: <CodeIcon />, style: 'CODE' },
] as const;

const ALIGNMENTS: { label: ReactNode; alignment: DraftTextAlignment }[] = [
  { label: <FormatAlignLeftIcon />, alignment: 'left' },
  { label: <FormatAlignCenterIcon />, alignment: 'center' },
  { label: <FormatAlignRightIcon />, alignment: 'right' },
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
  disabled?: boolean;
  readOnly?: boolean;
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
      disabled = false,
      readOnly = false,
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
    const { locked } = useLoadingContext();

    const [editorState, setEditorState] = useState(() => {
      if (value) {
        return EditorState.createWithContent(convertFromHTML(value));
      }
      return EditorState.createEmpty();
    });
    const currentStyle = editorState.getCurrentInlineStyle();

    const [textAlignment, setTextAlignment] =
      useState<DraftTextAlignment>('left');

    const toolGroups = (() => {
      const {
        ALIGN_CENTER,
        ALIGN_LEFT,
        ALIGN_RIGHT,
        BOLD,
        CODE,
        ITALIC,
        REDO,
        STRIKETHROUGH,
        UNDERLINE,
        UNDO,
      } = {
        UNDO: {
          label: (
            <UndoIcon
              sx={{
                fontSize: 16,
              }}
            />
          ),
          onMouseDown: () => {
            setEditorState((prevEditorState) => {
              return EditorState.undo(prevEditorState);
            });
          },
          disabled: editorState.getUndoStack().size <= 0,
        },
        REDO: {
          label: (
            <RedoIcon
              sx={{
                fontSize: 16,
              }}
            />
          ),
          onMouseDown: () => {
            setEditorState((prevEditorState) => {
              return EditorState.redo(prevEditorState);
            });
          },
          disabled: editorState.getRedoStack().size <= 0,
        },
        ...INLINE_STYLES.reduce((accumulator, { label, style }) => {
          accumulator[style] = {
            label,
            isActive: currentStyle.has(style),
            onMouseDown: () => {
              setEditorState((prevEditorState) => {
                return RichUtils.toggleInlineStyle(prevEditorState, style);
              });
            },
          };
          return accumulator;
        }, {} as Record<string, Tool>),
        ...ALIGNMENTS.reduce((accumulator, { label, alignment }) => {
          accumulator[`ALIGN_${alignment.toUpperCase()}`] = {
            label,
            isActive: textAlignment === alignment,
            onMouseDown: () => {
              setTextAlignment(alignment);
            },
          };
          return accumulator;
        }, {} as Record<string, Tool>),
      } as RichTextEditorTools;
      return [
        [UNDO, REDO],
        [BOLD, ITALIC, UNDERLINE, STRIKETHROUGH, CODE],
        [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT],
      ];
    })();

    useEffect(() => {
      if (value) {
        setEditorState((prevEditorState) => {
          const selectionState = prevEditorState.getSelection();
          const hasFocus = selectionState.getHasFocus();
          if (hasFocus) {
            return prevEditorState;
          }
          const nextEditorState = EditorState.createWithContent(
            convertFromHTML(value)
          );
          return nextEditorState;
        });
      }
    }, [value]);

    return (
      <FormControl
        ref={ref}
        {...{ error }}
        className={clsx(classes.root)}
        fullWidth
      >
        {(() => {
          if (readOnly || disabled || locked) {
            return null;
          }
          return (
            <Box
              sx={{
                display: 'flex',
                boxShadow: `0 0 5px ${alpha(palette.text.primary, 0.1)}`,
                p: 0.5,
                borderRadius: '4px',
              }}
            >
              {toolGroups.map((toolGroup, index) => {
                return (
                  <Fragment key={index}>
                    {index > 0 ? (
                      <Divider
                        orientation="vertical"
                        variant="middle"
                        flexItem
                        sx={{
                          mx: 1,
                        }}
                      />
                    ) : null}
                    <Box className={classes.toolGroup}>
                      {toolGroup.map(
                        ({ label, isActive = false, sx, ...rest }, index) => {
                          return (
                            <Button
                              key={index}
                              color={isActive ? 'primary' : 'inherit'}
                              size="small"
                              {...rest}
                              sx={{
                                minWidth: 'auto',
                                ...sx,
                                width: 32,
                                height: 32,
                              }}
                            >
                              {label}
                            </Button>
                          );
                        }
                      )}
                    </Box>
                  </Fragment>
                );
              })}
            </Box>
          );
        })()}
        <Box
          sx={{
            py: 1,
            ...(() => {
              if (disabled) {
                return {
                  bgcolor: palette.divider,
                };
              }
            })(),
            '[data-contents]': {
              minHeight: 100,
            },
          }}
        >
          <Editor
            {...{ placeholder, textAlignment }}
            editorState={editorState}
            onChange={(nextEditorState) => {
              setEditorState(nextEditorState);
              if (onChange) {
                const event: any = new Event('change', { bubbles: true });
                Object.defineProperty(event, 'target', {
                  writable: false,
                  value: {
                    id,
                    name,
                    value: convertToHTML({
                      blockToHTML: ({ type, text }) => {
                        if (text.length <= 0 && type === 'unstyled') {
                          return <br />;
                        }
                      },
                    })(nextEditorState.getCurrentContent()),
                  },
                });
                onChange(event);
              }
            }}
            readOnly={readOnly || disabled || locked}
          />
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default RichTextEditor;
