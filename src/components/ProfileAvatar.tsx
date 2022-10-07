import { Avatar, AvatarProps } from '@mui/material';
import { forwardRef, useMemo } from 'react';

export type TDefaultAvatar =
  | 'standard'
  | 'hueShiftingInitials'
  | 'highContrastHueShiftingIntials';

export interface IProfileAvatarProps extends AvatarProps {
  label?: string;
  defaultAvatar?: TDefaultAvatar;
  size?: number;
}

export const ProfileAvatar = forwardRef<HTMLDivElement, IProfileAvatarProps>(
  function ProfileAvatar(
    { label, sx, size = 32, defaultAvatar = 'standard', children, ...rest },
    ref
  ) {
    const { bgcolor, color } = useMemo(() => {
      if (label) {
        if (
          (
            [
              'hueShiftingInitials',
              'highContrastHueShiftingIntials',
            ] as TDefaultAvatar[]
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

    return (
      <Avatar
        {...rest}
        ref={ref}
        sx={{
          fontSize: Math.round(size / 2.5),
          bgcolor,
          color,
          width: size,
          height: size,
          ...sx,
        }}
      >
        {(() => {
          if (label) {
            const labelWords = label.split(/\s+/g);
            if (labelWords.length > 1) {
              return (
                labelWords[0].charAt(0) +
                labelWords[labelWords.length - 1].charAt(0)
              );
            }
            return labelWords[0].charAt(0);
          }
          return children;
        })()}
      </Avatar>
    );
  }
);

export default ProfileAvatar;
