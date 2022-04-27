import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikCurrencyInputField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Currency Input Field',
  component: FormikCurrencyInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikCurrencyInputField>;

const initialValues = {
  field: 4800,
};

const Template: ComponentStory<typeof FormikCurrencyInputField> = (props) => {
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
            <FormikCurrencyInputField
              label="Formik Currency Input Field"
              name="field"
              {...props}
              showCurrency
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
