import { Box } from '@mui/material';
import { MD5 } from 'crypto-js';
import { forwardRef } from 'react';

import { GRAVATAR_URL } from '../constants';
import { addSearchParams, getInterpolatedPath } from '../utils/paths';
import ProfileAvatar, { IProfileAvatarProps } from './ProfileAvatar';

export interface IProfileGravatarProps extends IProfileAvatarProps {
  email: string;
}

export const ProfileGravatar = forwardRef<
  HTMLDivElement,
  IProfileGravatarProps
>(function ProfileGravatar({ email, size, defaultAvatar, sx, ...rest }, ref) {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        display: 'inline-flex',
      }}
    >
      <ProfileAvatar {...{ size, defaultAvatar }} {...rest} sx={{ ...sx }} />
      <ProfileAvatar
        {...{ size }}
        {...rest}
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
    </Box>
  );
});

export default ProfileGravatar;