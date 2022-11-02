/* eslint-disable no-undef */
const bg = chrome?.extension?.getBackgroundPage();

export let currTab = {};
chrome?.tabs?.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tab) => {
  currTab = tab[0];
  if (typeof currTab.url === 'string') {
    currTab.host = currTab.url.split('/')[2];
    currTab.domain = currTab.host.split(':')[0];
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

export async function getAll(host = currTab.host) {
  const domain = typeof host === 'string' ? host.split(':')[0] : '';
  const cookies = await new Promise((res) => {
    const opts = domain
      ? {
        domain,
      }
      : {};

    chrome?.cookies?.getAll(opts, (cookies) => {
      res(cookies);
    });
  });
  return cookies;
}

async function delCookies(cookies, host) {
  const url = `http://${host}`;
  const ret = [];
  const curCookies = await getAll(host || currTab.host);
  const dels = curCookies.filter(d => cookies.find(i => i.name === d.name));
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
      }),
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
export async function setCookies(cookies, host) {
  const url = `http://${host}`;
  const ret = [];

  await delCookies(cookies, host);

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
      }),
    );
  });
  await Promise.all(ret);
  if (host) {
    const match = currTab.url.match(/^(\w+:\/\/)?([^\/]+)(.*)/i);
    const params = match[3];
    chrome?.tabs?.create(
      {
        url: `${url}${params || ""}`,
        active: true,
        index: currTab.index + 1,
      },
      () => { },
    );
    return;
  }
  chrome?.tabs?.sendMessage(currTab.id, { reload: true }, function (response) { });
}
