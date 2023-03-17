/* eslint-disable no-undef */

import React, { useState, useEffect } from 'react';
import { Input, Button, Table, message, Checkbox } from 'antd';
import { getAll, setCookies, setStorage, getStorage, updateENVCookie } from './utils';
import style from './style.module.scss';

const Popup = () => {
  const [host, setHost] = useState('');
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [syncStorage, setSyncStorage] = useState(false);

  useEffect(() => {
    async function init() {
      const initVal = await getStorage();
      setData(initVal.data ?? []);
      setSelectedRowKeys(initVal.selected ?? []);
      setRefresh(initVal.refresh ?? false);
      setSyncStorage(initVal.isCollecStorage ?? false);
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

  const onSelectChange = async (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
    await setStorage({ selected: selectedRowKeys });
    await updateENVCookie();
  };

  async function handleSave(value) {
    let url = '';
    let host = '';
    const match = value.match(/((https?:\/\/)?([^/]+))\/?/i);
    if (match && typeof match[3] === 'string') {
      const val = match[3].trim();
      host = val;
      url = match[1]?.trim();
    }

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

  async function handleSynchronize(key) {
    const selectedRow = data.find((d) => d.host === key);
    if (selectedRow) {
      const cookies = await getAll(selectedRow.host);
      await setCookies({ cookies, host: selectedRow.host });
      message.success('cookie同步成功');
      window.close();
    } else {
      message.warn('请选择');
    }
  }

  async function handleOpen(key) {
    const selectedRow = data.find((d) => d.host === key);
    if (selectedRow) {
      const cookies = await getAll();
      await setCookies({ cookies }, selectedRow.host, selectedRow.url);
      window.close();
    }
  }

  async function handleRefresh(ev) {
    const checked = ev.target.checked;
    setRefresh(checked);
    await setStorage({ refresh: checked });
  }
  async function handleSyncStorage(ev) {
    const checked = ev.target.checked;
    setSyncStorage(checked);
    await setStorage({ isCollecStorage: checked });
  }

  const columns = [
    {
      title: '地址',
      dataIndex: 'host',
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
      with: 200,
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleOpen(record.key)}>
            打开
          </Button>
          <Button type="link" onClick={() => handleSynchronize(record.key)}>
            同步
          </Button>
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
        </>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    type: 'radio',
    onChange: onSelectChange,
  };

  return (
    <div className={style.popup}>
      <div className={style.iptWrap}>
        <Input.Search
          placeholder="请输入同步地址"
          value={host}
          onChange={(e) => {
            setHost(e.target.value);
          }}
          enterButton="保存"
          onSearch={handleSave}
        />
      </div>
      <div className={style.wrapper}>
        <div className={style.syncWrapper}>
          <div>自动同步：</div>
          <div>
            <Checkbox checked={refresh} onChange={handleRefresh}>
              cookie
            </Checkbox>
          </div>
          <div>
            <Checkbox checked={syncStorage} onChange={handleSyncStorage}>
              localStorage
            </Checkbox>
          </div>
        </div>
        <div>
          <Button
            type="link"
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
            className={style.sync}
            type="primary"
            onClick={() => {
              const [selectedRowKey] = selectedRowKeys;
              handleSynchronize(selectedRowKey);
            }}
          >
            同步
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
