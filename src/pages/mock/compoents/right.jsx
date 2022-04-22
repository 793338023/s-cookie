import React, { useState } from 'react';
import { List, Button, Checkbox, Input } from 'antd';
import useChange from '../useChange';
import style from '../style.module.scss';

const Right = () => {
  const { data, handleAdd, handleDel, handleSelect, search } = useChange('right');
  const [url, setUrl] = useState('');

  function handleSave() {
    handleAdd(url);
    setUrl('');
  }

  const isAllChecked = data.length && !data.find((d) => !d.checked);

  const list = data.filter((d) => d.path.indexOf(search || '') > -1);
  return (
    <div className={style.right}>
      <div>
        <div className={style.iptWrap}>
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              setUrl(val);
            }}
          />
          <Button onClick={handleSave}>保存</Button>
        </div>
        <div>
          <Checkbox
            checked={isAllChecked}
            onChange={() => {
              handleSelect(!isAllChecked);
            }}
          >
            全部
          </Checkbox>
        </div>
      </div>
      <div className={style.list}>
        <List
          itemLayout="horizontal"
          dataSource={list}
          renderItem={(record) => (
            <List.Item
              onClick={() => {
                handleSelect(!record.checked, record);
              }}
              actions={[
                <Button
                  danger
                  type="link"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDel(record);
                  }}
                >
                  删除
                </Button>,
              ]}
            >
              <Checkbox checked={record.checked} />
              <div>{record.path}</div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Right;
