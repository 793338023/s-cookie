/* eslint-disable no-undef */
import { SampleData } from '../mock-data';

export { downloadJsonFile } from "./file";
export * from "./json-string";

const bg = chrome?.extension?.getBackgroundPage();

export async function hasMock(id) {
  const listWrapper = await bg?.getValue('mockright');
  const list = listWrapper?.mockright ?? [];
  const item = list.find(d => d.id === id);
  if (item) {
    return item;
  }
  return false;
}

export async function getValueSchema(id) {
  const item = await hasMock(id);
  if (item) {
    const data = await bg?.getValue(id);
    if (data?.[id]) {
      return data[id] || SampleData.jsonInput;
    }
  }
  return SampleData.jsonInput;
}

export async function setValueSchema(id, val) {
  if (hasMock(id)) {
    await bg?.setValue({ [id]: val });
    return true;
  } else {
    return false;
  }
}