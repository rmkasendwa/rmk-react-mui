import '@infinite-debugger/rmk-js-extensions/String';

import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import CodeEditor, { CodeEditorProps } from '../components/CodeEditor';

export default {
  title: 'Components/Code Editor',
  component: CodeEditor,
} as Meta<typeof CodeEditor>;

const Template: StoryFn<typeof CodeEditor> = ({ sx, ...rest }) => {
  return (
    <CodeEditor
      {...rest}
      sx={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        ...sx,
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  language: 'typescript',
} as CodeEditorProps;

export const TypescriptEditor = Template.bind({});
TypescriptEditor.args = {
  language: 'typescript',
  defaultValue: `
    import * as React from 'react';
    import { StandardProps } from '..';
    import { TypographyProps } from '../Typography';
    
    export interface ListItemTextProps
      extends StandardProps<React.HTMLAttributes<HTMLDivElement>, ListItemTextClassKey> {
      disableTypography?: boolean;
      inset?: boolean;
      primary?: React.ReactNode;
      primaryTypographyProps?: Partial<TypographyProps>;
      secondary?: React.ReactNode;
      secondaryTypographyProps?: Partial<TypographyProps>;
    }
    
    export type ListItemTextClassKey =
      | 'root'
      | 'multiline'
      | 'dense'
      | 'inset'
      | 'primary'
      | 'secondary';
    
    declare const ListItemText: React.ComponentType<ListItemTextProps>;
    
    export default ListItemText;
  `.trimIndent(),
} as CodeEditorProps;
