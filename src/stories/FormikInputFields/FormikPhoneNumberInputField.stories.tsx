import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPhoneNumberInputField } from '../../components/FormikInputFields/FormikPhoneNumberInputField';

export default {
  title: 'Components/Formik Input Fields/Formik Phone Number Input Field',
  component: FormikPhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikPhoneNumberInputField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: ComponentStory<typeof FormikPhoneNumberInputField> = (
  props
) => {
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
              sx={{ minWidth: 500 }}
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
