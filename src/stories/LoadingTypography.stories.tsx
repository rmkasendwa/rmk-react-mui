import { ComponentMeta, ComponentStory } from '@storybook/react';

import LoadingTypography from '../components/LoadingTypography';
import { LoadingProvider } from '../contexts/LoadingContext';

export default {
  title: 'Components/Loading Typography',
  component: LoadingTypography,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof LoadingTypography>;

const Template: ComponentStory<typeof LoadingTypography> = (props) => {
  return (
    <>
      <LoadingProvider
        value={{
          loading: false,
        }}
      >
        <LoadingTypography variant="body2" {...props}>
          This is some loading typography
        </LoadingTypography>
      </LoadingProvider>
      <LoadingProvider
        value={{
          loading: true,
        }}
      >
        <LoadingTypography variant="body2" {...props}>
          This is some loading typography
        </LoadingTypography>
      </LoadingProvider>
      <LoadingProvider
        value={{
          loading: false,
        }}
      >
        <LoadingTypography {...props}>Short text</LoadingTypography>
      </LoadingProvider>
      <LoadingProvider
        value={{
          loading: true,
        }}
      >
        <LoadingTypography {...props}>Short text</LoadingTypography>
      </LoadingProvider>
    </>
  );
};

export const Default = Template.bind({});
