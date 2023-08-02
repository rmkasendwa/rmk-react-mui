import { Meta, StoryFn } from '@storybook/react';
import React, { FC } from 'react';

import LoadingTypography, {
  LoadingTypographyProps,
} from '../components/LoadingTypography';
import { LoadingProvider } from '../contexts/LoadingContext';

export interface LoadingTypographyStoryProps extends LoadingTypographyProps {
  storyType?: 'Default' | 'With Loading State';
}

export default {
  title: 'Components/Loading Typography',
  component: LoadingTypography,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof LoadingTypography>;

const Template: StoryFn<FC<LoadingTypographyStoryProps>> = ({
  storyType = 'With Loading State',
  ...props
}) => {
  if (storyType === 'Default') {
    return <LoadingTypography variant="body2" {...props} />;
  }
  return (
    <LoadingProvider
      value={{
        loading: true,
      }}
    >
      <LoadingTypography variant="body2" {...props} />
    </LoadingProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  children: 'This is some loading typography',
} as LoadingTypographyProps;

export const WithShortText = Template.bind({});
WithShortText.args = {
  children: 'Short text',
} as LoadingTypographyProps;

export const WithLongText = Template.bind({});
WithLongText.args = {
  children: `
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis dolore
    perspiciatis quos cupiditate aliquam ratione iste eligendi, temporibus
    adipisci iure voluptate quam accusantium incidunt ipsa id mollitia
    similique. Obcaecati eligendi ut officia exercitationem doloribus, maiores
    fugit earum asperiores temporibus est. Ipsam similique architecto aperiam
    maiores hic dolore accusantium cumque perspiciatis officiis aut quidem,
    laborum sit fugiat eligendi autem suscipit, dolorum, velit dicta esse sint
    facere repellendus magni. Quis optio voluptatum repudiandae quae
    necessitatibus impedit nam ab itaque ullam. Illum in mollitia voluptate
    numquam corrupti voluptas reiciendis culpa voluptatibus neque, quidem
    soluta maiores eaque quo beatae nihil id, adipisci non nesciunt vel
    laudantium? Iure culpa repudiandae ad praesentium. Eaque saepe eveniet,
    quas impedit quod nam sed laudantium nesciunt sit molestias ipsa eligendi
    consequatur vero quasi odio natus alias quia ea ex! Vitae esse quisquam
    exercitationem atque voluptas. Totam soluta possimus corporis, aliquam
    doloribus fugit repudiandae iusto beatae exercitationem atque ut
    consectetur placeat vero ab minus ex a vel nam cupiditate quidem modi iste
    culpa porro. In, officiis fuga, optio cumque impedit expedita atque totam
    nobis dolorum voluptatibus maiores, laborum magnam. Ut obcaecati quos
    pariatur nulla, fugit labore hic at optio ab, minima excepturi iusto.
    Voluptates voluptatum aut hic at impedit dignissimos.
  `,
} as LoadingTypographyProps;

export const WithShortTextAndNoWrap = Template.bind({});
WithShortTextAndNoWrap.args = {
  storyType: 'Default',
  children: 'Short text',
  noWrap: true,
  align: 'center',
  sx: {
    width: 200,
  },
} as LoadingTypographyStoryProps;

export const WithLongTextAndNoWrap = Template.bind({});
WithLongTextAndNoWrap.args = {
  storyType: 'Default',
  children: `
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis dolore
    perspiciatis quos cupiditate aliquam ratione iste eligendi, temporibus
    adipisci iure voluptate quam accusantium incidunt ipsa id mollitia
    similique. Obcaecati eligendi ut officia exercitationem doloribus, maiores
    fugit earum asperiores temporibus est. Ipsam similique architecto aperiam
    maiores hic dolore accusantium cumque perspiciatis officiis aut quidem,
    laborum sit fugiat eligendi autem suscipit, dolorum, velit dicta esse sint
    facere repellendus magni. Quis optio voluptatum repudiandae quae
    necessitatibus impedit nam ab itaque ullam. Illum in mollitia voluptate
    numquam corrupti voluptas reiciendis culpa voluptatibus neque, quidem
    soluta maiores eaque quo beatae nihil id, adipisci non nesciunt vel
    laudantium? Iure culpa repudiandae ad praesentium. Eaque saepe eveniet,
    quas impedit quod nam sed laudantium nesciunt sit molestias ipsa eligendi
    consequatur vero quasi odio natus alias quia ea ex! Vitae esse quisquam
    exercitationem atque voluptas. Totam soluta possimus corporis, aliquam
    doloribus fugit repudiandae iusto beatae exercitationem atque ut
    consectetur placeat vero ab minus ex a vel nam cupiditate quidem modi iste
    culpa porro. In, officiis fuga, optio cumque impedit expedita atque totam
    nobis dolorum voluptatibus maiores, laborum magnam. Ut obcaecati quos
    pariatur nulla, fugit labore hic at optio ab, minima excepturi iusto.
    Voluptates voluptatum aut hic at impedit dignissimos.
  `,
  noWrap: true,
  sx: {
    width: 200,
  },
} as LoadingTypographyStoryProps;
