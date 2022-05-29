import { ComponentMeta, ComponentStory } from '@storybook/react';

import CloseButton from '../components/CloseButton';

export default {
  title: 'Components/Close Button',
  component: CloseButton,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof CloseButton>;

const Template: ComponentStory<typeof CloseButton> = (props) => (
  <CloseButton {...props} />
);

export const Default = Template.bind({});
