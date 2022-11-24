/* eslint-disable no-undef */

import React, { useState, useEffect } from 'react';
import { Input, Button, Table, message, Switch } from 'antd';
import { getAll, setCookies, setStorage, getStorage, updateENVCookie } from './utils';
import style from './style.module.scss';

const Popup = () => {
  const [host, setHost] = useState('');
  const [url, setUrl] = useState('');
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    async function init() {
      const initVal = await getStorage();
      setData(initVal.data ?? []);
      setSelectedRowKeys(initVal.selected ?? []);
      setRefresh(initVal.refresh ?? false);
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
      title: '环境',
      dataIndex: 'env',
      width: 100,
      render: (_, record) => (
        <Input
          value={record?.env ?? ''}
          onChange={(e) => {
            const val = (e.target.value ?? '').trim();
            const curr = [...data];
            const index = curr.findIndex((d) => d.key === record.key);
            if (index > -1) {
              curr[index].env = val;
              setData(curr);
            }
          }}
          onBlur={async (e) => {
            await setStorage({ data });
            await updateENVCookie();
          }}
        />
      ),
    },
    {
      title: '操作',
      render: (text, record) => (
        <Button
          danger
          type="link"
          onClick={(ev) => {
            ev.stopPropagation();
            handleDel(record);
          }}
        >
          删除
        </Button>
      ),
    },
  ];

  const onSelectChange = async (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
    await setStorage({ selected: selectedRowKeys });
    await updateENVCookie();
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
    const curr = [...data, { key: host, host, url }];
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

  async function handleOpen() {
    const [selectedRowKey] = selectedRowKeys;
    const selectedRow = data.find((d) => d.host === selectedRowKey);
    if (selectedRow) {
      const cookies = await getAll();
      await setCookies(cookies, selectedRow.host, selectedRow.url);
      window.close();
    }
  }

  async function handleRefresh(checked) {
    setRefresh(checked);
    await setStorage({ refresh: checked });
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
            const match = e.target.value.match(/((https?:\/\/)?([^/]+))\/?/i);
            if (match && typeof match[3] === 'string') {
              const val = match[3].trim();
              setHost(val);
              setUrl(match[1]?.trim());
            } else {
              setHost('');
              setUrl('');
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
          <Button className={style.open} type="primary" onClick={handleOpen}>
            打开
          </Button>
          <Button
            className={style.open}
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
          <Switch checked={refresh} onChange={handleRefresh} />
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
