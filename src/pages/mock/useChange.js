/* eslint-disable no-undef */
import { useContext, useEffect } from 'react';
import { message } from 'antd';
import { v4 as uuid } from 'uuid';
import Context from './reducer';

const bg = chrome?.extension?.getBackgroundPage();

export default (id) => {
  const { state, dispatch } = useContext(Context);
  const data = state[id] || [];
  const storageId = `mock${id}`;
  const { search } = state?.header ?? {};

  useEffect(() => {
    async function init() {
      const data = await bg?.getValue(storageId);
      const curr = data?.[storageId] ?? [];
      dispatch({ type: id, payload: curr });
    }
    init();
  }, []);

  async function handleAdd(path) {
    if (!path.trim()) {
      message.warn('请填写');
      return;
    }
    const index = data.findIndex(d => d.path === path);

    if (index > -1) {
      message.warn('重复添加');
      return;
    }
    const newData = [{ path, checked: false }, ...data];
    dispatch({ type: id, payload: newData });
    await bg?.setValue({ [storageId]: newData });
  }

  async function handleSelectTop(record, checked) {
    let newData = [...data];
    const index = newData.findIndex(d => d.path === record.path);
    const item = newData.find(d => d.path === record.path);
    if (item) {
      item.checked = checked;
      if (checked) {
        const curr = newData.splice(index, 1);
        newData = [...curr, ...newData];
      }
      dispatch({ type: id, payload: newData });
      await bg?.setValue({ [storageId]: newData });
    }
  }

  async function handleDel(record) {
    const index = data.findIndex(d => d.path === record.path);
    if (index > -1) {
      const item = data[index];
      data.splice(index, 1);
      dispatch({ type: id, payload: data });
      await bg?.setValue({ [storageId]: data });
      if (item.id) {
        await bg?.removeValue(item.id);
      }
    }
  }

  async function handleSelect(checked, record, isMock = false) {
    if (record) {
      const item = data.find(d => d.path === record.path);
      if (isMock) {
        item.mockChecked = checked;
      } else {
        item.checked = checked;
      }
    } else {
      if (!isMock) {
        data.forEach(item => {
          item.checked = checked;
        });
      }
    }
    dispatch({ type: id, payload: data });
    await bg?.setValue({ [storageId]: data });
  }

  function handleSearch(val) {
    dispatch({ type: id, payload: { ...data, search: val } });

  }

  async function handleSwitch(val) {
    dispatch({ type: id, payload: { ...data, switch: val } });
    await bg?.setValue({ [storageId]: { switch: val } });
  }


  async function handleEditData(record) {
    if (record) {
      const item = data.find(d => d.path === record.path);
      if (!item.id) {
        item.id = uuid();
        await bg?.setValue({ [storageId]: data });
      }
      return item.id;
    }
  }

  async function updateData() {
    const data = await bg?.getValue(storageId);
      const curr = data?.[storageId] ?? [];
      dispatch({ type: id, payload: curr });
      return curr;
  }

  return { data, handleAdd, handleDel, handleSelect, handleSelectTop, handleSearch, handleSwitch, handleEditData, search, updateData };
}