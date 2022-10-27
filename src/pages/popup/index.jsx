/* eslint-disable no-undef */

import React, { useState, useEffect } from 'react';
import { Input, Button, Table, message } from 'antd';
import { getAll, setCookies, setStorage, getStorage } from './utils';
import style from './style.module.scss';

const Popup = () => {
  const [host, setHost] = useState('');
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    async function init() {
      const initVal = await getStorage();
      setData(initVal.data ?? []);
      setSelectedRowKeys(initVal.selected ?? []);
    }
    init();
  }, []);

  const handleDel = async (record) => {
    const curr = [...data];
    const index = curr.findIndex((d) => d.key === record.key);
    if (index > -1) {
      curr.splice(index, 1);
      setData(curr);
      await setStorage({ data: curr });
    }
  };

  const columns = [
    {
      title: '序号',
      width: 100,
      render: (_, _r, i) => {
        return i + 1;
      },
    },
    {
      title: '地址',
      dataIndex: 'host',
      width: 200,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Button danger type="link" onClick={() => handleDel(record)}>
          删除
        </Button>
      ),
    },
  ];

  const onSelectChange = async (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
    await setStorage({ selected: selectedRowKeys });
  };

  async function handleSave() {
    if (!host) {
      message.error('请填写');
      return;
    }
    if (data.find((d) => d.key === host)) {
      message.error('已存在');
      setHost('');
      return;
    }
    const curr = [...data, { key: host, host }];
    setData(curr);
    setHost('');
    await setStorage({ data: curr });
  }

  async function handleSynchronize() {
    const [selectedRowKey] = selectedRowKeys;
    const selectedRow = data.find((d) => d.host === selectedRowKey);
    if (selectedRow) {
      const cookies = await getAll(selectedRow.host);
      await setCookies(cookies);
      message.success('cookie同步成功');
      window.close();
    } else {
      message.warn('请选择');
    }
  }

  const rowSelection = {
    selectedRowKeys,
    type: 'radio',
    onChange: onSelectChange,
  };

  return (
    <div className={style.popup}>
      <div className={style.iptWrap}>
        <Input
          value={host}
          onChange={(e) => {
            setHost(e.target.value);
          }}
          onBlur={(e) => {
            const match = e.target.value.match(/(https?:\/\/)?([^/]+)\/?/i);
            if (match && typeof match[2] === 'string') {
              const val = match[2].trim();
              setHost(val);
            } else {
              setHost('');
            }
          }}
        />
        <Button onClick={handleSave}>保存</Button>
      </div>
      <Table
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick() {
            onSelectChange([record.key]);
          },
        })}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 300 }}
      />
      <div className={style.btn}>
        <div>
          <Button
            type="primary"
            onClick={() => {
              chrome.tabs.create(
                {
                  url: 'index.html#/mock',
                  active: true,
                },
                () => {},
              );
            }}
          >
            mock
          </Button>
        </div>
        <div>
          <Button type="primary" onClick={handleSynchronize}>
            同步
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
