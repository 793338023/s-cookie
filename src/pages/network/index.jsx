import React, { useState } from 'react';
import useNetwork from './useNetwork';
import Edit from './edit';
import { List, Drawer, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import style from './style.module.scss';

const Index = () => {
  const { list, handleList } = useNetwork();

  const [record, setRecord] = useState();

  function onClose() {
    setRecord(null);
  }

  return (
    <>
      <List
        bordered
        dataSource={list}
        renderItem={(d) => (
          <List.Item>
            <div className={style.itemWrapper}>
              <div>
                <Switch
                  checked={d.checked}
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={(checked) => {
                    handleList(d, { checked });
                  }}
                />
              </div>
              <div
                className={style.listItem}
                onClick={() => {
                  setRecord(d);
                }}
              >
                {d.url}
              </div>
            </div>
          </List.Item>
        )}
      />
      <Drawer
        destroyOnClose
        title={record?.url}
        placement="right"
        width="80%"
        onClose={onClose}
        open={!!record}
        bodyStyle={{ padding: 0 }}
      >
        <Edit data={record} />
      </Drawer>
    </>
  );
};

export default Index;
