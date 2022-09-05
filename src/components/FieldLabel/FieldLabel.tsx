import { useTheme } from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { FC } from 'react';

export interface IFieldLabelProps extends TypographyProps {
  required?: boolean;
}

export const FieldLabel: FC<IFieldLabelProps> = ({
  required,
  children,
  sx,
  ...rest
}) => {
  const { palette } = useTheme();
  return (
    <Typography
      variant="body2"
      noWrap
      {...rest}
      sx={{
        fontWeight: 'bold',
        ...(() => {
          if (required) {
            return {
              '&:after': {
                content: '"*"',
                ml: 0.2,
                color: palette.error.main,
              },
            };
          }
        })(),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default FieldLabel;
