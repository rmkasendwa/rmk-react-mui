import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikTextField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Text Field',
  component: FormikTextField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikTextField>;

const initialValues = {
  field: 'Default Field Value',
};

const Template: ComponentStory<typeof FormikTextField> = (props) => {
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
