var login = document.getElementById("login-page");
var ready = document.getElementById("ready-page");
var connecting = document.getElementById("connecting-page");
var chat = document.getElementById("chat-page");

var submit_username = document.getElementById("submit-username");
var username_input = document.getElementById("username-input");
var header = document.getElementById("header");

var header2 = document.getElementById("header2");
var btn_back = document.getElementById("btn-back");
var btn_match = document.getElementById("btn-match");

var header3 = document.getElementById("header3");
var btn_back_2 = document.getElementById("btn-back-2");

var header4 = document.getElementById("header4");
var btn_back_3 = document.getElementById("btn-back-3");
var message_channel = document.getElementById("message-channel");
var message_box = document.getElementById("message");

var pages = [];
pages.push(login);
pages.push(ready);
pages.push(connecting);
pages.push(chat);

var socket = 0;

function displayPage(index) {
  for (var i = 0; i < pages.length; i++) {
    if (i == index) {
      pages[i].style.display = "block";
    } else {
      pages[i].style.display = "none";
    }
  }
  chrome.runtime.sendMessage({ instruction: "save_page", page: index });
  //chrome.storage.sync.set({ current_page: index }, function() {});
}

function remove_children(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function add_chat_message(
  is_your_own_message,
  add_to_dom_element,
  message,
  name
) {
  var div = document.createElement("div");
  var p = document.createElement("span");
  var p2 = document.createElement("span");
  if (is_your_own_message) {
    div.className = "container darker";
  } else {
    div.className = "container";
  }
  p.innerHTML = message;
  p2.innerHTML = name + ":   ";
  div.appendChild(p2);
  div.appendChild(p);

  add_to_dom_element.appendChild(div);
}

submit_username.addEventListener("click", function() {
  chrome.storage.sync.get(["username"], function(data) {
    name = username_input.value;
    chrome.storage.sync.set({ username: name }, function() {
      header2.innerHTML = "Greetings " + name;
      displayPage(1);
    });
  });
});

message_box.addEventListener("keyup", function(event) {
  if (event.keyCode == 13) {
    if (message.value != "") {
      var sent_message = message.value;
      chrome.runtime.sendMessage({
        instruction: "send_message",
        sent_message: sent_message
      });
      chrome.storage.sync.get(["username"], function(data) {
        add_chat_message(true, message_channel, sent_message, data.username);
        updateScroll();
      });
    }
    message_box.value = "";
  }
});

btn_back.addEventListener("click", function() {
  displayPage(0);
});

btn_back_2.addEventListener("click", function() {
  displayPage(1);
  chrome.runtime.sendMessage({ instruction: "disconnecting" });
  chrome.runtime.sendMessage({ instruction: "clear_socket" });
});

btn_back_3.addEventListener("click", function() {
  chrome.runtime.sendMessage({ instruction: "disconnecting" });
  chrome.runtime.sendMessage({ instruction: "clear_socket" });
});

btn_match.addEventListener("click", function() {
  displayPage(2);
  header3.innerHTML = "Connecting";
  chrome.runtime.sendMessage({ instruction: "connect" });

  chrome.storage.sync.get(["username"], function(data) {
    chrome.runtime.sendMessage({
      instruction: "username",
      username: data.username
    });
  });
});

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.instruction == "connected") {
    header3.innerHTML = "waiting for a match";
  } else if (msg.instruction == "displayPage") {
    displayPage(parseInt(msg.num));
  } else if (msg.instruction == "clear_screen") {
    remove_children(message_channel);
  } else if (msg.instruction == "receive_message") {
    add_chat_message(false, message_channel, msg.message, msg.name);
    updateScroll();
  } else if (msg.instruction == "return_page") {
    if (msg.page) {
      displayPage(msg.page);
    }
    if (msg.page == 3) {
      chrome.runtime.sendMessage({ instruction: "get_buffered_message" });
    } else if (msg.page == 2) {
      chrome.runtime.sendMessage({ instruction: "get_buffered_status" });
    }
  } else if (msg.instruction == "buffered_message") {
    var buffered_message = msg.message;
    buffered_message.forEach(item => {
      add_chat_message(
        item.is_your_own_message,
        message_channel,
        item.message,
        item.name
      );
    });
  } else if (msg.instruction == "buffered_status") {
    header3.innerHTML = msg.status;
  }
});

chrome.storage.sync.get(["username"], function(data) {
  if (data.username) {
    displayPage(1);
    header2.innerHTML = "Greetings " + data.username;
  } else {
    displayPage(0);
    header.innerHTML = "Welcome to Chrome Chat";
  }
});

chrome.runtime.sendMessage({ instruction: "get_page" });
chrome.runtime.sendMessage({ instruction: "reset_badge_text" });
resize = function() {
  document.getElementById("body").style.width = "200px";
  document.getElementById("body").style.height = "300px";
};
updateScroll = function() {
  var element = document.getElementById("message-channel");
  element.scrollTop = element.scrollHeight;
};

onload = function() {
  setTimeout(resize, 300);
  setTimeout(updateScroll, 10);
};

document.onload = onload;

var port = chrome.runtime.connect({});
