const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const sanitizer = require('sanitize-html');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

const sanitizeHTML = (string) => {
  sanitizedString = sanitizer(string, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  });

  return sanitizedString;
};

io.on('connection', socket => {
  console.log(`Conexão detectada...`);

  socket.on('join-request', (username) => {
    if (username.length <= 0 || username.length >= 16) {
      socket.emit('user-error', 'O usuário informado precisa conter de 0 a 16 caracteres!');
      return;
    };

    username = sanitizeHTML(username);

    if (connectedUsers.includes(username) === false) {
      socket.username = username;

      connectedUsers.push(username);

      console.log(`Usuário conectado: ${username}`);
      console.log(`Total de usuários: ${connectedUsers.length}`)

      socket.emit('user-ok', connectedUsers);

      socket.broadcast.emit('list-update', {
        joined: username,
        list: connectedUsers,
      });
    } else {
      socket.emit('user-error', 'Usuário informado já está conectado!');
    };
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(user => user !== socket.username);

    console.log(`Usuário desconectado: ${socket.username}`);
    console.log(`Total de usuários: ${connectedUsers.length}`)

    socket.broadcast.emit('list-update', {
      left: socket.username,
      list: connectedUsers,
    });
  });

  socket.on('send-msg', txt => {
    if (socket.username === undefined) {
      return;
    };

    txt = sanitizeHTML(txt);

    if (txt) {
      let obj = {
        username: socket.username,
        message: txt,
      };

      socket.emit('show-msg', obj);
      socket.broadcast.emit('show-msg', obj);
    };
  });
});