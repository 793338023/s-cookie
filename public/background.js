import { getTab, getStorage, setStorage ,share} from "./tools.js";
import "./contextMenus.js";

function getMock() {
  chrome.storage.local.get(
    {
      mockheader: {},
    },
    (result) => {
      const mockheader = result.mockheader;
      makeBadge(mockheader);
    }
  );
}

getMock();

function makeBadge(data) {
  chrome.action.setBadgeText({ text: data.switch ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({
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

async function handleSync(msg, sender) {
  if (msg.syncData) {
    share.syncData = msg.syncData;
    return true;
  }
  const tab = getTab(sender.tab);
  const curr = await getStorage(tab);
  const isCollecStorage = curr.isCollecStorage;
  if (msg.active) {
    let storage = null;
    if (share.syncData) {
      const formStorage = await getStorage({ host: share.syncData.form });
      if (formStorage.isCollecStorage && formStorage.storage) {
        storage = formStorage.storage;
      }
      share.syncData = null;
    }
    chrome.tabs.sendMessage(tab.id, {
      isCollecStorage,
      storage,
      type: "s-cookie",
    });
  }
  if (isCollecStorage && msg.storage) {
    // 开启收集并保存localStorage到对应的tabs数据
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
