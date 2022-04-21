chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request && request.reload) {
    window.location.reload();
  }
});


