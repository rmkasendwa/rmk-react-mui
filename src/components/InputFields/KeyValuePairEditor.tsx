import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Button,
  ButtonProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  FormControl,
  FormControlProps,
  FormHelperText,
  Grid,
  IconButton,
  Tooltip,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import {
  ChangeEventHandler,
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';
import CopyTextTool from '../CopyTextTool';
import FieldLabel from '../FieldLabel';
import FieldValue from '../FieldValue';
import TextAreaField from './TextAreaField';
import TextField, { TextFieldProps } from './TextField';

export interface KeyValuePairEditorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type KeyValuePairEditorClassKey = keyof KeyValuePairEditorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKeyValuePairEditor: KeyValuePairEditorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKeyValuePairEditor: keyof KeyValuePairEditorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKeyValuePairEditor?: {
      defaultProps?: ComponentsProps['MuiKeyValuePairEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKeyValuePairEditor'];
      variants?: ComponentsVariants['MuiKeyValuePairEditor'];
    };
  }
}
//#endregion

export const getKeyValuePairEditorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiKeyValuePairEditor', slot);
};

const slots: Record<KeyValuePairEditorClassKey, [KeyValuePairEditorClassKey]> =
  {
    root: ['root'],
  };

export const keyValuePairEditorClasses: KeyValuePairEditorClasses =
  generateUtilityClasses(
    'MuiKeyValuePairEditor',
    Object.keys(slots) as KeyValuePairEditorClassKey[]
  );

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface KeyValuePairEditorProps
  extends Partial<Omit<FormControlProps, 'onChange'>>,
    Partial<Pick<TextFieldProps, 'error' | 'helperText'>> {
  enableLoadingState?: boolean;
  valueCanHaveMultipleLines?: boolean;
  keyFieldPlaceholder?: string;
  valueFieldPlaceholder?: string;
  AddRowButtonProps?: Partial<ButtonProps>;
  value?: Record<string, string>;
  onChange?: ChangeEventHandler<{
    value: Record<string, string>;
  }>;
  name?: string;
}

export const KeyValuePairEditor = forwardRef<any, KeyValuePairEditorProps>(
  function KeyValuePairEditor(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiKeyValuePairEditor',
    });
    const {
      className,
      enableLoadingState = true,
      valueCanHaveMultipleLines = false,
      keyFieldPlaceholder = 'Key',
      valueFieldPlaceholder = 'Value',
      AddRowButtonProps = {},
      onChange,
      id,
      name,
      value,
      error,
      helperText,
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getKeyValuePairEditorUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const {
      children: AddRowButtonPropsChildren = 'Add Row',
      ...AddRowButtonPropsRest
    } = AddRowButtonProps;

    //#region Refs
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const isInitialMountRef = useRef(true);
    //#endregion

    const { palette } = useTheme();
    const [items, setItems] = useState<KeyValuePair[]>([]);
    const { locked } = useLoadingContext();
    const isEditing = !locked && enableLoadingState;

    const triggerChangeEvent = useCallback(
      (items: KeyValuePair[]) => {
        if (onChangeRef.current) {
          const event: any = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: {
              name,
              id,
              value: (() => {
                const filteredItems = items.filter(({ key }) => {
                  return key.trim().length > 0;
                });
                if (filteredItems.length > 0) {
                  return Object.fromEntries(
                    filteredItems.map(({ key, value }) => {
                      return [key, value];
                    })
                  );
                }
              })(),
            },
          });
          onChangeRef.current(event);
        }
      },
      [id, name]
    );

    useEffect(() => {
      if (value) {
        setItems((prevItems) => {
          const nextItems: KeyValuePair[] = Object.entries(value).map(
            ([key, value]) => {
              return {
                key,
                value,
              };
            }
          );
          if (JSON.stringify(prevItems) !== JSON.stringify(nextItems)) {
            return nextItems;
          }
          return prevItems;
        });
      }
    }, [value]);

    useEffect(() => {
      if (!isInitialMountRef.current) {
        triggerChangeEvent(items);
      }
    }, [items, triggerChangeEvent]);

    useEffect(() => {
      isInitialMountRef.current = false;
      return () => {
        isInitialMountRef.current = true;
      };
    }, []);

    return (
      <FormControl
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        error={error}
        sx={{
          display: 'flex',
          width: 'auto',
          ...sx,
        }}
      >
        {items.map(({ key, value }, index) => {
          return (
            <Fragment key={index}>
              {index > 0 ? <Divider /> : null}
              <Box
                sx={{
                  '&:hover': {
                    bgcolor: alpha(palette.primary.main, 0.05),
                  },
                  py: 1,
                  px: 2,
                }}
              >
                <Grid container columnGap={1}>
                  <Grid
                    item
                    xs
                    sx={{
                      minWidth: 0,
                      maxWidth: 150,
                    }}
                  >
                    {isEditing ? (
                      <TextField
                        placeholder={keyFieldPlaceholder}
                        value={key}
                        onChange={(event) => {
                          const nextItems = [...items];
                          nextItems[index].key = event.target.value;
                          setItems(nextItems);
                        }}
                        InputProps={{
                          sx: {
                            bgcolor: alpha(palette.primary.main, 0.05),
                          },
                        }}
                      />
                    ) : (
                      <FieldLabel>{key}</FieldLabel>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    {(() => {
                      if (isEditing) {
                        if (valueCanHaveMultipleLines) {
                          return (
                            <TextAreaField
                              placeholder={valueFieldPlaceholder}
                              value={value}
                              onChange={(event) => {
                                const nextItems = [...items];
                                nextItems[index].value = event.target.value;
                                setItems(nextItems);
                              }}
                              InputProps={{
                                sx: {
                                  bgcolor: alpha(palette.success.main, 0.05),
                                },
                              }}
                              minRows={1}
                            />
                          );
                        }
                        return (
                          <TextField
                            placeholder={valueFieldPlaceholder}
                            value={value}
                            onChange={(event) => {
                              const nextItems = [...items];
                              nextItems[index].value = event.target.value;
                              setItems(nextItems);
                            }}
                            InputProps={{
                              sx: {
                                bgcolor: alpha(palette.success.main, 0.05),
                              },
                            }}
                            minRows={1}
                          />
                        );
                      }
                      return (
                        <FieldValue
                          icon={
                            <CopyTextTool
                              text={value}
                              copiedMessage={
                                <>
                                  Copied message template for
                                  <br />
                                  key: {key}
                                </>
                              }
                            />
                          }
                        >
                          {value}
                        </FieldValue>
                      );
                    })()}
                  </Grid>
                  {isEditing ? (
                    <Grid
                      item
                      sx={{
                        width: 32,
                      }}
                    >
                      <Tooltip title="Remove" disableInteractive>
                        <IconButton
                          onClick={() => {
                            const nextItems = [...items];
                            nextItems.splice(index, 1);
                            setItems(nextItems);
                          }}
                          sx={{
                            p: 0.5,
                          }}
                        >
                          <DeleteOutlineIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            </Fragment>
          );
        })}
        {items.length > 0 ? <Divider /> : null}
        <Box
          sx={{
            py: 1,
            px: 2,
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            {...AddRowButtonPropsRest}
            onClick={() => {
              setItems([
                ...items,
                {
                  key: '',
                  value: '',
                },
              ]);
            }}
          >
            {AddRowButtonPropsChildren}
          </Button>
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

export default KeyValuePairEditor;
