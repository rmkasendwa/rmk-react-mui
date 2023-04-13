import { Grid } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import * as Yup from 'yup';

import Card from '../components/Card';
import FormikPhoneNumberInputField from '../components/FormikInputFields/FormikPhoneNumberInputField';
import FormikTextField from '../components/FormikInputFields/FormikTextField';
import FormWrapper, { FormWrapperProps } from '../components/FormWrapper';

export default {
  title: 'Components/Form Wrapper',
  component: FormWrapper,
} as ComponentMeta<typeof FormWrapper>;

const Template: ComponentStory<typeof FormWrapper> = (props) => {
  return <FormWrapper {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  title: 'Form Title',
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  },
  validationSchema: Yup.object({
    firstName: Yup.string().required('Please enter your first name'),
    lastName: Yup.string().required('Please enter your last name'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Please enter your email address'),
    phoneNumber: Yup.string()
      .phoneNumber()
      .required('Please enter your phone number'),
  }),
  children: (
    <Card title="Your details" variant="outlined">
      <Grid container rowSpacing={2} columnSpacing={3}>
        <Grid item sm={6} xs={12}>
          <FormikTextField name="firstName" label="First Name" required />
        </Grid>
        <Grid item sm={6} xs={12}>
          <FormikTextField name="lastName" label="Last Name" required />
        </Grid>
        <Grid item sm={6} xs={12}>
          <FormikTextField name="email" label="Email Address" required />
        </Grid>
        <Grid item sm={6} xs={12}>
          <FormikPhoneNumberInputField
            name="phoneNumber"
            label="Phone Number"
            required
          />
        </Grid>
      </Grid>
    </Card>
  ),
} as FormWrapperProps;
