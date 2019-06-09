var socket = 0;

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(msg) {
  console.log(msg);
}
