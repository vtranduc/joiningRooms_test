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

// return

io.on('connection', (socket) => {

  console.log(socket.id)

  socket.on('creatingRoom', (data) => {
    if (room_data[data.roomName]) {
    } else {
      room_data[data.roomName] = {};
      console.log(room_data);
      io.sockets.emit('creatingRoom', data)
    }
  });

  //========================================================

  socket.on('joiningRoom', (data) => {
    console.log('look here')
    console.log(data);
    socket.join(data);

    // console.log(socket.rooms);

    var clients = io.sockets.adapter.rooms[data].sockets;

    console.log(io.sockets.adapter.rooms)

    console.log(000000000000000000000000000000000)
    console.log(clients);


    // console.log(socket.rooms)
    // console.log('makes sense')

    // var clients = io.sockets.clients('room');

    // console.log(clients)

    // console.log(io.sockets.clients(cl))

    // clients = io.of('/')

    // io.to(data).emit('addingNewUser', socket.id);
    // socket.broadcast.to(data).emit('addingNewUser', socket.id);

    io.sockets.to(data).emit('addingNewUser', clients);
    // socket.to(data).emit('addingNewUser', socket.id);

  });

  

  //===========================================================

});


// const exitRoom = function(socket, roomSocket, userKey) {
//   for (let key in roomSocket) {
//     if (let key of roomSocket) {

//     }
//   }
// };