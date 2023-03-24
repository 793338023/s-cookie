/* eslint-disable no-undef */
import { Modal } from 'antd';
import { SampleData } from "../mock-data";
import { formattedMock } from "../../mock/utils";
import * as bg from "@/tools";

export async function hasMock(id) {
  const listWrapper = await bg?.getValue("mockright");
  const list = listWrapper?.mockright ?? [];
  const item = list.find((d) => d.id === id);
  if (item) {
    return item;
  }
  return {};
}

export async function getValueSchema(id) {
  const item = await hasMock(id);
  let text = SampleData.jsonInput;
  if (item?.responseText) {
    text = item?.responseText || SampleData.jsonInput;
  }
  return { ...item, text };
}

export async function setMockValue(id, val) {
  const listWrapper = await bg?.getValue("mockright");
  const list = listWrapper?.mockright ?? [];
  const item = list.find((d) => d.id === id);
  if (item) {
    Object.assign(item, (val || {}));
    await bg?.setValue({ mockright: [...list] });
    return true;
  } else {
    return false;
  }
}

export async function setValueSchema(id, val) {
  return await setMockValue(id, { responseText: val });
}

export async function getSyncValue(id) {
  const listWrapper = await bg?.getValue("mockright");
  const list = listWrapper?.mockright ?? [];
  const item = list.find((d) => d.id === id);
  if (item) {
    if (!item.collectResponseText) {
      Modal.error({ title: '没有可同步的数据' });
      return false;
    }
    if (item.responseText) {
      return await new Promise(res => {
        Modal.confirm({
          title: '是否覆盖现有数据?',
          onOk: async () => {
            item.responseText = formattedMock(item.collectResponseText);
            await bg?.setValue({ mockright: [...list] });
            res(item.responseText)
          },
          onCancel() {
            res(false);
          },
        });
      })
    } else {
      item.responseText = formattedMock(item.collectResponseText);
      await bg?.setValue({ mockright: [...list] });
      return item.responseText;
    }
  } else {
    return false;
  }
}
