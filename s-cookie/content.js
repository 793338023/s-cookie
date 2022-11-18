chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request && request.reload) {
    window.location.reload();
  }
});

// window.addEventListener('load', () => {
//   chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
//     console.log(response.farewell);
//   });
// }, false);