import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Meta, StoryFn } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React, { useMemo, useState } from 'react';

import InfiniteScrollBox from '../components/InfiniteScrollBox';

export default {
  title: 'Components/Infinite Scroll Box',
  component: InfiniteScrollBox,
} as Meta<typeof InfiniteScrollBox>;

const lorem = new LoremIpsum();

const DefaultTemplate: StoryFn<typeof InfiniteScrollBox> = ({
  sx,
  ...rest
}) => {
  const defaultElements = useMemo(() => {
    return Array.from({ length: 1000 }).map((_, index) => {
      const label = `${index + 1}. ${lorem.generateWords(4)}`;
      return (
        <Button
          key={index}
          color="inherit"
          fullWidth
          sx={{
            p: 0,
            justifyContent: 'start',
          }}
        >
          <Typography
            noWrap
            sx={{
              lineHeight: '50px',
              px: 3,
            }}
          >
            {label}
          </Typography>
        </Button>
      );
    });
  }, []);

  const [elements, setElements] = useState(() => {
    return defaultElements.splice(0, 100);
  });

  return (
    <InfiniteScrollBox
      {...rest}
      load={() => {
        setElements((prevElements) => {
          return [...prevElements, ...defaultElements.splice(0, 100)];
        });
      }}
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        ...sx,
      }}
    >
      {elements}
    </InfiniteScrollBox>
  );
};

const PaginTemplate: StoryFn<typeof InfiniteScrollBox> = ({ sx, ...rest }) => {
  const dataSet = useMemo(() => {
    return Array.from({ length: 1000 }).map((_, index) => {
      const label = `${index + 1}. ${lorem.generateWords(4)}`;
      return { label, index };
    });
  }, []);

  const [elements, setElements] = useState(() => {
    return dataSet.splice(0, 100);
  });

  const [focusedElementIndex, setFocusedElementIndex] = useState(0);

  return (
    <InfiniteScrollBox
      {...rest}
      {...{ focusedElementIndex }}
      load={() => {
        setElements((prevElements) => {
          return [...prevElements, ...dataSet.splice(0, 100)];
        });
      }}
      dataElements={elements.map(({ label, index }) => {
        const isFocused = focusedElementIndex === index;
        return (
          <Button
            key={index}
            color={isFocused ? 'primary' : 'inherit'}
            variant={isFocused ? 'contained' : 'text'}
            fullWidth
            sx={{
              p: 0,
              justifyContent: 'start',
            }}
          >
            <Typography
              noWrap
              sx={{
                lineHeight: '50px',
                px: 3,
              }}
            >
              {label}
            </Typography>
          </Button>
        );
      })}
      paging
      dataElementLength={50}
      onChangeFocusedDataElement={(index) => {
        setFocusedElementIndex(index);
      }}
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        ...sx,
      }}
    />
  );
};

export const Default = DefaultTemplate.bind({});

export const WithPaging = PaginTemplate.bind({});
