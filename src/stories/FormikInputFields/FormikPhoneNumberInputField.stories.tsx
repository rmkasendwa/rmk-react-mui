import { Meta, StoryFn } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPhoneNumberInputField } from '../../components/FormikInputFields/FormikPhoneNumberInputField';

export default {
  title: 'Components/Formik Input Fields/Formik Phone Number Input Field',
  component: FormikPhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FormikPhoneNumberInputField>;

const initialValues = {
  field: '',
};

const Template: StoryFn<typeof FormikPhoneNumberInputField> = (props) => {
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
            <FormikPhoneNumberInputField
              label="Formik Phone Number Input Field"
              name="field"
              {...props}
              displayPhoneNumberCountry
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
