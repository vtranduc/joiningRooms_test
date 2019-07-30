const express = require('express');
var socket = require('socket.io');

// App setup

var app = express();
var server = app.listen(8080, () => {
  console.log('Port ready on 8080');
});

// Static files

app.use('/public', express.static('./public'));

app.set("view engine", "ejs");


// // Socket setup

var io = socket(server);

room_data = {
  rabbit: {},
  dog: {},
  Woodpecker: {}
};

app.get("/", (req, res) => {
  res.render("lobby", {room_data: room_data})
})


io.on('connection', (socket) => {

  console.log(socket.id)

  socket.on('creatingRoom', (data) => {
    if (room_data[data.roomName]) {
    } else {
      room_data[data.roomName] = {};
      io.sockets.emit('creatingRoom', data)
    }
  });


  socket.on('joiningRoom', (data) => {
    socket.join(data);
    var clients = io.sockets.adapter.rooms[data].sockets;
    io.sockets.to(data).emit('addingNewUser', clients);
  });

});