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
import clsx from 'clsx';
import { MD5 } from 'crypto-js';
import { forwardRef } from 'react';

import { GRAVATAR_URL } from '../constants';
import ProfileAvatar, { ProfileAvatarProps } from './ProfileAvatar';

export interface ProfileGravatarClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ProfileGravatarClassKey = keyof ProfileGravatarClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiProfileGravatar: ProfileGravatarProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiProfileGravatar: keyof ProfileGravatarClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiProfileGravatar?: {
      defaultProps?: ComponentsProps['MuiProfileGravatar'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiProfileGravatar'];
      variants?: ComponentsVariants['MuiProfileGravatar'];
    };
  }
}

export interface ProfileGravatarProps extends ProfileAvatarProps {
  email?: string;
}

export function getProfileGravatarUtilityClass(slot: string): string {
  return generateUtilityClass('MuiProfileGravatar', slot);
}

export const profileGravatarClasses: ProfileGravatarClasses =
  generateUtilityClasses('MuiProfileGravatar', ['root']);

const slots = {
  root: ['root'],
};

export const ProfileGravatar = forwardRef<HTMLDivElement, ProfileGravatarProps>(
  function ProfileGravatar(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiProfileGravatar' });
    const { className, email, size, defaultAvatar, sx, ...rest } = props;

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

    return (
      <Box
        ref={ref}
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <ProfileAvatar {...{ size, defaultAvatar }} {...rest} sx={{ ...sx }} />
        {email ? (
          <ProfileAvatar
            {...{ size }}
            {...rest}
            className={clsx(classes.root)}
            src={addSearchParams(
              getInterpolatedPath(GRAVATAR_URL, {
                md5EmailHash: MD5(email).toString(),
              }),
              {
                default: 'blank',
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
