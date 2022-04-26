import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikNumberInputField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Number Input Field',
  component: FormikNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikNumberInputField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: ComponentStory<typeof FormikNumberInputField> = (props) => {
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
            <FormikNumberInputField
              label="Formik Number Input Field"
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
