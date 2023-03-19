export const share = {
  syncData: null
};

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
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getValue(key) {
  var data = new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (item) => {
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
