const socket = io();

let username = '';

let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

loginInput.focus();

const renderUserList = () => {
  let ul = document.querySelector('.userList');
  ul.innerHTML = '';

  userList.forEach(item => {
    ul.innerHTML += `<li>${item}</li>`
  });
};

const addMessage = (type, user, msg) => {
  let ul = document.querySelector('.chatList');

  switch (type) {
    case 'status':
      ul.innerHTML += `<li class="m-status">${msg}</li>`;
      break;
    case 'msg':
      if (username === user) {
        ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span> ${msg}</li>`;
      } else {
        ul.innerHTML += `<li class="m-txt"><span>${user}</span> ${msg}</li>`;
      };
      break;
  };

  ul.scrollTop = ul.scrollHeight;
};

const disableMessage = message => {
  textInput.setAttribute('disabled', '');
  textInput.setAttribute('placeholder', message);
};

const enableMessage = message => {
  textInput.removeAttribute('disabled');
  textInput.setAttribute('placeholder', message);
};

disableMessage('Conexão não estabelecida...');

loginInput.addEventListener('keyup', event => {
  if (event.keyCode === 13) {
    let name = loginInput.value.trim();

    if (name) {
      username = name;
      document.title = `${username} - Chat`;

      socket.emit('join-request', username);
    };
  };
});

textInput.addEventListener('keyup', event => {
  if (event.keyCode === 13) {
    let txt = textInput.value.trim();
    textInput.value = '';

    if (txt) {
      socket.emit('send-msg', txt);
    };
  };
});

socket.on('user-ok', data => {
  loginPage.style.display = 'none';
  chatPage.style.display = 'flex';

  enableMessage('Digite uma mensagem...');

  textInput.focus();

  addMessage('status', null, 'Conectado');

  userList = data;
  renderUserList();
});

socket.on('list-update', data => {
  if (data.joined) {
    addMessage('status', null, `${data.joined} entrou no chat!`);
  };

  if (data.left) {
    addMessage('status', null, `${data.left} saiu do chat`);
  };

  userList = data.list;

  renderUserList();
});

socket.on('show-msg', data => {
  addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
  addMessage('status', null, 'Você foi desconectado!');

  disableMessage('Você foi desconectado...');

  userList = [];

  renderUserList();
});

socket.io.on('reconnect_attempt', () => {
  addMessage('status', null, 'Tentando reconexão...');

  disableMessage('Tentando reconexão...');
});

socket.io.on('reconnect', () => {
  addMessage('status', null, 'Reconectado!');

  disableMessage('Conexão reestabelecida...');

  if(username){
    socket.emit('join-request', username);
  };
});

socket.on('user-error', message => {
  alert(message);
});