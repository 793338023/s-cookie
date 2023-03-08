import React, { useState } from 'react';
import { List, Button, Checkbox, Input } from 'antd';
import useChange from '../useChange';
import style from '../style.module.scss';

const Right = () => {
  const { data, handleAdd, handleSelectTop, handleDel, handleSelect, handleEditData, search } = useChange('right');
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
            placeholder="请输入mock地址"
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
              actions={[
                <div>
                  <Checkbox
                    checked={record.mockChecked}
                    onChange={() => {
                      handleSelect(!record.mockChecked, record, true);
                    }}
                  />

                  <Button
                    type="link"
                    onClick={async (ev) => {
                      ev.stopPropagation();
                      const id = await handleEditData(record);
                      window.open(`#/json/${id}`);
                    }}
                  >
                    mock
                  </Button>
                </div>,
                <Button
                  danger
                  type="link"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    // handleTop(record);
                  }}
                >
                  🔄
                </Button>,
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
              <Checkbox
                checked={record.checked}
                onChange={() => {
                  handleSelectTop(record, !record.checked);
                }}
              />
              <div className={style.listItem}>{record.path}</div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Right;
