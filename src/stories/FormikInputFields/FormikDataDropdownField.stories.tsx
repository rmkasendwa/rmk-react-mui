import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import React from 'react';
import * as Yup from 'yup';
import { FormikDataDropdownField } from '../../components/FormikInputFields/FormikDataDropdownField';

export default {
  title: 'Components/Formik Input Fields/Formik Data Dropdown Field',
  component: FormikDataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikDataDropdownField>;

const validationSchema = Yup.object({
  field: Yup.string().required('This field is required'),
});

const initialValues = {
  field: '',
};

const Template: StoryFn<typeof FormikDataDropdownField> = (props) => {
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={async (values) => {
        console.log({ values });
      }}
    >
      {() => {
        return (
          <Form noValidate>
            <FormikDataDropdownField
              label="Formik Data Dropdown Field"
              name="field"
              {...props}
              sx={{ minWidth: 300 }}
              options={[
                {
                  label: 'Option 1',
                  value: 'OPTION_ONE',
                },
                {
                  label: 'Option 2',
                  value: 'OPTION_TWO',
                },
              ]}
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
