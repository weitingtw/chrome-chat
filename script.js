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

function add_chat_message(
  is_your_own_message,
  add_to_dom_element,
  message,
  time
) {
  var div = document.createElement("div");
  var p = document.createElement("p");
  var span = document.createElement("span");
  if (is_your_own_message) {
    div.className = "container darker";
    span.className = "time-left";
  } else {
    div.className = "container";
    span.className = "time-right";
  }
  p.innerHTML = message;
  div.appendChild(p);
  div.appendChild(span);
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
      socket.emit("chat", {
        message: message_box.value
      });
      add_chat_message(true, message_channel, message_box.value, "asd");
    }
    message_box.value = "";
  }
});

btn_back.addEventListener("click", function() {
  displayPage(0);
});

btn_back_3.addEventListener("click", function() {
  socket.emit("disconnecting");
});

btn_match.addEventListener("click", function() {
  displayPage(2);
  socket = io("http://localhost:3000");
  socket.emit("join");
  socket.on("connected", data => {
    header3.innerHTML = "connected, looking for other users ";
  });
  socket.on("match", data => {
    displayPage(3);
  });
  socket.on("disconnected", data => {
    displayPage(1);
    var notifOptions = {
      type: "basic",
      iconUrl: "img/bad.png",
      title: "Disconnected",
      message: "Your chat has ended. Please find a new match."
    };
    chrome.notifications.create("end_chat", notifOptions);
    header2.innerHTML += "\n The chat has ended";
  });
  socket.on("chat", data => {
    add_chat_message(false, message_channel, data.message, "asd");
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
