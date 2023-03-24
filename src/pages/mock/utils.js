/* eslint-disable no-undef */
import * as bg from "@/tools";

export let currTab = {};
chrome?.tabs?.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tab) => {
  currTab = tab[0] || {};
  if (typeof currTab.url === 'string') {
    currTab.host = currTab.url.split('/')[2];
  }
  bg.event.trigger("qryTab");
});

/**
 * 获取当前tab
 * @returns 
 */
export async function getTab() {
  return new Promise(res => {
    if(!chrome?.tabs || currTab?.host){
     return res(currTab);
    }
    bg.event.addListener("qryTab", function () {
      res(currTab);
    });
  })
}


export async function setStorage(val) {
  if (!currTab.host) {
    return;
  }
  const data = await getStorage();
  await bg?.setValue({ [currTab.host]: { ...data, ...val } });
}

export async function getStorage() {
  if (!currTab?.host) {
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
  chrome?.tabs?.sendMessage(currTab.id, { reload: true, type: 's-cookie' }, function (response) { });
}

export const formattedMock = (text) => `
// query url请求参数 body 请求内容
let { query, body, response, method } = arguments[0];
return ${text};
`;