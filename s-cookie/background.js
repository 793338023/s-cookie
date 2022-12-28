
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
  })
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
  })
  return data;
}

let mockleft = [];
let mockright = [];
let mockheader = {};
let mockData = {};

function getMock() {
  chrome.storage.local.get(
    {
      mockleft: [],
      mockright: [],
      mockheader: {},
    },
    (result) => {
      mockleft = result.mockleft.filter(d => d.checked);
      mockright = result.mockright.filter(d => d.checked);
      mockheader = result.mockheader;
      const allMockIds = mockright.filter(d => d.mockChecked).map(d => d.id).filter(Boolean);
      chrome.storage.local.get(allMockIds, (ret) => {
        mockData = ret;
      });
      makeBadge(mockheader);
    }
  );
}

getMock();

chrome.storage.onChanged.addListener((changes) => {
  getMock();
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    try {
      if (!mockheader.switch) {
        return { cancel: false };
      }

      const url = new URL(details.url);
      const isMockHost = mockleft.find(d => d.path === url.host);
      if (isMockHost) {
        const item = mockright.find(d => {
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

          let redirectUrl = item.path.split("?")[0].concat(url.search);
          if (item.mockChecked && item.id && mockData[item.id]) {
            redirectUrl = `data:application/json; charset=utf-8,${JSON.stringify(JSON.parse(mockData[item.id]))}`;
          }

          return {
            redirectUrl
          };
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
  { urls: ["<all_urls>"] },
  ['blocking', "requestBody"]
);

function makeBadge(data) {
  chrome.browserAction.setBadgeText({ text: data.switch ? 'ON' : 'OFF' });
  chrome.browserAction.setBadgeBackgroundColor({ color: data.switch ? '#4480f7' : '#bfbfbf' });
}

chrome.storage.onChanged.addListener(function (changes) {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (key === 'mockheader') {
      makeBadge(newValue);
    }
  }
});
