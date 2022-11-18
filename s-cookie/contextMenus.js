/* eslint-disable no-undef */
const bg = chrome.extension.getBackgroundPage();

let currTab = {};

async function getCurrentTab() {
  return new Promise((res) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, (tab) => {
      currTab = tab[0];
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      if (currTab && typeof currTab.url === "string") {
        currTab.host = currTab.url.split("/")[2];
        currTab.domain = (currTab.host || "").split(":")[0];
      }
      res();
    });
  });
}

async function getStorage() {
  if (!currTab || !currTab.host) {
    return {};
  }
  const data = await bg.getValue(currTab.host);
  if (!data) {
    return {};
  }
  return data[currTab.host] || {};
}

async function getAll(host = currTab.host) {
  const domain = typeof host === "string" ? host.split(":")[0] : "";
  const cookies = await new Promise((res) => {
    const opts = domain
      ? {
          domain,
        }
      : {};

    chrome.cookies.getAll(opts, (cookies) => {
      res(cookies);
    });
  });
  return cookies;
}

async function delCookies(cookies, host, originUrl) {
  const url = originUrl || `http://${host}`;
  const ret = [];
  const curCookies = await getAll(host || currTab.host);
  const dels = curCookies.filter((d) => cookies.find((i) => i.name === d.name));
  dels.forEach((cookie) => {
    const { name } = cookie;
    const params = {
      name,
      url: host ? url : currTab.url,
    };
    ret.push(
      new Promise((res) => {
        chrome.cookies.remove(params, (...args) => {
          res();
        });
      })
    );
  });
  await Promise.all(ret);
}

/**
 * 设置cookie 刷新或者打开被设置地址
 * @param {*} cookies
 * @param {*} host 传打开，不传刷新
 * @returns
 */
async function setCookies(cookies, host, originUrl) {
  const url = originUrl || `http://${host}`;
  const ret = [];

  await delCookies(cookies, host, originUrl);

  cookies.forEach((cookie) => {
    const { name, value, secure, httpOnly, path } = cookie;
    const params = {
      name,
      path,
      value,
      secure,
      httpOnly,
      url: host ? url : currTab.url,
    };
    ret.push(
      new Promise((res) => {
        chrome.cookies.set(params, (...args) => {
          res();
        });
      })
    );
  });
  await Promise.all(ret);
  if (host) {
    const match = currTab.url.match(/^(\w+:\/\/)?([^\/]+)(.*)/i);
    const params = match[3];
    chrome.tabs.create(
      {
        url: `${url}${params || ""}`,
        active: true,
        index: currTab.index + 1,
      },
      () => {}
    );
    return;
  }
}

async function init() {
  const initVal = (await getStorage()) || {};
  const data = initVal.data || [];
  const selectedRowKey = (initVal.selected || [])[0];
  return data.find((d) => d.host === selectedRowKey);
}

async function getSelectedRow() {
  await getCurrentTab();
  return await init();
}

async function initMenus() {
  const selectedRow = await getSelectedRow();
  if (!selectedRow || !currTab) {
    chrome.contextMenus.update("openDev", {
      visible: false,
    });
    return;
  }
  chrome.contextMenus.update("openDev", {
    visible: true,
  });
}

let loading = false;
async function handleCurrTab() {
  if (!loading) {
    try {
      loading = true;
      await initMenus();
      loading = false;
    } catch (e) {
      console.error(e);
      loading = false;
    }
  }
}

handleCurrTab();

chrome.runtime.onInstalled.addListener(handleCurrTab);
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  await handleCurrTab();
  const initVal = (await getStorage()) || {};
  if (
    initVal.refresh &&
    info.status === "loading" &&
    Object.keys(info).length <= 1
  ) {
    handleSynchronize();
  }
});
chrome.tabs.onActivated.addListener(handleCurrTab);

async function handleOpenClick() {
  const selectedRow = await getSelectedRow();
  if (selectedRow) {
    const cookies = await getAll();
    await setCookies(cookies, selectedRow.host, selectedRow.url);
  }
}

chrome.contextMenus.create({
  type: "normal",
  title: "同步打开",
  id: "openDev",
  contexts: ["all"],
  onclick: handleOpenClick,
});

async function handleSynchronize() {
  const selectedRow = await getSelectedRow();
  if (selectedRow) {
    const cookies = await getAll(selectedRow.host);
    await setCookies(cookies);
  }
}


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if (request.greeting == "hello")
      sendResponse({ farewell: "goodbye" });
  });