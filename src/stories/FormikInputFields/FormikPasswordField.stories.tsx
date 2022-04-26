import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikPasswordField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Password Field',
  component: FormikPasswordField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikPasswordField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: ComponentStory<typeof FormikPasswordField> = (props) => {
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
