/* eslint-disable no-undef */

/**
 * EventBus
 */
class CustomEvent {
  clientList = {};
  constructor() { }
  // 订阅通知
  addListener(type, fn) {
    if (!this.clientList[type]) {
      this.clientList[type] = [];
    }
    this.clientList[type].push(fn);
  }

  // 取消订阅
  removeListener(type) {
    if (!type) {
      this.clientList = {};
    }
    this.clientList[type] = [];
  }

  // 发送通知
  trigger(type, ...args) {
    const fns = this.clientList[type];
    if (!fns || fns.length <= 0) {
      return;
    }
    fns.forEach((fn) => {
      fn.apply(this, args);
    });
  }
}

export const event = new CustomEvent();


export function getTab(tab) {
  if (tab && typeof tab.url === "string") {
    tab.host = tab.url.split("/")[2];
    tab.domain = (tab.host || "").split(":")[0];
  }
  return tab;
}

/**
 * 获取指定tab下的缓存数据
 * @param {*} currTab
 * @returns
 */
export async function getStorage(currTab) {
  try {
    if (!currTab || !currTab.host) {
      return {};
    }
    const data = await getValue(currTab.host);
    if (!data) {
      return {};
    }
    return data[currTab.host] || {};
  } catch (err) {
    return {};
  }
}

/**
 * 指定tab下缓存数据
 * @param {*} currTab
 * @param {*} val
 * @returns
 */
export async function setStorage(currTab, val) {
  if (!currTab.host) {
    return;
  }
  const data = await getStorage(currTab);
  await setValue({ [currTab.host]: { ...data, ...val } });
}

export async function setValue(data) {
  if (!chrome?.storage?.local) {
    return null;
  }
  return new Promise((resolve, reject) => {
    chrome?.storage?.local?.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getValue(key) {
  if (!chrome?.storage?.local) {
    return null;
  }
  var data = new Promise((resolve, reject) => {
    chrome?.storage?.local?.get(key, (item) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(item);
      }
    });
  });
  return data;
}

export async function removeValue(key) {
  if (!chrome?.storage?.local) {
    return null;
  }
  var data = new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, (item) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(item);
      }
    });
  });
  return data;
}

let currTab = {};

async function getCurrentTab() {
  if (!chrome?.tabs) {
    return null;
  }
  return new Promise((res) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, (tab) => {
      currTab = tab[0] || {};
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      if (currTab && typeof currTab.url === "string") {
        currTab.host = currTab.url.split("/")[2];
        currTab.domain = (currTab.host || "").split(":")[0];
      }
      res(currTab);
    });
  });
}

async function init() {
  const initVal = (await getStorage(currTab)) || {};
  const data = initVal.data || [];
  const selectedRowKey = (initVal.selected || [])[0];
  return data.find((d) => d.host === selectedRowKey);
}

async function getSelectedRow() {
  await getCurrentTab();
  return await init();
}

export async function handleENVCookie() {
  const selectedRow = await getSelectedRow();
  if (selectedRow) {
    const env = selectedRow.env;
    if (!env) {
      chrome.cookies.remove({
        name: "S_DEV_PROXY_ENV",
        url: currTab.url,
      });
      return;
    }
    chrome.cookies.set({
      name: "S_DEV_PROXY_ENV",
      value: env,
      url: currTab.url,
    });
  }
}