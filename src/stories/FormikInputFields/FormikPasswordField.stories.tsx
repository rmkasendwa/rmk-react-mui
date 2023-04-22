import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPasswordField } from '../../components/FormikInputFields/FormikPasswordField';

export default {
  title: 'Components/Formik Input Fields/Formik Password Field',
  component: FormikPasswordField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikPasswordField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: StoryFn<typeof FormikPasswordField> = (props) => {
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
            <FormikPasswordField
              label="Formik Password Field"
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
