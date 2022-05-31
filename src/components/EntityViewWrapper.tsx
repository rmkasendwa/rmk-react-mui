import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';

export interface IEntityViewWrapperProps extends IPaddedContentAreaProps {
  pathToEdit?: string;
  tools?: ReactNode;
}

export const EntityViewWrapper: FC<IEntityViewWrapperProps> = ({
  children,
  title,
  pathToEdit,
  tools,
  breadcrumbs,
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
    <PaddedContentArea tools={toolsList} {...{ title, breadcrumbs }}>
      {children}
    </PaddedContentArea>
  );
};

export default EntityViewWrapper;
