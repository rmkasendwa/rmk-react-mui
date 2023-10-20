import CloseIcon from '@mui/icons-material/Close';
import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  IconButton,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

export interface FieldSetClasses {
  /** Styles applied to the root element. */
  root: string;
  removeButton: string;
  error: string;
}

export type FieldSetClassKey = keyof FieldSetClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldSet: FieldSetProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldSet: keyof FieldSetClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldSet?: {
      defaultProps?: ComponentsProps['MuiFieldSet'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldSet'];
      variants?: ComponentsVariants['MuiFieldSet'];
    };
  }
}
//#endregion

export const getFieldSetUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFieldSet', slot);
};

const slots: Record<FieldSetClassKey, [FieldSetClassKey]> = {
  root: ['root'],
  removeButton: ['removeButton'],
  error: ['error'],
};

export const fieldSetClasses: FieldSetClasses = generateUtilityClasses(
  'MuiFieldSet',
  Object.keys(slots) as FieldSetClassKey[]
);

export interface FieldSetProps extends Partial<Omit<BoxProps, 'title'>> {
  title?: ReactNode;
  removable?: boolean;
  onClickRemoveButton?: () => void;
  error?: boolean;
}

export const FieldSet = forwardRef<any, FieldSetProps>(function FieldSet(
  inProps,
  ref
) {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldSet' });
  const {
    className,
    removable = false,
    onClickRemoveButton,
    title,
    sx,
    children,
    error,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFieldSetUtilityClass,
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
      {...rest}
      className={clsx(classes.root, error && classes.error, className)}
      component="fieldset"
      sx={{
        border: `1px solid ${palette.divider}`,
        borderRadius: 1,
        p: 2,
        ...sx,
        position: 'relative',
        [`&.${classes.error}`]: {
          borderColor: palette.error.main,
        },
        [`&:not(.${classes.error}):hover`]: {
          borderColor: alpha(palette.divider, 0.87),
        },
        [`&:hover`]: {
          [`&>.${classes.removeButton}`]: {
            display: 'inline-flex',
          },
        },
      }}
    >
      {title != null ? <legend>{title}</legend> : null}
      {removable ? (
        <IconButton
          className={clsx(classes.removeButton)}
          onClick={onClickRemoveButton}
          sx={{
            p: 0.5,
            '&,&:hover': {
              bgcolor: palette.error.main,
              color: palette.error.contrastText,
            },
            position: 'absolute',
            top: title != null ? -21 : -11,
            right: -10,
            display: 'none',
          }}
        >
          <CloseIcon
            sx={{
              fontSize: 12,
            }}
          />
        </IconButton>
      ) : null}
      {children}
    </Box>
  );
});

export default FieldSet;
