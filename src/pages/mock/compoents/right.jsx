/* eslint-disable no-undef */
import React, { useState } from 'react';
import { List, Button, Checkbox, Input, Modal, message, Drawer } from 'antd';
import EditMock from '../../json';
import useChange from '../useChange';
import { formattedMock } from '../utils';
import style from '../style.module.scss';
import * as bg from "@/tools";

const Right = () => {
  const { data, handleAdd, handleSelectTop, handleDel, handleSelect, handleEditData, search, updateData } = useChange('right');
  const [url, setUrl] = useState('');
  const [record, setRecord] = useState(null);

  const onClose = () => {
    setRecord(null);
  }
  const onOpen = (d) => {
    setRecord(d);
  }

  function handleSave() {
    handleAdd(url);
    setUrl('');
  }

  const isAllChecked = data.length && !data.find((d) => !d.checked);

  const list = data.filter((d) => d.path.indexOf(search || '') > -1);

  async function handleSynchronization(record) {
    const mockList = await updateData();
    const curr = mockList?.find((d) => d.id === record.id);
    if (curr) {
      const text = curr.collectResponseText;
      if (!text) {
        Modal.error({ title: '没有可同步的数据' });
        return;
      }
      if (curr.responseText) {
        Modal.confirm({
          title: '是否覆盖现有数据?',
          onOk: async () => {
            curr.responseText = formattedMock(text);
            await bg?.setValue({ mockright: mockList });
          },
          onCancel() { },
        });
      } else {
        curr.responseText = formattedMock(text);
        await bg?.setValue({ mockright: mockList });
        message.success('同步成功');
      }
    }
  }

  async function handleOpenMock(ev, record) {
    ev.stopPropagation();
    const item = await handleEditData(record);
    onOpen(item);
  }

  return (
    <>
      <div className={style.right}>
        <div>
          <div className={style.iptWrap}>
            <Input
              placeholder="请输入mock接口，支持正则"
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
                    {
                      record.isNonSoapi ? null : (
                        <Checkbox
                          checked={record.mockChecked}
                          onChange={() => {
                            handleSelect(!record.mockChecked, record, true);
                          }}
                        />
                      )
                    }
                    <Button
                      type="link"
                      onClick={(ev) => {
                        handleOpenMock(ev, record);
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
                      handleSynchronization(record);
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
                <div
                  className={style.listItem}
                  onClick={(ev) => {
                    handleOpenMock(ev, record);
                  }}
                >
                  {record.path}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
      <Drawer
        destroyOnClose
        title={record?.path}
        placement="right"
        width="80%"
        onClose={onClose}
        open={!!record}
        bodyStyle={{ padding: 0 }}
      >
        <EditMock id={record?.id} />
      </Drawer>
    </>
  );
};

export default Right;
