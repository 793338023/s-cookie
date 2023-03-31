/* eslint-disable no-undef */
import * as bg from './tools';

function debounce(func, time = 500) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, time);
  };
}

let cache = [];
function getStorage() {
  chrome?.storage?.local?.get(
    {
      mockright: [],
    },
    (result) => {
      cache = result.mockright || [];
    }
  );
}

getStorage();

chrome?.storage?.onChanged?.addListener(function (changes, namespace) {
  if (!chrome.runtime.lastError) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === "mockright") {
        cache = newValue || [];
      }
    }
  }
});

let tempCache = {};
const saveCache = debounce(async () => {
  const data = await bg?.getValue("mockright");
  const mockList = data?.mockright ?? [];
  Object.keys(tempCache).forEach(id => {
    const curr = mockList?.find((d) => d.id === id);
    if (curr) {
      curr.collectResponseText = tempCache[id];
    }
  });
  tempCache = {};
  await bg?.setValue({ mockright: mockList });
});

async function handleContent(content, item) {
  const curr = cache.find((d) => d.id === item.id);
  let collectResponseText = '';
  try {
    collectResponseText = JSON.stringify(JSON.parse(content), null, 2);
  } catch (err) {
    collectResponseText = content;
  }
  tempCache[curr.id] = collectResponseText;
  saveCache();
}

let start = false;
let collect = [];
let host = '';

const updateCollect = () => {
  if (start) {
    bg.event.trigger(bg.SNETWORK, collect);
    collect = [];
  }
};

function switchPath() {
  if (start && host) {
    bg.event.trigger(bg.SNETWORKHOST, host);
  }
}

/**
 * 导航改变
 */
chrome?.devtools?.network?.onNavigated?.addListener((path) => {
  const currHost = path.split("/")[2];
  if (host !== currHost) {
    host = currHost;
    switchPath();
  }
});

/**
 *  s-network 加载后获取数据
 */
bg.event.addListener(bg.SNETWORKSTART, status => {
  start = status;
  switchPath();
  updateCollect();
})

/**
 * 收集数据
 * @param {*} request 
 */
function handeCollect(request) {
  const { _resourceType, response: { headers } } = request;
  const contentType = (headers.find(d => d.name?.toLocaleLowerCase() === "content-type") || {}).value || '';
  const allowOrgin = (headers.find(d => d.name?.toLocaleLowerCase() === "access-control-allow-origin") || {}).value || '';
  if (_resourceType === "fetch"
    && contentType.indexOf("application/json") > -1
    && (!allowOrgin
      || request.request.url.indexOf(allowOrgin) > -1)) {
    console.log(request, "request.request.url");
    const item = { url: request.request.url };
    request.getContent((content) => {
      item.text = content;
      collect.push(item);
      updateCollect();
    });
  }
}

chrome?.devtools?.network?.onRequestFinished?.addListener(function (request) {
  handeCollect(request);
  if (!/(\/mock\/\d+\/)/.test(request.request.url)) {
    const url = new URL(request.request.url);
    const item = cache.find((d) => {
      let path = "";
      try {
        const match =
          new URL(d.path).pathname.match(/(\/mock\/\d+)?(\/.*)/) || [];
        path = match[2];
        if (!path) {
          return false;
        }
      } catch (e) {
        path = d.path;
      }

      var reg = new RegExp(`.*${path}$`);
      return reg.test(url.pathname);
    });
    if (item) {
      request.getContent((content) => {
        handleContent(content, item);
      });
    }
  }
});

