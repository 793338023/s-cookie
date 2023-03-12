import React from 'react';
import { CommandBar } from '@fluentui/react';


export const ToolBar = ({
  onPrettifyClick,
  onSaveClick,
  onSyncClick,
}) => {
  const leftItems = [
    {
      key: 'sync',
      text: '同步',
      iconProps: { iconName: 'Code' },
      onClick: onSyncClick,
    },
    {
      key: 'prettify',
      text: '美化',
      iconProps: { iconName: 'Code' },
      onClick: onPrettifyClick,
    },
    {
      key: 'save',
      text: '保存',
      iconProps: { iconName: 'Code' },
      onClick: onSaveClick,
    },
  ];

  return (
    <CommandBar
      items={leftItems}
      ariaLabel="json content commands"
    />
  );
};
