const socket = io();

let username = '';

let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

loginInput.addEventListener('keyup', event => {
  if(event.keyCode === 13){
    let name = loginInput.value.trim();
    
    if(name !== '') {
      username = name;
      document.title = `${username} - Chat`;
    };
  };
});