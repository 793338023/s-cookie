/* eslint-disable no-undef */
const bg = chrome?.extension?.getBackgroundPage();

export let currTab = {};
chrome?.tabs?.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tab) => {
  currTab = tab[0];
  if (typeof currTab.url === 'string') {
    currTab.host = currTab.url.split('/')[2];
  }
});

export async function setStorage(val) {
  if (!currTab.host) {
    return;
  }
  const data = await getStorage();
  await bg?.setValue({ [currTab.host]: { ...data, ...val } });
}

export async function getStorage() {
  if (!currTab.host) {
    return {};
  }
  const data = await bg?.getValue(currTab.host);
  if (!data) {
    return {};
  }
  return data[currTab.host] || {};
}

export async function getAll(host) {
  const cookies = await new Promise((res) => {
    const opts = host
      ? {
        domain: host,
      }
      : {};

    chrome?.cookies?.getAll(opts, (cookies) => {
      res(cookies);
    });
  });
  return cookies;
}

export async function setCookies(cookies) {
  const ret = [];
  cookies.forEach((cookie) => {
    const { name, value, secure, httpOnly } = cookie;
    const params = {
      name,
      value,
      secure,
      httpOnly,
      url: currTab.url,
    };
    ret.push(
      new Promise((res) => {
        chrome.cookies.set(params, (...args) => {
          res();
        });
      }),
    );
  });
  await Promise.all(ret);
  chrome?.tabs?.sendMessage(currTab.id, { reload: true }, function (response) { });
}