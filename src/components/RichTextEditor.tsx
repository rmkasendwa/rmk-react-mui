import 'draft-js/dist/Draft.css';

import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import ImageIcon from '@mui/icons-material/Image';
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
  Grid,
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
import {
  AtomicBlockUtils,
  CompositeDecorator,
  ContentBlock,
  ContentState,
  EditorState,
  Modifier,
  RichUtils,
} from 'draft-js';
import { isEmpty } from 'lodash';
import {
  Fragment,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Yup from 'yup';

import { useLoadingContext } from '../contexts/LoadingContext';
import EllipsisMenuIconButton, {
  DropdownOption,
} from './EllipsisMenuIconButton';
import FormikTextAreaField from './FormikInputFields/FormikTextAreaField';
import FormikTextField from './FormikInputFields/FormikTextField';
import BlockquoteIcon from './Icons/BlockquoteIcon';
import CodeBlockIcon from './Icons/CodeBlockIcon';
import CodeIcon from './Icons/CodeIcon';
import LinkIcon from './Icons/LinkIcon';
import RedoIcon from './Icons/RedoIcon';
import UndoIcon from './Icons/UndoIcon';
import ModalForm from './ModalForm';
import RenderIfVisible from './RenderIfVisible';
import Tooltip from './Tooltip';

export interface RichTextEditorClasses {
  /** Styles applied to the root element. */
  root: string;
  toolGroup: string;
}

export type RichTextEditorClassKey = keyof RichTextEditorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRichTextEditor: RichTextEditorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRichTextEditor: keyof RichTextEditorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRichTextEditor?: {
      defaultProps?: ComponentsProps['MuiRichTextEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRichTextEditor'];
      variants?: ComponentsVariants['MuiRichTextEditor'];
    };
  }
}
//#endregion

export const getRichTextEditorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiRichTextEditor', slot);
};

const slots: Record<RichTextEditorClassKey, [RichTextEditorClassKey]> = {
  root: ['root'],
  toolGroup: ['toolGroup'],
};

export const richTextEditorClasses: RichTextEditorClasses =
  generateUtilityClasses(
    'MuiRichTextEditor',
    Object.keys(slots) as RichTextEditorClassKey[]
  );

const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];

export const SQUARE_TOOL_DIMENSION = 32;

export type DraftTextAlignment = 'left' | 'center' | 'right';

export type Tool = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  isActive?: boolean;
  onMouseDown: () => void;
} & Pick<ButtonProps, 'onMouseDown' | 'className' | 'disabled' | 'sx'>;

const Link = ({
  entityKey,
  contentState,
  children,
}: {
  entityKey: string;
  contentState: ContentState;
  children?: ReactNode;
}) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

const findLinkEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    );
  }, callback);
};

export const createLinkDecorator = () =>
  new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
    },
  ]);

export const getEntityAtOffset = (block: ContentBlock, offset: number) => {
  const entityKey = block.getEntityAt(offset);
  if (entityKey == null) {
    return null;
  }
  let startOffset = offset;
  while (startOffset > 0 && block.getEntityAt(startOffset - 1) === entityKey) {
    startOffset -= 1;
  }
  let endOffset = startOffset;
  const blockLength = block.getLength();
  while (
    endOffset < blockLength &&
    block.getEntityAt(endOffset + 1) === entityKey
  ) {
    endOffset += 1;
  }
  return {
    entityKey,
    blockKey: block.getKey(),
    startOffset,
    endOffset: endOffset + 1,
  };
};

export const getEntityAtCursor = (editorState: EditorState) => {
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  const startBlock = editorState.getCurrentContent().getBlockForKey(startKey);
  const startOffset = selection.getStartOffset();
  if (selection.isCollapsed()) {
    // Get the entity before the cursor (unless the cursor is at the start).
    return getEntityAtOffset(
      startBlock,
      startOffset === 0 ? startOffset : startOffset - 1
    );
  }
  if (startKey !== selection.getEndKey()) {
    return null;
  }
  const endOffset = selection.getEndOffset();
  const startEntityKey = startBlock.getEntityAt(startOffset);
  for (let i = startOffset; i < endOffset; i++) {
    const entityKey = startBlock.getEntityAt(i);
    if (entityKey == null || entityKey !== startEntityKey) {
      return null;
    }
  }
  return {
    entityKey: startEntityKey,
    blockKey: startBlock.getKey(),
    startOffset: startOffset,
    endOffset: endOffset,
  };
};

export type RichTextEditorTools = Record<
  | 'ALIGN_CENTER'
  | 'ALIGN_LEFT'
  | 'ALIGN_RIGHT'
  | 'BLOCK_QUOTE'
  | 'BOLD'
  | 'CODE'
  | 'CODE_BLOCK'
  | 'IMAGE'
  | 'ITALIC'
  | 'LINK'
  | 'ORDERED_LIST'
  | 'REDO'
  | 'STRIKETHROUGH'
  | 'UNDERLINE'
  | 'UNDO'
  | 'UNORDERED_LIST',
  Tool
