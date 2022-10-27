import { Tooltip } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import useTheme from '@mui/material/styles/useTheme';
import { FC } from 'react';

export interface EnumValueChipProps extends ChipProps {
  label?: string;
  value: string;
  colors: Record<string, string>;
}

export const EnumValueChip: FC<EnumValueChipProps> = ({
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
      bgcolor: palette.divider,
      color: palette.getContrastText(palette.divider),
    };
  })();

  return (
    <Tooltip title={label}>
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
    </Tooltip>
  );
};

export default EnumValueChip;
