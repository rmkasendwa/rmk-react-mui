import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import FixedHeaderContentArea, {
  IFixedHeaderContentAreaProps,
} from './FixedHeaderContentArea';

export interface IEntityViewWrapperProps extends IFixedHeaderContentAreaProps {
  pathToEdit?: string;
  tools?: ReactNode;
}

export const EntityViewWrapper: FC<IEntityViewWrapperProps> = ({
  children,
  pathToEdit,
  tools,
  ...rest
}) => {
  const toolsList: ReactNode[] = [];
  pathToEdit &&
    toolsList.push(
      <Button
        color="primary"
        variant="contained"
        size="small"
        startIcon={<EditIcon />}
        component={Link}
        to={pathToEdit}
      >
        Edit
      </Button>
    );
  tools && toolsList.push(tools);
  return (
    <FixedHeaderContentArea {...rest} tools={toolsList}>
      {children}
    </FixedHeaderContentArea>
  );
};

export default EntityViewWrapper;
