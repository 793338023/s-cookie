
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