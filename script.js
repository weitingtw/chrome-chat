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
  p2.innerHTML = name + ":";
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
      socket.emit("chat", {
        message: sent_message
      });
      chrome.storage.sync.get(["username"], function(data) {
        add_chat_message(true, message_channel, sent_message, data.username);
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
  socket.emit("disconnecting");
  socket = 0;
});

btn_back_3.addEventListener("click", function() {
  socket.emit("disconnecting");
  socket = 0;
});

btn_match.addEventListener("click", function() {
  displayPage(2);
  socket = io("http://localhost:3000");
  chrome.storage.sync.get(["username"], function(data) {
    socket.emit("join", { name: data.username });
  });

  socket.on("connected", data => {
    header3.innerHTML = "connected, looking for other users ";
  });
  socket.on("match", data => {
    displayPage(3);
  });
  socket.on("disconnected", data => {
    displayPage(1);
    remove_children(message_channel);
    var notifOptions = {
      type: "basic",
      iconUrl: "img/bad.png",
      title: "Disconnected",
      message: "Your chat has ended. Please find a new match."
    };
    chrome.notifications.create("end_chat", notifOptions);
    socket = 0;
  });
  socket.on("chat", data => {
    add_chat_message(false, message_channel, data.message, data.name);
    console.log(data.message);
  });
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

chrome.runtime.sendMessage({ greeting: "hello" }, function(response) {});

chrome.runtime.onMessage.addListener(function(msg) {
  console.log(msg);
});
