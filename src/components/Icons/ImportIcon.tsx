import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface ImportIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ImportIconClassKey = keyof ImportIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiImportIcon: ImportIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiImportIcon: keyof ImportIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiImportIcon?: {
      defaultProps?: ComponentsProps['MuiImportIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiImportIcon'];
      variants?: ComponentsVariants['MuiImportIcon'];
    };
  }
}

export interface ImportIconProps extends SvgIconProps {}

export function getImportIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiImportIcon', slot);
}

export const codeBlockIconClasses: ImportIconClasses = generateUtilityClasses(
  'MuiImportIcon',
  ['root']
);

const slots = {
  root: ['root'],
};

export const ImportIcon = forwardRef<SVGSVGElement, ImportIconProps>(
  function ImportIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiImportIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getImportIconUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <SvgIcon
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        viewBox="0 0 1024 1024"
      >
        <path d="M733.397 928.471l114.925-145.925H733.397v145.925z m6 0" />
        <path d="M781.211 98.623H196.236c-37.245 0-67.46 30.154-67.539 67.399v695.05c0.078 37.245 30.294 67.399 67.539 67.399h472.216V738.065a22.455 22.455 0 0 1 6.581-15.882 22.458 22.458 0 0 1 15.882-6.581h157.406v-549.58c-0.078-37.079-30.03-67.163-67.11-67.399zM227.387 639.965h122.332c20.48 0 34.133 13.656 34.133 34.133 0 20.48-13.653 34.137-34.133 34.137H227.387c-20.481 0-34.133-13.657-34.133-34.137 0-20.477 13.652-34.133 34.133-34.133z m250.332 191.756H227.387c-20.481 0-34.133-13.657-34.133-34.137 0-20.477 13.652-34.133 34.133-34.133h250.332c20.48 0 34.133 13.656 34.133 34.133 0 20.48-13.653 34.137-34.133 34.137z m3.71-255.821L324.167 401.614h102.399s21.175-158.734 140.64-199.695c17.067-6.825 37.547-10.239 58.028-10.239-37.547 17.067-61.442 58.028-71.68 81.918-7.557 16.422-15.723 25.614-15.723 128.016h102.403L481.429 575.9z" />
      </SvgIcon>
    );
  }
);

export default ImportIcon;
