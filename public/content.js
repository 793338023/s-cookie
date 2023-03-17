let isCollecStorage = false;
let cache = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "s-cookie") {
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
      });
    } catch (e) { }
  }
  return true;
});

function sendlocalStorage() {
  if (!isCollecStorage) {
    return;
  }
  const storage = JSON.stringify(localStorage);
  chrome.runtime.sendMessage({ storage: storage, type: "s-cookie" });
}

window.addEventListener("storage", function (e) {
  sendlocalStorage();
});

chrome.runtime.sendMessage({ active: true, type: "s-cookie" });

function injectedScript(path) {
  const scriptNode = document.createElement("script");
  scriptNode.setAttribute("type", "text/javascript");
  scriptNode.async = false;
  scriptNode.setAttribute("src", chrome.runtime.getURL(path));
  document.documentElement.appendChild(scriptNode);

  return scriptNode;
}

function handleSwitch(changeKey) {
  if (changeKey.includes("mockheader") || changeKey.includes("mockleft")) {
    let isSwitch = cache.mockheader.switch;
    if (isSwitch) {
      const match = location.href.match(/(https?:\/\/)?([^/]+)\/?/i);
      if (match && typeof match[2] === "string") {
        const val = match[2].trim();
        const curr =
          cache.mockleft.find(function (d) {
            return d.path === val;
          }) || {};
        isSwitch = curr.checked || false;
      } else {
        isSwitch = false;
      }
    }
    sessionStorage.setItem("s-mock-switch", isSwitch ? '1' : '0');
    postMessage({
      type: "s-mock",
      to: "pageScript",
      key: "mockSwitch",
      value: isSwitch,
    });
  }

  if (changeKey.includes("mockright")) {
    let ajaxData = (cache.mockright || []).filter(function (d) {
      return d.checked;
    });
    postMessage({
      type: "s-mock",
      to: "pageScript",
      key: "ajaxDataList",
      value: ajaxData,
    });
  }
}

Promise.all([new Promise(function (res) {
  chrome.storage.local.get(
    {
      mockleft: [],
      mockright: [],
      mockheader: {},
    },
    (result) => {
      cache = { ...cache, ...result };
      handleSwitch(["mockheader", "mockleft"]);
      res();
    }
  );
}), new Promise(function (res) {
  injectedScript("pageScript.js").addEventListener("load", () => {
    res();
  });
})]).then(function () {
  handleSwitch(["mockright"]);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  let changeKey = [];
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "mockheader" || key === "mockleft" || key === "mockright") {
      cache[key] = newValue;
      changeKey.push(key);
    }
  }
  handleSwitch(changeKey);
});
