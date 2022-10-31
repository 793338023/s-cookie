import React from 'react';

import { CommandBar, Text } from '@fluentui/react';

export const TitleBar = ({ title }) => {
  const items = [
    {
      key: title,
      text: title,
      onRender: () => (
        <Text variant="large" nowrap block>
          {title}
        </Text>
      ),
    },
  ];
  return (
    <CommandBar
      styles={{
        root: {
          alignItems: 'center',
        },
      }}
      ariaLabel="app title"
      items={items}
    />
  );
};
