import 'draft-js/dist/Draft.css';

import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
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
  Tooltip,
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
import { isEmpty } from 'lodash';
import { Fragment, ReactNode, forwardRef, useEffect, useState } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import EllipsisMenuIconButton, {
  DropdownOption,
} from './EllipsisMenuIconButton';
import CodeBlockIcon from './Icons/CodeBlockIcon';
import CodeIcon from './Icons/CodeIcon';
import RedoIcon from './Icons/RedoIcon';
import UndoIcon from './Icons/UndoIcon';
import RenderIfVisible from './RenderIfVisible';

export const SQUARE_TOOL_DIMENSION = 32;

export type DraftTextAlignment = 'left' | 'center' | 'right';

export type Tool = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
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
  CODE_BLOCK: Tool;
  UNORDERED_LIST: Tool;
  ORDERED_LIST: Tool;
};

const INLINE_STYLES = [
  { icon: <FormatBoldIcon />, style: 'BOLD', label: 'Bold' },
  { icon: <FormatItalicIcon />, style: 'ITALIC', label: 'Italic' },
  { icon: <FormatUnderlinedIcon />, style: 'UNDERLINE', label: 'Underline' },
  {
    icon: <StrikethroughSIcon />,
    style: 'STRIKETHROUGH',
    label: 'Strikethrough',
  },
  { icon: <CodeIcon />, style: 'CODE', label: 'Code' },
] as const;

const BLOCK_TYPES = [
  {
    icon: <CodeBlockIcon />,
    style: 'code-block',
    key: 'CODE_BLOCK',
    label: 'Code block',
  },
  {
    icon: <FormatListBulletedIcon />,
    style: 'unordered-list-item',
    key: 'UNORDERED_LIST',
    label: 'Unordered list',
  },
  {
    icon: <FormatListNumberedIcon />,
    style: 'ordered-list-item',
    key: 'ORDERED_LIST',
    label: 'Ordered list',
  },
] as const;

