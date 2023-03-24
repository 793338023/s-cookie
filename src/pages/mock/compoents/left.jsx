/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { List, Button, Checkbox, Input, Collapse } from 'antd';
import useChange from '../useLeftChange';
import style from '../style.module.scss';

const { Panel } = Collapse;

const Left = () => {
  const { data, host, handleAdd, handleDel, handleSelect } = useChange();
  const [url, setUrl] = useState('');

  function handleSave() {
    handleAdd(url);
    setUrl('');
  }

  useEffect(() => {
    setUrl(host);
  }, [host]);

  const isAllChecked = data.length && !data.find((d) => !d.checked);

  return (
    <div className={style.left}>
      <div>
        <div className={style.iptWrap}>
          <Input
            placeholder="请输入需要mock地址"
            value={url}
            allowClear
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            onBlur={(e) => {
              const match = e.target.value.match(/(https?:\/\/)?([^/]+)\/?/i);
              if (match && typeof match[2] === 'string') {
                const val = match[2].trim();
                setUrl(val);
              } else {
                setUrl('');
              }
            }}
          />
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
      <div className={style.list}>
        <Collapse defaultActiveKey="1">
          <Panel
            header={
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
            }
            key="1"
          >
            <List
              itemLayout="horizontal"
              dataSource={data}
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
                  <div className={style.listItem}>{record.path}</div>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default Left;
