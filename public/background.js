
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

let mockleft = [];
let mockright = [];
let mockheader = {};

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
          const match = (new URL(d.path).pathname).match(/(\/mock\/\d+)?(\/.*)/) || [];
          const path = match[2];
          if (!path) {
            return false;
          }
          var reg = new RegExp(`.*${path}$`);
          return reg.test(url.pathname);
        });
        if (item) {
          const redirectUrl = item.path.split("?")[0].concat(url.search);
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