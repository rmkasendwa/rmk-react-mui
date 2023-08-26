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

export interface CodeIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CodeIconClassKey = keyof CodeIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCodeIcon: CodeIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCodeIcon: keyof CodeIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCodeIcon?: {
      defaultProps?: ComponentsProps['MuiCodeIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCodeIcon'];
      variants?: ComponentsVariants['MuiCodeIcon'];
    };
  }
}
//#endregion

export const getCodeIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCodeIcon', slot);
};

const slots: Record<CodeIconClassKey, [CodeIconClassKey]> = {
  root: ['root'],
};

export const codeIconClasses: CodeIconClasses = generateUtilityClasses(
  'MuiCodeIcon',
  Object.keys(slots) as CodeIconClassKey[]
);

export interface CodeIconProps extends SvgIconProps {}

export const CodeIcon = forwardRef<SVGSVGElement, CodeIconProps>(
  function CodeIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCodeIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getCodeIconUtilityClass,
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
        viewBox="0 0 1025 1024"
      >
        <path d="M293.0688 755.2c-12.0832 0-24.2688-4.2496-33.9968-12.9024L0 512l273.4592-243.0976C294.5536 250.2144 326.912 252.0064 345.7024 273.152c18.7904 21.1456 16.896 53.504-4.2496 72.2944L154.112 512l172.9536 153.7024c21.1456 18.7904 23.04 51.1488 4.2496 72.2944C321.2288 749.4144 307.1488 755.2 293.0688 755.2zM751.0528 755.0976 1024.512 512l-259.072-230.2976c-21.1456-18.7904-53.504-16.896-72.2432 4.2496-18.7904 21.1456-16.896 53.504 4.2496 72.2944L870.4 512l-187.3408 166.5024c-21.1456 18.7904-23.04 51.1488-4.2496 72.2944C688.896 762.2144 702.976 768 717.056 768 729.1392 768 741.3248 763.7504 751.0528 755.0976zM511.5392 827.648l102.4-614.4c4.6592-27.904-14.1824-54.272-42.0864-58.9312-28.0064-4.7104-54.3232 14.1824-58.88 42.0864l-102.4 614.4c-4.6592 27.904 14.1824 54.272 42.0864 58.9312C455.5264 870.1952 458.2912 870.4 461.1072 870.4 485.6832 870.4 507.392 852.6336 511.5392 827.648z" />
      </SvgIcon>
    );
  }
);

export default CodeIcon;
