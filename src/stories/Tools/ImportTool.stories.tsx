import { Button } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import { omit } from 'lodash';
import React from 'react';

import { ImportToolOptions, useImportTool } from '../../hooks/Tools/ImportTool';

export default {
  title: 'Hooks/Tools/Import Tool',
  component: Button,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof useImportTool>;

const Template: StoryFn<typeof useImportTool> = ({ ...rest }) => {
  const { label, icon, popupElement, ...toolPropsRest } = useImportTool({
    importFields: [
      {
        value: 'firstName',
        label: 'First Name',
      },
      {
        value: 'lastName',
        label: 'Last Name',
      },
      {
        value: 'phoneNumber',
        label: 'Phone Number',
      },
    ],
    recordsImporter: async (records) => {
      console.log({ records });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(records);
        }, 5000);
      });
    },
    ...rest,
  });
  return (
    <>
      <Button startIcon={icon} {...omit(toolPropsRest, 'title', 'type')}>
        {label}
      </Button>
      {popupElement}
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  recordLabelPlural: 'Contacts',
} as ImportToolOptions;
