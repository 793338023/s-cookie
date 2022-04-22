import React, { useState } from 'react';
import { List, Button, Checkbox, Input } from 'antd';
import useChange from '../useChange';
import style from '../style.module.scss';

const Left = () => {
  const { data, handleAdd, handleDel, handleSelect } = useChange('left');
  const [url, setUrl] = useState('');

  function handleSave() {
    handleAdd(url);
    setUrl('');
  }

  const isAllChecked = data.length && !data.find((d) => !d.checked);

  return (
    <div className={style.left}>
      <div>
        <div className={style.iptWrap}>
          <Input
            value={url}
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
              <div>{record.path}</div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Left;
