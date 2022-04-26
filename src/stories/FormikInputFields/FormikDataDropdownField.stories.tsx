import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import { FormikDataDropdownField } from '../../components';

export default {
  title: 'Components/Formik Input Fields/Formik Data Dropdown Field',
  component: FormikDataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FormikDataDropdownField>;

const initialValues = {
  field: 'OPTION_TWO',
};

const Template: ComponentStory<typeof FormikDataDropdownField> = (props) => {
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
