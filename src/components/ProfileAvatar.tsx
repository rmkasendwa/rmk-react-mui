import {
  Avatar,
  AvatarProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Skeleton,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useMemo } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import { parseNameAndEmailAddressCombination } from '../utils';
import ErrorSkeleton from './ErrorSkeleton';

export interface ProfileAvatarClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ProfileAvatarClassKey = keyof ProfileAvatarClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiProfileAvatar: ProfileAvatarProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiProfileAvatar: keyof ProfileAvatarClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiProfileAvatar?: {
      defaultProps?: ComponentsProps['MuiProfileAvatar'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiProfileAvatar'];
      variants?: ComponentsVariants['MuiProfileAvatar'];
    };
  }
}

export type DefaultAvatar =
  | 'standard'
  | 'hueShiftingInitials'
  | 'highContrastHueShiftingIntials';

export interface ProfileAvatarProps extends AvatarProps {
  label?: string;
  defaultAvatar?: DefaultAvatar;
  size?: number;
  enableLoadingState?: boolean;
}

export function getProfileAvatarUtilityClass(slot: string): string {
  return generateUtilityClass('MuiProfileAvatar', slot);
}

export const profileAvatarClasses: ProfileAvatarClasses =
  generateUtilityClasses('MuiProfileAvatar', ['root']);

const slots = {
  root: ['root'],
};

export const ProfileAvatar = forwardRef<HTMLDivElement, ProfileAvatarProps>(
  function ProfileAvatar(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiProfileAvatar' });
    const {
      label: label,
      sx,
      size = 32,
      defaultAvatar = 'standard',
      children,
      className,
      enableLoadingState = true,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getProfileAvatarUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { bgcolor, color } = useMemo(() => {
      if (label) {
        if (
          (
            [
              'hueShiftingInitials',
              'highContrastHueShiftingIntials',
            ] as DefaultAvatar[]
          ).includes(defaultAvatar)
        ) {
          const nameCharacters = label.replaceAll(/\s/g, '').toUpperCase();
          const totalCharacterWeight = nameCharacters.length * 26;
          const characterWeight = nameCharacters
            .split('')
            .reduce((accumulator, character) => {
              return accumulator + character.charCodeAt(0) - 65;
            }, 0);
          const shiftMagnitude = nameCharacters.length * 9;
          let hueWeight =
            characterWeight +
            (nameCharacters.length % 2 === 0
              ? shiftMagnitude
              : -shiftMagnitude);
          hueWeight < 0 && (hueWeight = 0);
          hueWeight > totalCharacterWeight &&
            (hueWeight = totalCharacterWeight);
          const hue = (hueWeight / totalCharacterWeight) * 360;
          const saturation =
            ((totalCharacterWeight - characterWeight) / totalCharacterWeight) *
            100;
          switch (defaultAvatar) {
            case 'hueShiftingInitials': {
              const bgcolor = `hsl(${hue},${saturation}%, 85%) !important`;
              const color = `hsl(${hue},${saturation}%, 30%) !important`;
              return { bgcolor, color };
            }
            case 'highContrastHueShiftingIntials': {
              const bgcolor = `hsl(${hue},${saturation}%, 30%) !important`;
              const color = `#fff !important`;
              return { bgcolor, color };
            }
          }
        }
      }
      return {};
    }, [defaultAvatar, label]);

    const { loading, errorMessage } = useLoadingContext();
    if (enableLoadingState) {
      if (loading) {
        return (
          <Skeleton
            variant="circular"
            sx={{
              width: size,
              height: size,
              ...sx,
            }}
          />
        );
      }

      if (errorMessage) {
        return (
          <ErrorSkeleton
            variant="circular"
            sx={{
              width: size,
              height: size,
              ...sx,
            }}
          />
        );
      }
    }

    return (
      <Avatar
        {...rest}
        className={clsx(classes.root)}
        ref={ref}
        sx={{
          fontSize: Math.round(size / 2.5),
          ...(() => {
            if (!rest.src) {
              return { bgcolor, color };
            }
          })(),
          width: size,
          height: size,
          ...sx,
        }}
      >
        {(() => {
          if (label) {
            return (() => {
              const { name } = parseNameAndEmailAddressCombination(label);
              const labelWords = name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\-_\s]/g, '')
                .split(/\s+/g);
              if (labelWords.length > 1) {
                return (
                  labelWords[0].charAt(0) +
                  labelWords[labelWords.length - 1].charAt(0)
                );
              }
              return labelWords[0].charAt(0);
            })().toUpperCase();
          }
          return children;
        })()}
      </Avatar>
    );
  }
);

export default ProfileAvatar;
