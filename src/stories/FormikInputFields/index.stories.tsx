import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import * as Yup from 'yup';

import FormikForm from '../../components/FormikForm';
import FormikCurrencyInputField from '../../components/FormikInputFields/FormikCurrencyInputField';
import FormikNumberInputField from '../../components/FormikInputFields/FormikNumberInputField';

export default {
  title: 'Components/Formik Input Fields',
  component: FormikNumberInputField,
} as ComponentMeta<typeof FormikNumberInputField>;

const validationSchema = Yup.object({
  number: Yup.number().required('Please provide the number'),
  currency: Yup.number().required('Please provide the currency'),
});

const initialValues = {
  number: undefined,
  currency: undefined,
};

const Template: ComponentStory<typeof FormikNumberInputField> = (props) => {
  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Typography>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam nobis
        reprehenderit adipisci officia consequuntur dicta sapiente porro quod,
        voluptate exercitationem veniam suscipit soluta eligendi molestias
        cumque! Corrupti ut voluptatem impedit quaerat illum nulla dolores
        pariatur facere? Laudantium rem ipsa magni dicta aliquam, dolor eos
        aperiam cum nemo! Deserunt ad aspernatur exercitationem pariatur
        accusamus sunt, omnis est perspiciatis minus ut recusandae laborum,
        porro harum, ipsa error dolorum totam quo quam itaque hic provident. Nam
        non placeat fugiat mollitia tempora esse beatae laboriosam odit commodi,
        iusto unde et maiores sequi itaque, laborum harum perspiciatis velit
        dolores. Voluptate dolorem non modi, nesciunt totam, excepturi
        voluptates labore beatae voluptas ducimus laborum soluta sequi quasi
        repellendus quam, tenetur doloribus fugiat mollitia eligendi recusandae
        provident optio nisi iusto est. Sequi, expedita ut. Autem, atque sint
        inventore saepe eius ea quo, soluta magnam eos voluptas unde? Molestias
        sapiente est expedita dolor itaque eligendi vero accusantium? Excepturi
        atque magnam, ex fugiat deserunt quasi minus laborum ad libero fugit,
        dignissimos aliquid eos distinctio quia aut cum earum sit expedita odit
        at nemo illum accusamus. Incidunt fugit earum explicabo temporibus
        cumque molestiae aliquid rem? Soluta adipisci ad voluptatibus sint, enim
        eius temporibus? Repellat iste molestiae, voluptas laborum consequatur
        labore excepturi.
      </Typography>
      <FormikForm
        {...{ initialValues, validationSchema }}
        onSubmit={(values) => {
          console.log({ values });
        }}
      >
        <Box sx={{ my: 5 }}>
          <Grid container columnSpacing={3} sx={{ mb: 3 }}>
            <Grid item sm={6}>
              <FormikNumberInputField label="Number" name="number" {...props} />
            </Grid>
            <Grid item sm={6}>
              <FormikCurrencyInputField
                label="Currency"
                name="currency"
                {...props}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
          </Box>
        </Box>
      </FormikForm>
      <Typography>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam nobis
        reprehenderit adipisci officia consequuntur dicta sapiente porro quod,
        voluptate exercitationem veniam suscipit soluta eligendi molestias
        cumque! Corrupti ut voluptatem impedit quaerat illum nulla dolores
        pariatur facere? Laudantium rem ipsa magni dicta aliquam, dolor eos
        aperiam cum nemo! Deserunt ad aspernatur exercitationem pariatur
        accusamus sunt, omnis est perspiciatis minus ut recusandae laborum,
        porro harum, ipsa error dolorum totam quo quam itaque hic provident. Nam
        non placeat fugiat mollitia tempora esse beatae laboriosam odit commodi,
        iusto unde et maiores sequi itaque, laborum harum perspiciatis velit
        dolores. Voluptate dolorem non modi, nesciunt totam, excepturi
        voluptates labore beatae voluptas ducimus laborum soluta sequi quasi
        repellendus quam, tenetur doloribus fugiat mollitia eligendi recusandae
        provident optio nisi iusto est. Sequi, expedita ut. Autem, atque sint
        inventore saepe eius ea quo, soluta magnam eos voluptas unde? Molestias
        sapiente est expedita dolor itaque eligendi vero accusantium? Excepturi
        atque magnam, ex fugiat deserunt quasi minus laborum ad libero fugit,
        dignissimos aliquid eos distinctio quia aut cum earum sit expedita odit
        at nemo illum accusamus. Incidunt fugit earum explicabo temporibus
        cumque molestiae aliquid rem? Soluta adipisci ad voluptatibus sint, enim
        eius temporibus? Repellat iste molestiae, voluptas laborum consequatur
        labore excepturi.
      </Typography>
      <Typography>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam nobis
        reprehenderit adipisci officia consequuntur dicta sapiente porro quod,
        voluptate exercitationem veniam suscipit soluta eligendi molestias
        cumque! Corrupti ut voluptatem impedit quaerat illum nulla dolores
        pariatur facere? Laudantium rem ipsa magni dicta aliquam, dolor eos
        aperiam cum nemo! Deserunt ad aspernatur exercitationem pariatur
        accusamus sunt, omnis est perspiciatis minus ut recusandae laborum,
        porro harum, ipsa error dolorum totam quo quam itaque hic provident. Nam
        non placeat fugiat mollitia tempora esse beatae laboriosam odit commodi,
        iusto unde et maiores sequi itaque, laborum harum perspiciatis velit
        dolores. Voluptate dolorem non modi, nesciunt totam, excepturi
        voluptates labore beatae voluptas ducimus laborum soluta sequi quasi
        repellendus quam, tenetur doloribus fugiat mollitia eligendi recusandae
        provident optio nisi iusto est. Sequi, expedita ut. Autem, atque sint
        inventore saepe eius ea quo, soluta magnam eos voluptas unde? Molestias
        sapiente est expedita dolor itaque eligendi vero accusantium? Excepturi
        atque magnam, ex fugiat deserunt quasi minus laborum ad libero fugit,
        dignissimos aliquid eos distinctio quia aut cum earum sit expedita odit
        at nemo illum accusamus. Incidunt fugit earum explicabo temporibus
        cumque molestiae aliquid rem? Soluta adipisci ad voluptatibus sint, enim
        eius temporibus? Repellat iste molestiae, voluptas laborum consequatur
        labore excepturi.
      </Typography>
      <Typography>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam nobis
        reprehenderit adipisci officia consequuntur dicta sapiente porro quod,
        voluptate exercitationem veniam suscipit soluta eligendi molestias
        cumque! Corrupti ut voluptatem impedit quaerat illum nulla dolores
        pariatur facere? Laudantium rem ipsa magni dicta aliquam, dolor eos
        aperiam cum nemo! Deserunt ad aspernatur exercitationem pariatur
        accusamus sunt, omnis est perspiciatis minus ut recusandae laborum,
        porro harum, ipsa error dolorum totam quo quam itaque hic provident. Nam
        non placeat fugiat mollitia tempora esse beatae laboriosam odit commodi,
        iusto unde et maiores sequi itaque, laborum harum perspiciatis velit
        dolores. Voluptate dolorem non modi, nesciunt totam, excepturi
        voluptates labore beatae voluptas ducimus laborum soluta sequi quasi
        repellendus quam, tenetur doloribus fugiat mollitia eligendi recusandae
        provident optio nisi iusto est. Sequi, expedita ut. Autem, atque sint
        inventore saepe eius ea quo, soluta magnam eos voluptas unde? Molestias
        sapiente est expedita dolor itaque eligendi vero accusantium? Excepturi
        atque magnam, ex fugiat deserunt quasi minus laborum ad libero fugit,
        dignissimos aliquid eos distinctio quia aut cum earum sit expedita odit
        at nemo illum accusamus. Incidunt fugit earum explicabo temporibus
        cumque molestiae aliquid rem? Soluta adipisci ad voluptatibus sint, enim
        eius temporibus? Repellat iste molestiae, voluptas laborum consequatur
        labore excepturi.
      </Typography>
    </Container>
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
