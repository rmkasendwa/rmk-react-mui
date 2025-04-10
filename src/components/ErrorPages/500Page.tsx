import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Button,
  ButtonProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import ErrorPage, { ErrorPageProps } from './ErrorPage';

export interface InternalErrorPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type InternalErrorPageClassKey = keyof InternalErrorPageClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiInternalErrorPage: InternalErrorPageProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiInternalErrorPage: keyof InternalErrorPageClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiInternalErrorPage?: {
      defaultProps?: ComponentsProps['MuiInternalErrorPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiInternalErrorPage'];
      variants?: ComponentsVariants['MuiInternalErrorPage'];
    };
  }
}
//#endregion

export const getInternalErrorPageUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiInternalErrorPage', slot);
};

const slots: Record<InternalErrorPageClassKey, [InternalErrorPageClassKey]> = {
  root: ['root'],
};

export const internalErrorPageClasses: InternalErrorPageClasses =
  generateUtilityClasses(
    'MuiInternalErrorPage',
    Object.keys(slots) as InternalErrorPageClassKey[]
  );

export type InternalErrorPageProps = Pick<
  ErrorPageProps,
  'className' | 'description'
> & {
  showGoAwayButton?: boolean;
  slotProps?: {
    goAwayButton?: Partial<ButtonProps>;
  };
};

export const InternalErrorPage = forwardRef<
  HTMLDivElement,
  InternalErrorPageProps
>(function InternalErrorPage(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiInternalErrorPage',
  });
  const { className, description, showGoAwayButton = true, slotProps } = props;

  const classes = composeClasses(
    slots,
    getInternalErrorPageUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <ErrorPage
      ref={ref}
      className={clsx(classes.root)}
      heading={<>We&rsquo;re sorry, something went wrong.</>}
      errorCode="500"
      tools={
        showGoAwayButton ? (
          <Button startIcon={<RefreshIcon />} {...slotProps?.goAwayButton}>
            Take me away from here
          </Button>
        ) : null
      }
      description={description}
      showDefaultPageLinks={showGoAwayButton}
    />
  );
});

export default InternalErrorPage;
