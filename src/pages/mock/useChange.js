/* eslint-disable no-undef */
import { useContext, useEffect } from 'react';
import { message } from 'antd';
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
    const newData = [...data, { path, checked: false }];
    dispatch({ type: id, payload: newData });
    await bg?.setValue({ [storageId]: newData });
  }

  async function handleDel(record) {
    const index = data.findIndex(d => d.path === record.path);
    if (index > -1) {
      data.splice(index, 1);
      dispatch({ type: id, payload: data });
      await bg?.setValue({ [storageId]: data });
    }
  }

  async function handleSelect(checked, record) {
    if (record) {
      const item = data.find(d => d.path === record.path);
      item.checked = checked;
    } else {
      data.forEach(item => {
        item.checked = checked;
      });
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

  return { data, handleAdd, handleDel, handleSelect, handleSearch, handleSwitch, search };
}