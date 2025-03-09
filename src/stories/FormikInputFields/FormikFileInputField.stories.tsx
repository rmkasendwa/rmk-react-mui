import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikFileInputField } from '../../components/FormikInputFields/FormikFileInputField';
import React from 'react';

export default {
  title: 'Components/Formik Input Fields/Formik File Input Field',
  component: FormikFileInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikFileInputField>;

const initialValues = {
  field: null,
};

const Template: StoryFn<typeof FormikFileInputField> = (props) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        console.log({ values });
      }}
    >
      {() => {
        return (
          <Form noValidate>
            <Grid container sx={{ alignItems: 'center', columnGap: 1 }}>
              <Grid item>
                <FormikFileInputField
                  label="Formik File Input Field"
                  name="field"
                  {...props}
                  sx={{ minWidth: 300 }}
                />
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
