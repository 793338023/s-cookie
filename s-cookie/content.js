var isCollecStorage = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if(typeof request.isCollecStorage === "boolean"){
    isCollecStorage = request.isCollecStorage;
    sendlocalStorage();
  }
 
  if (request && request.reload) {
    window.location.reload();
  }
  if (request && request.storage) {
    try {
      var storage = JSON.parse(request.storage);
      var keys = Object.keys(storage);
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
  var storage = JSON.stringify(localStorage);
  chrome.runtime.sendMessage({ storage: storage });
}


window.addEventListener("storage", function (e) {
  sendlocalStorage();
});

chrome.runtime.sendMessage({ active: true }, function (response) {});