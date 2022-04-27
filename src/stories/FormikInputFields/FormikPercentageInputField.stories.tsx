import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPercentageInputField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Percentage Input Field',
  component: FormikPercentageInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikPercentageInputField>;

const initialValues = {
  field: 45,
};

const Template: ComponentStory<typeof FormikPercentageInputField> = (props) => {
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
            <FormikPercentageInputField
              label="Formik Percentage Input Field"
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
