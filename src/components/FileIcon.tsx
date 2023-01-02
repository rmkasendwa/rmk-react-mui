import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef, useMemo } from 'react';
import {
  FileIcon as BaseFileIcon,
  DefaultExtensionType,
  defaultStyles,
} from 'react-file-icon';

export interface FileIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileIconClassKey = keyof FileIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFileIcon: FileIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFileIcon: keyof FileIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFileIcon?: {
      defaultProps?: ComponentsProps['MuiFileIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFileIcon'];
      variants?: ComponentsVariants['MuiFileIcon'];
    };
  }
}

export interface FileIconProps extends Pick<BoxProps, 'className' | 'sx'> {
  fileName: string;
}

export function getFileIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileIcon', slot);
}

export const fileIconClasses: FileIconClasses = generateUtilityClasses(
  'MuiFileIcon',
  ['root']
);

const slots = {
  root: ['root'],
};

export const FileIcon = forwardRef<HTMLDivElement, FileIconProps>(
  function FileIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFileIcon' });
    const { className, fileName, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getFileIconUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const fileExtension = useMemo(() => {
      const match = /\.([a-z]+)$/gi.exec(fileName);
      if (match) {
        return match[1];
      }
      return '';
    }, [fileName]);

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          ...sx,
          display: 'flex',
        }}
      >
        <BaseFileIcon
          extension={fileExtension.toUpperCase()}
          {...(() => {
            if (fileExtension) {
              return defaultStyles[fileExtension as DefaultExtensionType];
            }
          })()}
        />
      </Box>
    );
  }
);

export default FileIcon;
