/* eslint-disable no-undef */
import { useContext, useEffect } from "react";
import { message } from "antd";
import { v4 as uuid } from "uuid";
import Context from "./reducer";
import * as bg from "@/tools";

export default (id) => {
  const { state, dispatch } = useContext(Context);
  const data = state[id] || [];
  const storageId = `mock${id}`;
  const { search } = state?.header ?? {};

  async function getCache() {
    const newData = await bg?.getValue(storageId);
    const curr = newData?.[storageId] ?? data;
    return curr;
  }

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
    if (id === "right" && !/(\/mock\/\d+\/)/.test(path)) {
      item.isNonSoapi = true;
      item.mockChecked = true;
    }
    const newData = [item, ...curData];
    dispatch({ type: id, payload: newData });

    await bg?.setValue({ [storageId]: newData });
  }

  async function handleSelectTop(record, checked) {
    let newData = await getCache();
    const index = newData.findIndex((d) => d.path === record.path);
    const item = newData.find((d) => d.path === record.path);
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

  function handleSearch(val) {
    dispatch({ type: id, payload: { ...data, search: val } });
  }

  async function handleSwitch(val) {
    dispatch({ type: id, payload: { ...data, switch: val } });
    await bg?.setValue({ [storageId]: { switch: val } });
  }

  async function handleEditData(record) {
    const newData = await getCache();
    if (record) {
      const item = newData.find((d) => d.path === record.path);
      if (!item?.id) {
        item.id = uuid();
        await bg?.setValue({ [storageId]: newData });
      }
      return item;
    }
  }

  async function updateData() {
    const data = await bg?.getValue(storageId);
    const curr = data?.[storageId] ?? [];
    dispatch({ type: id, payload: curr });
    return curr;
  }

  return {
    data,
    handleAdd,
    handleDel,
    handleSelect,
    handleSelectTop,
    handleSearch,
    handleSwitch,
    handleEditData,
    search,
    updateData,
  };
};
