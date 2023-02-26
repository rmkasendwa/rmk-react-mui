import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from './FixedHeaderContentArea';

export interface EntityViewWrapperProps extends FixedHeaderContentAreaProps {
  pathToEdit?: string;
}

export const EntityViewWrapper: FC<EntityViewWrapperProps> = ({
  children,
  pathToEdit,
  tools = [],
  ...rest
}) => {
  return (
    <FixedHeaderContentArea
      {...rest}
      tools={[
        ...(() => {
          if (pathToEdit) {
            return [
              <Button
                key="editButton"
                color="primary"
                variant="contained"
                size="small"
                startIcon={<EditIcon />}
                component={Link}
                to={pathToEdit}
              >
                Edit
              </Button>,
            ];
          }
          return [];
        })(),
        ...tools,
      ]}
    >
      {children}
    </FixedHeaderContentArea>
  );
};

export default EntityViewWrapper;
