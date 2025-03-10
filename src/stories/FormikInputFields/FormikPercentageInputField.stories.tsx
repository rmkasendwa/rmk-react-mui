import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPercentageInputField } from '../../components/FormikInputFields/FormikPercentageInputField';
import React from 'react';

export default {
  title: 'Components/Formik Input Fields/Formik Percentage Input Field',
  component: FormikPercentageInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikPercentageInputField>;

const initialValues = {
  field: 45,
};

const Template: StoryFn<typeof FormikPercentageInputField> = (props) => {
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
                <FormikPercentageInputField
                  label="Formik Percentage Input Field"
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