const ALIGNMENTS = [
  { icon: <FormatAlignLeftIcon />, alignment: 'left', label: 'Align left' },
  {
    icon: <FormatAlignCenterIcon />,
    alignment: 'center',
    label: 'Align center',
  },
  { icon: <FormatAlignRightIcon />, alignment: 'right', label: 'Align right' },
] as const;

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

    const [invisibleToolsMap, setInvisibleToolsMap] = useState<
      Record<number, Record<number, Tool>>
    >({});

    const [editorState, setEditorState] = useState(() => {
      if (value) {
        return EditorState.createWithContent(convertFromHTML(value));
      }
      return EditorState.createEmpty();
    });
    const selectionState = editorState.getSelection();
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selectionState.getStartKey())
      .getType();

    const hasFocus = selectionState.getHasFocus();

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
        CODE_BLOCK,
        ORDERED_LIST,
        UNORDERED_LIST,
      } = {
        UNDO: {
          icon: (
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
          label: 'Undo',
          id: 'UNDO',
        },
        REDO: {
          icon: (
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
          label: 'Redo',
          id: 'REDO',
        },
        ...INLINE_STYLES.reduce((accumulator, { icon, style, label }) => {
          accumulator[style] = {
            icon,
            isActive: currentInlineStyle.has(style),
            onMouseDown: () => {
              setEditorState((prevEditorState) => {
                return RichUtils.toggleInlineStyle(prevEditorState, style);
              });
            },
            label,
            id: style,
          };
          return accumulator;
        }, {} as Record<string, Tool>),
        ...BLOCK_TYPES.reduce((accumulator, { icon, style, key, label }) => {
          accumulator[key] = {
            icon,
            isActive: blockType === style,
            onMouseDown: () => {
              setEditorState((prevEditorState) => {
                return RichUtils.toggleBlockType(prevEditorState, style);
              });
            },
            label,
            id: style,
          };
          return accumulator;
        }, {} as Record<string, Tool>),
        ...ALIGNMENTS.reduce((accumulator, { icon, alignment, label }) => {
          const id = `ALIGN_${alignment.toUpperCase()}`;
          accumulator[id] = {
            icon,
            isActive: textAlignment === alignment,
            onMouseDown: () => {
              setTextAlignment(alignment);
            },
            label,
            id,
          };
          return accumulator;
        }, {} as Record<string, Tool>),
      } as RichTextEditorTools;
      return [
        [UNDO, REDO],
        [BOLD, ITALIC, UNDERLINE, STRIKETHROUGH],
        [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT],
        [UNORDERED_LIST, ORDERED_LIST],
        [CODE, CODE_BLOCK],
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

    const toolGroupDivider = (
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{
          mx: 1,
        }}
      />
    );

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
            flexDirection: 'column',
          }}
        >
          {(() => {
            if (readOnly || disabled || locked) {
              return null;
            }
            const ellipsisToolWidth = 32 + 17;
            const visibleToolsWidth = (() => {
              return toolGroups.reduce(
                (accumulator, toolGroup, toolGroupIndex) => {
                  if (
                    toolGroupIndex > 0 &&
                    (!invisibleToolsMap[toolGroupIndex] ||
                      Object.keys(invisibleToolsMap[toolGroupIndex]).length !==
                        toolGroup.length)
                  ) {
                    accumulator += 17;
                  }
                  toolGroup.forEach((_, toolIndex) => {
                    if (!invisibleToolsMap[toolGroupIndex]?.[toolIndex]) {
                      accumulator += 32;
                    }
                  });
                  return accumulator;
                },
                0
              );
            })();
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  boxShadow: `0 0 5px ${alpha(palette.text.primary, 0.1)}`,
                  p: 0.5,
                  borderRadius: '4px',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflow: 'hidden',
                    minWidth: 0,
                    width: `calc(100% - ${ellipsisToolWidth}px)`,
                  }}
                >
                  {toolGroups.map((toolGroup, toolGroupIndex) => {
                    return (
                      <Fragment key={toolGroupIndex}>
                        {(() => {
                          if (toolGroupIndex > 0) {
                            if (
                              invisibleToolsMap[toolGroupIndex] &&
                              Object.keys(invisibleToolsMap[toolGroupIndex])
                                .length >= toolGroup.length
                            ) {
                              return <Box sx={{ pl: '17px' }} />;
                            }
                            return toolGroupDivider;
                          }
                        })()}
                        <Box
                          className={classes.toolGroup}
                          sx={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                          }}
                        >
                          {toolGroup.map((tool, toolIndex) => {
                            const {
                              icon,
                              isActive = false,
                              label,
                              sx,
                              ...rest
                            } = tool;
                            return (
                              <RenderIfVisible
                                key={toolIndex}
                                defaultPlaceholderDimensions={{
                                  width: SQUARE_TOOL_DIMENSION,
                                  height: SQUARE_TOOL_DIMENSION,
                                }}
                                onChangeVisibility={(isVisible) => {
                                  setInvisibleToolsMap(
                                    (prevInvisibleToolsMap) => {
                                      const nextInvisibleToolsMap = {
                                        ...prevInvisibleToolsMap,
                                      };
                                      if (isVisible) {
                                        if (
                                          nextInvisibleToolsMap[toolGroupIndex]
                                        ) {
                                          delete nextInvisibleToolsMap[
                                            toolGroupIndex
                                          ][toolIndex];
                                        }
                                        if (
                                          isEmpty(
                                            nextInvisibleToolsMap[
                                              toolGroupIndex
                                            ]
                                          )
                                        ) {
                                          delete nextInvisibleToolsMap[
                                            toolGroupIndex
                                          ];
                                        }
                                      } else {
                                        if (
                                          !nextInvisibleToolsMap[toolGroupIndex]
                                        ) {
                                          nextInvisibleToolsMap[
                                            toolGroupIndex
                                          ] = {};
                                        }
                                        nextInvisibleToolsMap[toolGroupIndex][
                                          toolIndex
                                        ] = tool;
                                      }
                                      return nextInvisibleToolsMap;
                                    }
                                  );
                                }}
                                threshold={1}
                                initialVisible
                              >
                                <Tooltip
                                  title={label}
                                  PopperProps={{
                                    sx: {
                                      pointerEvents: 'none',
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: SQUARE_TOOL_DIMENSION,
                                      height: SQUARE_TOOL_DIMENSION,
                                    }}
                                  >
                                    <Button
                                      color="inherit"
                                      variant={isActive ? 'contained' : 'text'}
                                      size="small"
                                      {...rest}
                                      sx={{
                                        minWidth: 'auto',
                                        ...sx,
                                        width: SQUARE_TOOL_DIMENSION,
                                        height: SQUARE_TOOL_DIMENSION,
                                        ...(() => {
                                          if (!hasFocus) {
                                            return {
                                              '&:not(:hover)': {
                                                color: alpha(
                                                  palette.text.primary,
                                                  0.26
                                                ),
                                              },
                                            };
                                          }
                                        })(),
                                        svg: {
                                          fontSize: 20,
                                        },
                                      }}
                                    >
                                      {icon}
                                    </Button>
                                  </Box>
                                </Tooltip>
                              </RenderIfVisible>
                            );
                          })}
                        </Box>
                      </Fragment>
                    );
                  })}
                </Box>
                {(() => {
                  const invisibleTools = Object.values(invisibleToolsMap);
                  if (invisibleTools.length > 0) {
                    const options: DropdownOption[] = [];
                    Object.values(invisibleToolsMap).forEach(
                      (toolGroupMap, index) => {
                        if (index > 0) {
                          options.push({
                            label: <Divider />,
                            value: '$$Divider$$',
                            selectable: false,
                            isDropdownOption: false,
                          });
                        }
                        Object.values(toolGroupMap).forEach(
                          ({ icon, label, id, onMouseDown }) => {
                            options.push({
                              label,
                              value: id,
                              icon,
                              onClick: onMouseDown,
                            });
                          }
                        );
                      }
                    );
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          position: 'absolute',
                          top: 0,
                          left: visibleToolsWidth,
                          py: 0.5,
                        }}
                      >
                        {toolGroupDivider}
                        <Tooltip
                          title="More formatting options"
                          PopperProps={{
                            sx: {
                              pointerEvents: 'none',
                            },
                          }}
                        >
                          <EllipsisMenuIconButton
                            color="inherit"
                            size="small"
                            {...{ options }}
                            sx={{
                              minWidth: 'auto',
                              width: SQUARE_TOOL_DIMENSION,
                              height: SQUARE_TOOL_DIMENSION,
                              ...(() => {
                                if (!hasFocus) {
                                  return {
                                    '&:not(:hover)': {
                                      color: alpha(palette.text.primary, 0.26),
                                    },
                                  };
                                }
                              })(),
                              svg: {
                                fontSize: 20,
                              },
                            }}
                          >
                            <MoreHorizIcon />
                          </EllipsisMenuIconButton>
                        </Tooltip>
                      </Box>
                    );
                  }
                })()}
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
              '.public-DraftStyleDefault-pre': {
                bgcolor: alpha(palette.text.primary, 0.05),
                fontFamily: `'Inconsolata', 'Menlo', 'Consolas', monospace`,
                fontSize: 14,
                p: 2,
                pre: {
                  m: 0,
                },
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
              customStyleMap={{
                CODE: {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
                  fontSize: 16,
                  padding: 2,
                },
              }}
            />
          </Box>
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default RichTextEditor;
