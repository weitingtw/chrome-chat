var login = document.getElementById("login-page");
var ready = document.getElementById("ready-page");
var connecting = document.getElementById("connecting-page");
var submit_username = document.getElementById("submit-username");
var username_input = document.getElementById("username-input");
var header = document.getElementById("header");
var btn_back = document.getElementById("btn-back");
var btn_match = document.getElementById("btn-match");

console.log(ready);

submit_username.addEventListener("click", function() {
  chrome.storage.sync.get(["username"], function(data) {
    name = username_input.value;
    chrome.storage.sync.set({ username: name }, function() {
      header2.innerHTML = "Greetings " + name;
      login.style.display = "none";
      ready.style.display = "block";
      connecting.style.display = "none";
    });
  });
});

btn_back.addEventListener("click", function() {
  login.style.display = "block";
  ready.style.display = "none";
  connecting.style.display = "none";
});

btn_match.addEventListener("click", function() {
  login.style.display = "none";
  ready.style.display = "none";
  connecting.style.display = "block";
});

var socket = io("http://localhost:3000");
chrome.storage.sync.get(["username"], function(data) {
  if (data.username) {
    login.style.display = "none";
    ready.style.display = "block";
    connecting.style.display = "none";
    header2.innerHTML = "Greetings " + data.username;
  } else {
    login.style.display = "block";
    ready.style.display = "none";
    connecting.style.display = "none";
    header.innerHTML = "Welcome to Chrome Chat";
  }
});
