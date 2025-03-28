import {
  addSearchParams,
  getInterpolatedPath,
} from '@infinite-debugger/rmk-utils/paths';
import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { md5 } from 'js-md5';
import { GRAVATAR_URL } from '../constants';
import { useLoadingContext } from '../contexts/LoadingContext';
import { parseNameAndEmailAddressCombination } from '../utils';
import ProfileAvatar, { ProfileAvatarProps } from './ProfileAvatar';

export interface ProfileGravatarClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ProfileGravatarClassKey = keyof ProfileGravatarClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiProfileGravatar: ProfileGravatarProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiProfileGravatar: keyof ProfileGravatarClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiProfileGravatar?: {
      defaultProps?: ComponentsProps['MuiProfileGravatar'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiProfileGravatar'];
      variants?: ComponentsVariants['MuiProfileGravatar'];
    };
  }
}
//#endregion

export const getProfileGravatarUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiProfileGravatar', slot);
};

const slots: Record<ProfileGravatarClassKey, [ProfileGravatarClassKey]> = {
  root: ['root'],
};

export const profileGravatarClasses: ProfileGravatarClasses =
  generateUtilityClasses(
    'MuiProfileGravatar',
    Object.keys(slots) as ProfileGravatarClassKey[]
  );

export interface ProfileGravatarProps
  extends Omit<BoxProps, 'ref'>,
    Partial<
      Pick<
        ProfileAvatarProps,
        | 'label'
        | 'size'
        | 'defaultAvatar'
        | 'enableLoadingState'
        | 'src'
        | 'children'
        | 'variant'
      >
    > {
  email?: string;
  defaultGravatar?:
    | 'mp'
    | 'identicon'
    | 'monsterid'
    | 'wavatar'
    | 'retro'
    | 'robohash'
    | 'blank';
}

export const ProfileGravatar = forwardRef<HTMLDivElement, ProfileGravatarProps>(
  function ProfileGravatar(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiProfileGravatar' });
    const {
      className,
      label,
      email: emailProp,
      size,
      defaultAvatar,
      enableLoadingState,
      variant,
      src,
      sx,
      children,
      defaultGravatar = 'blank',
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getProfileGravatarUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { loading, errorMessage } = useLoadingContext();

    const email = (() => {
      if (label) {
        const { email } = parseNameAndEmailAddressCombination(label);
        if (email) {
          return email;
        }
      }
      return emailProp;
    })();

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <ProfileAvatar
          {...{
            size,
            defaultAvatar,
            label,
            enableLoadingState,
            src,
            children,
            variant,
          }}
          sx={sx}
        />
        {email && !loading && !errorMessage ? (
          <ProfileAvatar
            {...{ size, variant }}
            src={addSearchParams(
              getInterpolatedPath(GRAVATAR_URL, {
                md5EmailHash: md5(email).toString(),
              }),
              {
                default: defaultGravatar,
                size,
              }
            )}
            sx={{ ...sx, position: 'absolute', top: 0, left: 0 }}
          />
        ) : null}
      </Box>
    );
  }
);

export default ProfileGravatar;
