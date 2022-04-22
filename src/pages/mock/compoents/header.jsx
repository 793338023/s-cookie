import React from 'react';
import { Input, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useChange from '../useChange';
import style from '../style.module.scss';

const Header = () => {
  const { data, handleSearch, handleSwitch } = useChange('header');

  return (
    <div className={style.header}>
      <div />
      <div>
        <Input
          suffix={<SearchOutlined />}
          value={data.search}
          onChange={(e) => {
            const val = e.target.value.trim();
            handleSearch(val);
          }}
        />
      </div>
      <div>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={data.switch}
          onChange={(checked) => {
            handleSwitch(checked);
          }}
        />
      </div>
    </div>
  );
};

export default Header;
