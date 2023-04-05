import EditIcon from '@mui/icons-material/Edit';
import { FC, forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
        ...((): NonNullable<typeof tools> => {
          if (pathToEdit) {
            return [
              {
                type: 'icon-button',
                icon: <EditIcon />,
                label: 'Edit',
                LinkComponent: forwardRef<HTMLAnchorElement, any>(
                  function ParentLink(linkProps, ref) {
                    return (
                      <RouterLink ref={ref} to={pathToEdit} {...linkProps} />
                    );
                  }
                ),
              },
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
