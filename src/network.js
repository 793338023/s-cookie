/* eslint-disable no-undef */

const bg = chrome?.extension?.getBackgroundPage();

let cache = [];
function getStorage() {
  chrome?.storage?.local?.get({
    mockright: [],
  }, (result) => {
    cache = result.mockright || [];
  });
}

getStorage();

chrome?.storage?.onChanged?.addListener(function (changes, namespace) {
  if (!chrome.runtime.lastError) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === 'mockright') {
        cache = newValue || [];
      }
    }
  }
});


async function handleContent(content, item) {
  const curr = cache.find(d => d.id === item.id);
  try {
    curr.collectResponseText = JSON.stringify(JSON.parse(content), null, 4);
  } catch (err) {
    curr.collectResponseText = content;
  }
  await bg?.setValue({ mockright: [...cache] });
}

chrome?.devtools?.network?.onRequestFinished?.addListener(
  function (request) {
    if (!chrome.runtime.lastError && !/(\/mock\/\d+\/)/.test(request.request.url)) {
      const url = new URL(request.request.url);
      const item = cache.find(d => {
        let path = "";
        try {
          const match = (new URL(d.path).pathname).match(/(\/mock\/\d+)?(\/.*)/) || [];
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
          if (!chrome.runtime.lastError) {
            handleContent(content, item);
          }
        });
      }
    }
  }
);

