import { Chip, ChipProps, darken, useTheme } from '@mui/material';
import { FC } from 'react';

export interface IEnumValueChipProps extends ChipProps {
  label?: string;
  value: string;
  colors: Record<string, { bgcolor: string; fgcolor: string }>;
}

export const EnumValueChip: FC<IEnumValueChipProps> = ({
  value,
  label,
  colors,
  sx,
  ...rest
}) => {
  label || (label = value);
  const { palette } = useTheme();

  let { bgcolor, fgcolor } = (() => {
    if (colors[value]) {
      return colors[value];
    }
    return {
      bgcolor: palette.error.main,
      fgcolor: palette.getContrastText(palette.error.main),
    };
  })();

  if (palette.mode === 'dark') {
    bgcolor = darken(bgcolor, 0.15);
    fgcolor = darken(fgcolor, 0.1);
  }

  return (
    <Chip
      label={label}
      size="small"
      {...rest}
      sx={{
        ...sx,
        color: fgcolor,
        bgcolor,
      }}
    />
  );
};

export default EnumValueChip;
