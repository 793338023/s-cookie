/* eslint-disable no-undef */
import { useContext, useEffect, useState } from "react";
import { message } from "antd";
import { v4 as uuid } from "uuid";
import Context from "./reducer";
import { getTab } from './utils';
import * as bg from "@/tools";

const isNetwork = !!chrome?.devtools?.panels;

export default () => {
  const id = 'left';
  const { state, dispatch } = useContext(Context);
  const data = state[id] || [];
  const storageId = "mockleft";

  const [host, setHost] = useState('');

  async function getCache() {
    const newData = await bg?.getValue(storageId);
    const curr = newData?.[storageId] ?? data;
    return curr;
  }

  useEffect(() => {
    async function init() {
      const data = await bg?.getValue(storageId);
      const curr = data?.[storageId] ?? [];
      if (isNetwork) {
        const currTab = await getTab();
        const item = curr.find(d => d.path === currTab.host);
        if (!item) {
          setHost(currTab.host);
        }
      }
      dispatch({ type: id, payload: curr });
    }
    init();
  }, []);

  async function handleAdd(path) {
    if (!path.trim()) {
      message.warn("请填写");
      return;
    }
    const curData = await getCache();
    const index = curData.findIndex((d) => d.path === path);

    if (index > -1) {
      message.warn("重复添加");
      return;
    }
    const item = { path, checked: false, id: uuid() };
    const newData = [item, ...curData];
    dispatch({ type: id, payload: newData });

    await bg?.setValue({ [storageId]: newData });
  }

  async function handleDel(record) {
    const newData = await getCache();
    const index = newData.findIndex((d) => d.path === record.path);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1);
      dispatch({ type: id, payload: newData });
      await bg?.setValue({ [storageId]: newData });
      if (item.id) {
        await bg?.removeValue(item.id);
      }
    }
  }

  async function handleSelect(checked, record, isMock = false) {
    const newData = await getCache();
    if (record) {
      const item = newData.find((d) => d.path === record.path);
      if (isMock) {
        item.mockChecked = checked;
      } else {
        item.checked = checked;
      }
    } else {
      if (!isMock) {
        newData.forEach((item) => {
          item.checked = checked;
        });
      }
    }
    dispatch({ type: id, payload: newData });
    await bg?.setValue({ [storageId]: newData });
  }

  return {
    data,
    host,
    handleAdd,
    handleDel,
    handleSelect,
    isNetwork
  };
};
