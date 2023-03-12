/* eslint-disable no-undef */
import { Modal } from 'antd';
import { SampleData } from "../mock-data";
import { formattedMock } from "../../mock/utils";
export { downloadJsonFile } from "./file";
export * from "./json-string";

const bg = chrome?.extension?.getBackgroundPage();

export async function hasMock(id) {
  const listWrapper = await bg?.getValue("mockright");
  const list = listWrapper?.mockright ?? [];
  const item = list.find((d) => d.id === id);
  if (item) {
    return item;
  }
  return false;
}

export async function getValueSchema(id) {
  const item = await hasMock(id);
  if (item?.responseText) {
    return item?.responseText || SampleData.jsonInput;
  }
  return SampleData.jsonInput;
}

export async function setValueSchema(id, val) {
  const listWrapper = await bg?.getValue("mockright");
  const list = listWrapper?.mockright ?? [];
  const item = list.find((d) => d.id === id);
  if (item) {
    item.responseText = val;
    await bg?.setValue({ mockright: [...list] });
    return true;
  } else {
    return false;
  }
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
    item.responseText = formattedMock(item.collectResponseText);
    await bg?.setValue({ mockright: [...list] });
    return item.responseText;
  } else {
    return false;
  }
}
