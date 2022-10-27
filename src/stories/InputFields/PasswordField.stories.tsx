import { Grid } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { FC, useCallback, useState } from 'react';

import PasswordField, {
  PasswordFieldProps,
} from '../../components/InputFields/PasswordField';

export default {
  title: 'Components/Input Fields/Password Field',
  component: PasswordField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PasswordField>;

const DoublePasswordField: FC<PasswordFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const onChangeShowPassword = useCallback(
    (showPassword: boolean) => setShowPassword(showPassword),
    []
  );

  return (
    <Grid container columnGap={2}>
      <Grid item>
        <PasswordField
          label="Password"
          {...props}
          {...{ showPassword, onChangeShowPassword }}
          sx={{ minWidth: 200 }}
        />
      </Grid>
      <Grid item>
        <PasswordField
          label="Repeat Password"
          {...props}
          {...{ showPassword, onChangeShowPassword }}
          sx={{ minWidth: 200 }}
        />
      </Grid>
    </Grid>
  );
};

const Template: ComponentStory<typeof PasswordField> = ({
  story,
  ...props
}: PasswordFieldProps & { story?: string }) => {
  if (story === 'VISIBILITY_TOGGLE') {
    return <DoublePasswordField {...props} />;
  }
  return <PasswordField label="Password" {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};

export const SynchronizedVisibilityToggle = Template.bind({});
SynchronizedVisibilityToggle.args = {
  required: true,
  story: 'VISIBILITY_TOGGLE',
};
