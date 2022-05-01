import { Button } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { get } from '../api';

export default {
  title: 'API/API Adapter',
  component: Button,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (props) => {
  return (
    <Button
      variant="contained"
      {...props}
      onClick={() => {
        get('/test');
      }}
    >
      Hit API Endpoint
    </Button>
  );
};

export const Default = Template.bind({});
