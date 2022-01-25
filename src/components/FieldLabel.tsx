import { Typography, TypographyProps, alpha, useTheme } from '@mui/material';
import { FC } from 'react';

export interface IFieldLabelProps extends TypographyProps {}

export const FieldLabel: FC<IFieldLabelProps> = ({ children, sx, ...rest }) => {
  const theme = useTheme();
  return (
    <Typography
      variant="body2"
      {...rest}
      sx={{ color: alpha(theme.palette.text.primary, 0.5), ...sx }}
    >
      {children}
    </Typography>
  );
};

export default FieldLabel;
