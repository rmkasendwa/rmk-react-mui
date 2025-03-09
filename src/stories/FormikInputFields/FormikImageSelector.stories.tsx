import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikImageSelector } from '../../components/FormikInputFields/FormikImageSelector';
import React from 'react';

export default {
  title: 'Components/Formik Input Fields/Formik Image Selector',
  component: FormikImageSelector,
} as Meta<typeof FormikImageSelector>;

const initialValues = {
  field: null,
};

const Template: StoryFn<typeof FormikImageSelector> = (props) => {
  return (
    <Container maxWidth="md" sx={{ p: 3 }}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          console.log({ values });
        }}
      >
        {() => {
          return (
            <Form noValidate>
              <FormikImageSelector name="field" {...props} />
              <Grid container sx={{ mt: 2 }}>
                <Grid item xs />
                <Grid item>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
};

export const Default = Template.bind({});
