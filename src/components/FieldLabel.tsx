import Typography, { TypographyProps } from '@mui/material/Typography';
import { FC } from 'react';

export interface IFieldLabelProps extends TypographyProps {}

export const FieldLabel: FC<IFieldLabelProps> = ({ children, sx, ...rest }) => {
  return (
    <Typography
      variant="body2"
      noWrap
      {...rest}
      sx={{ fontWeight: 'bold', ...sx }}
    >
      {children}
    </Typography>
  );
};

export default FieldLabel;
