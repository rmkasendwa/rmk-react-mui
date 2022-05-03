import { Chip, ChipProps, useTheme } from '@mui/material';
import { FC } from 'react';

export interface IEnumValueChipProps extends ChipProps {
  label?: string;
  value: string;
  colors: Record<string, string>;
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

  const { bgcolor, color } = (() => {
    if (colors[value]) {
      return {
        bgcolor: colors[value],
        color: palette.getContrastText(colors[value]),
      };
    }
    return {
      bgcolor: palette.error.main,
      color: palette.getContrastText(palette.error.main),
    };
  })();

  return (
    <Chip
      label={label}
      size="small"
      {...rest}
      sx={{
        ...sx,
        color,
        bgcolor,
      }}
    />
  );
};

export default EnumValueChip;