>;

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
  {
    icon: <BlockquoteIcon />,
    style: 'blockquote',
    key: 'BLOCK_QUOTE',
    label: 'Blockquote',
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

const addLinkFormValidationSchema = Yup.object({
  linkText: Yup.string().required('Please enter the link text'),
  href: Yup.string().required('Please enter the link URL'),
});

type AddLinkFormValues = Yup.InferType<typeof addLinkFormValidationSchema>;

const addLinkFormInitialValues: AddLinkFormValues = {
  linkText: '',
  href: '',
};

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
  getToolGroups?: (
    tools: RichTextEditorTools
  ) => Tool[][] | undefined | null | void;
}

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
      getToolGroups,
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

    const inputFieldRef = useRef<HTMLInputElement | null>(null);

    const [invisibleToolsMap, setInvisibleToolsMap] = useState<
      Record<number, Record<number, Tool>>
    >({});

    const [addLinkModalOpen, setAddLinkModalOpen] = useState(false);

    const [editorState, setEditorState] = useState(() => {
      if (value != null) {
        return EditorState.createWithContent(convertFromHTML(value));
      }
      return EditorState.createEmpty();
    });
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    const blockType = contentState
      .getBlockForKey(selectionState.getStartKey())
      .getType();

    const hasFocus = selectionState.getHasFocus();
    const entityAtCursor = getEntityAtCursor(editorState);
    const isCursorOnLink = Boolean(
      (() => {
        if (entityAtCursor != null) {
          return (
            contentState.getEntity(entityAtCursor.entityKey).getType() ===
            'LINK'
          );
        }
      })()
    );

    const [textAlignment, setTextAlignment] =
      useState<DraftTextAlignment>('left');

    const toolGroups = (() => {
      const tools = {
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
        LINK: {
          icon: <LinkIcon />,
          onMouseDown: () => {
            setAddLinkModalOpen(true);
          },
          isActive: isCursorOnLink,
          label: 'Link',
          id: 'LINK',
        },
        IMAGE: {
          icon: <ImageIcon />,
          onMouseDown: () => {
            inputFieldRef.current?.click();
          },
          label: 'Image',
          id: 'IMAGE',
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

      if (getToolGroups) {
        const toolGroups = getToolGroups(tools);
        if (toolGroups) {
          return toolGroups;
        }
      }

      const {
        ALIGN_CENTER,
        ALIGN_LEFT,
        ALIGN_RIGHT,
        BLOCK_QUOTE,
        BOLD,
        CODE,
        CODE_BLOCK,
        IMAGE,
        ITALIC,
        LINK,
        ORDERED_LIST,
        REDO,
        STRIKETHROUGH,
        UNDERLINE,
        UNDO,
        UNORDERED_LIST,
      } = tools;

      return [
        [UNDO, REDO],
        [BOLD, ITALIC, UNDERLINE, STRIKETHROUGH],
        [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT],
        [LINK],
        [IMAGE],
        [UNORDERED_LIST, ORDERED_LIST],
        [BLOCK_QUOTE],
        [CODE, CODE_BLOCK],
      ];
    })();

    useEffect(() => {
      if (value != null) {
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
                              onMouseDown,
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
                                <Tooltip title={label} disableInteractive>
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
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        onMouseDown && onMouseDown(event);
                                      }}
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
                          disableInteractive
                        >
                          <EllipsisMenuIconButton
                            color="inherit"
                            size="small"
                            {...{ options }}
                            PaginatedDropdownOptionListProps={{
                              paging: false,
                            }}
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
              blockquote: {
                borderLeft: `5px solid ${palette.divider}`,
                color: palette.text.secondary,
                fontFamily: `'Hoefler Text', 'Georgia', serif`,
                fontStyle: 'italic',
                mx: 0,
                my: 2,
                px: 1.5,
                py: 1,
              },
            }}
          >
            <Editor
              {...{ placeholder, textAlignment, plugins }}
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
                        entityToHTML: ({ data, type }, originalText) => {
                          switch (type.toUpperCase()) {
                            case 'IMAGE':
                              return <img src={data.src} alt="" />;
                          }
                          return originalText;
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
              spellCheck
            />
          </Box>
          <ModalForm
            title="Add link"
            open={addLinkModalOpen}
            onClose={() => setAddLinkModalOpen(false)}
            initialValues={addLinkFormInitialValues}
            validationSchema={addLinkFormValidationSchema}
            onSubmit={({ href, linkText }) => {
              setEditorState((prevEditorState) => {
                const decorator = createLinkDecorator();
                const contentState = prevEditorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(
                  'LINK',
                  'MUTABLE',
                  {
                    url: href,
                  }
                );

                const entityKey =
                  contentStateWithEntity.getLastCreatedEntityKey();
                const selection = editorState.getSelection();

                const textWithEntity = Modifier.insertText(
                  contentState,
                  selection,
                  linkText,
                  undefined,
                  entityKey
                );

                return EditorState.createWithContent(textWithEntity, decorator);
              });
              setAddLinkModalOpen(false);
            }}
            submitButtonText="Save"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormikTextField label="Text" name="linkText" required />
              </Grid>
              <Grid item xs={12}>
                <FormikTextAreaField label="Link" name="href" required />
              </Grid>
            </Grid>
          </ModalForm>
          <input
            ref={inputFieldRef}
            type="file"
            style={{ display: 'none' }}
            onChange={async (event) => {
              if (event.target.files && event.target.files.length > 0) {
                const contentState = editorState.getCurrentContent();
                const src = await (async () => {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(event.target.files![0]);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                  });
                })();
                const contentStateWithEntity = contentState.createEntity(
                  'IMAGE',
                  'IMMUTABLE',
                  {
                    src,
                  }
                );
                const entityKey =
                  contentStateWithEntity.getLastCreatedEntityKey();
                const nextContentState = EditorState.set(editorState, {
                  currentContent: contentStateWithEntity,
                });
                setEditorState(
                  AtomicBlockUtils.insertAtomicBlock(
                    nextContentState,
                    entityKey,
                    ' '
                  )
                );
              }
            }}
          />
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default RichTextEditor;
