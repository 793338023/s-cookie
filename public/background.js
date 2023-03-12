function getTab(tab) {
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
async function getStorage(currTab) {
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
async function setStorage(currTab, val) {
  if (!currTab.host) {
    return;
  }
  const data = await getStorage(currTab);
  await bg?.setValue({ [currTab.host]: { ...data, ...val } });
}

async function setValue(data) {
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

async function getValue(key) {
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

async function removeValue(key) {
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

function getMock() {
  chrome.storage.local.get(
    {
      mockheader: {},
    },
    (result) => {
      mockheader = result.mockheader;
      makeBadge(mockheader);
    }
  );
}

getMock();

function makeBadge(data) {
  chrome.browserAction.setBadgeText({ text: data.switch ? "ON" : "OFF" });
  chrome.browserAction.setBadgeBackgroundColor({
    color: data.switch ? "#4480f7" : "#bfbfbf",
  });
}

chrome.storage.onChanged.addListener(function (changes) {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (key === "mockheader") {
      makeBadge(newValue);
    }
  }
});

let syncData = null;

async function handleSync(msg, sender) {
  if (msg.syncData) {
    syncData = msg.syncData;
    return true;
  }
  const tab = getTab(sender.tab);
  const curr = await getStorage(tab);
  const isCollecStorage = curr.isCollecStorage;
  if (msg.active) {
    let storage = null;
    if (syncData) {
      const formStorage = await getStorage({ host: syncData.form });
      if (formStorage.isCollecStorage && formStorage.storage) {
        storage = formStorage.storage;
      }
      syncData = null;
    }
    chrome.tabs.sendMessage(tab.id, {
      isCollecStorage,
      storage,
      type: "s-cookie",
    });
  }
  if (isCollecStorage && msg.storage) {
    setStorage(tab, { storage: msg.storage });
  }
  return true;
}

chrome.runtime.onMessage.addListener(async function (msg, sender, response) {
  if (msg.type !== "s-cookie") {
    return true;
  }
   handleSync(msg, sender);
  return true;
});
