var socket = 0;
var currentPage = null;
chrome.runtime.onMessage.addListener(messageReceived);

var buffered_message = [];
var buffered_status = "";
var username = "";
var is_close = false;
var num_of_messages = 0;
var popup_num = 0;

function messageReceived(msg) {
  switch (msg.instruction) {
    case "disconnecting":
      socket.emit("disconnecting");
      socket = 0;
      break;
    case "connect":
      socket = io("https://chrome-chat.herokuapp.com");
      //socket = io("http://localhost:3000");
      socket.on("connected", data => {
        chrome.runtime.sendMessage({ instruction: "connected" });
        buffered_status = "waiting for a match";
      });
      socket.on("match", data => {
        chrome.runtime.sendMessage({ instruction: "displayPage", num: 3 });
        currentPage = 3;
      });
      socket.on("disconnected", data => {
        chrome.runtime.sendMessage({ instruction: "displayPage", num: 1 });
        chrome.runtime.sendMessage({ instruction: "clear_screen" });
        currentPage = 1;
        var notifOptions = {
          type: "basic",
          iconUrl: "img/bad.png",
          title: "Disconnected",
          message: "Your chat has ended. Please find a new match."
        };
        chrome.notifications.create("end_chat", notifOptions);
        socket = 0;
        buffered_message = [];
        chrome.notifications.clear("end_chat");
      });
      socket.on("chat", data => {
        chrome.runtime.sendMessage({
          instruction: "receive_message",
          message: data.message,
          name: data.name
        });
        buffered_message.push({
          message: data.message,
          name: data.name,
          is_your_own_message: false
        });
        if (is_close) {
          num_of_messages += 1;
          chrome.browserAction.setBadgeText({
            text: num_of_messages.toString()
          });
        }
      });
      break;
    case "username":
      username = msg.username;
      socket.emit("join", { name: msg.username });
      break;
    case "send_message":
      socket.emit("chat", {
        message: msg.sent_message
      });
      buffered_message.push({
        message: msg.sent_message,
        name: username,
        is_your_own_message: true
      });
      break;
    case "clear_socket":
      socket = 0;
      break;
    case "save_page":
      currentPage = msg.page;
      break;
    case "get_page":
      chrome.runtime.sendMessage({
        instruction: "return_page",
        page: currentPage
      });
      break;
    case "get_buffered_message":
      chrome.runtime.sendMessage({
        instruction: "buffered_message",
        message: buffered_message
      });
      break;
    case "get_buffered_status":
      chrome.runtime.sendMessage({
        instruction: "buffered_status",
        status: buffered_status
      });
      break;
    case "reset_badge_text":
      chrome.browserAction.setBadgeText({ text: "" });
      num_of_messages = 0;
      is_close = false;
      break;
    case "is_close":
      is_close = true;
      console.log("dsa");
      break;
    default:
  }
}
chrome.runtime.onConnect.addListener(function(port) {
  popup_num += 1;
});
chrome.runtime.onConnect.addListener(function(externalPort) {
  externalPort.onDisconnect.addListener(function() {
    popup_num -= 1;
    if (popup_num == 0) {
      is_close = true;
    }
  });

  console.log("onConnect");
});
