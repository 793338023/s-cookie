/* eslint-disable no-undef */

const bg = chrome?.extension?.getBackgroundPage();

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

chrome?.devtools?.network?.onRequestFinished?.addListener(function (request) {
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
