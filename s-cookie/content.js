let isCollecStorage = false;
let cache = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.type !== "s-cookie"){
    return true;
  }
  if (typeof request.isCollecStorage === "boolean") {
    isCollecStorage = request.isCollecStorage;
    sendlocalStorage();
  }

  if (request && request.reload) {
    window.location.reload();
  }
  if (request && request.storage) {
    try {
      const storage = JSON.parse(request.storage);
      const keys = Object.keys(storage);
      keys.forEach(function (key) {
        localStorage.setItem(key, storage[key]);
      })
    } catch (e) { }
  }
});

function sendlocalStorage() {
  if (!isCollecStorage) {
    return;
  }
  const storage = JSON.stringify(localStorage);
  chrome.runtime.sendMessage({ storage: storage, type: 's-cookie' });
}


window.addEventListener("storage", function (e) {
  sendlocalStorage();
});

chrome.runtime.sendMessage({ active: true, type: 's-cookie' }, function (response) { });

function injectedScript(path) {
  const scriptNode = document.createElement('script');
  scriptNode.setAttribute('type', 'text/javascript');
  scriptNode.setAttribute('src', chrome.runtime.getURL(path));
  document.documentElement.appendChild(scriptNode);
  return scriptNode;
}

function handleSwitch(changeKey) {
  if (changeKey.includes("mockheader") || changeKey.includes("mockleft")) {
    let isSwitch = cache.mockheader.switch;
    if (isSwitch) {
      const match = location.href.match(/(https?:\/\/)?([^/]+)\/?/i);
      if (match && typeof match[2] === 'string') {
        const val = match[2].trim();
        const curr = cache.mockleft.find(function (d) {
          return d.path === val;
        }) || {};
        isSwitch = curr.checked || false;
      } else {
        isSwitch = false;
      }
    }
    postMessage({ type: 's-mock', to: 'pageScript', key: 'mockSwitch', value: isSwitch });
  }

  if (changeKey.includes("mockright")) {
    let ajaxData = (cache.mockright || []).filter(function (d) {
      return d.checked;
    });
    postMessage({ type: 's-mock', to: 'pageScript', key: 'ajaxDataList', value: ajaxData });
  }
}

injectedScript('pageScript.js').addEventListener('load', () => {
  chrome.storage.local.get({
    mockleft: [],
    mockright: [],
    mockheader: {},
  }, (result) => {
    cache = { ...cache, ...result };
    handleSwitch(["mockleft", "mockright", "mockheader"]);
  });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  let changeKey = [];
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (
      key === 'mockheader'
      || key === 'mockleft'
      || key === 'mockright'
    ) {
      cache[key] = newValue;
      changeKey.push(key);
    }
  }
  handleSwitch(changeKey);
});