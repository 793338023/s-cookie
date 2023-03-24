import React, { useState, useEffect } from 'react';
import { CommandBar } from '@fluentui/react';
import { getValueSchema, setMockValue } from '../../utils';

export const ToolBar = ({ id, onPrettifyClick, onSaveClick, onSyncClick, onOpen }) => {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
   async function init(){
      const item = await getValueSchema(id);
    setChecked(item?.checked);
    }
    init();
  }, []);

  async function onOpen() {
    setChecked(!checked);
    await setMockValue(id, { checked: !checked });
  }

  const leftItems = [
    {
      key: 'sync',
      text: '同步',
      iconProps: { iconName: 'Code' },
      onClick: onSyncClick,
    },
    {
      key: 'open',
      text: checked ? '关闭' : '开启',
      iconProps: { iconName: 'Code' },
      onClick: onOpen,
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

  return <CommandBar items={leftItems} ariaLabel="js content commands" />;
};
