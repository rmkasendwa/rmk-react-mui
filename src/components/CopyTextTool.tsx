import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SvgIconProps,
  Tooltip,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef, useEffect, useState } from 'react';

export interface CopyTextToolClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CopyTextToolClassKey = keyof CopyTextToolClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCopyTextTool: CopyTextToolProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCopyTextTool: keyof CopyTextToolClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCopyTextTool?: {
      defaultProps?: ComponentsProps['MuiCopyTextTool'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCopyTextTool'];
      variants?: ComponentsVariants['MuiCopyTextTool'];
    };
  }
}
//#endregion

export const getCopyTextToolUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCopyTextTool', slot);
};

const slots: Record<CopyTextToolClassKey, [CopyTextToolClassKey]> = {
  root: ['root'],
};

export const copyTextToolClasses: CopyTextToolClasses = generateUtilityClasses(
  'MuiCopyTextTool',
  Object.keys(slots) as CopyTextToolClassKey[]
);

export interface CopyTextToolProps extends Partial<SvgIconProps> {
  text: string;
  copiedMessage?: ReactNode;
}

export const CopyTextTool = forwardRef<SVGSVGElement, CopyTextToolProps>(
  function CopyTextTool(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCopyTextTool' });
    const { className, text, copiedMessage = 'Copied', sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getCopyTextToolUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (copied) {
        const timeout = setTimeout(() => {
          setCopied(false);
        }, 1500);
        return () => {
          clearTimeout(timeout);
        };
      }
    }, [copied]);

    return (
      <Tooltip title={copied ? copiedMessage : 'Copy'} disableInteractive>
        <ContentCopyIcon
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
          }}
          color="primary"
          sx={{
            cursor: 'pointer',
            ...sx,
          }}
        />
      </Tooltip>
    );
  }
);

export default CopyTextTool;
