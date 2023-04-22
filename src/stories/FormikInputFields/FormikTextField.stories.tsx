import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikTextField } from '../../components/FormikInputFields/FormikTextField';

export default {
  title: 'Components/Formik Input Fields/Formik Text Field',
  component: FormikTextField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikTextField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: StoryFn<typeof FormikTextField> = (props) => {
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
            <FormikTextField
              label="Formik Text Field"
              name="field"
              {...props}
              sx={{ minWidth: 300 }}
            />
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
