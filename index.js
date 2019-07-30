const express = require('express');
var socket = require('socket.io');

// App setup

var app = express();


// Static files

app.use('/public', express.static('./public'));

app.set("view engine", "ejs");

var server = app.listen(8080, () => {
  console.log('Port ready on 8080');
});

// Initializing the browser

app.get("/", (req, res) => {
  res.render("lobby", {game_data
  })
})

// // Socket setup

var io = socket(server);

game_data ={
  whosbigger:{
    room_data: {
      woodpecker: {},
      dragon: {},
      hippo: {}
    }
  },
  kingsCup: {room_data: {woofpecker: {}}},
  goofy: {room_data: {}}
}

io.on('connection', (socket) => {

  console.log(socket.id)

  // socket.on('creatingRoom', (data) => {
  //   if (room_data[data.roomName]) {
  //   } else {
  //     room_data[data.roomName] = {};
  //     io.sockets.emit('creatingRoom', data)
  //   }
  // });


  // socket.on('joiningRoom', (data) => {
  //   socket.join(data);
  //   var clients = io.sockets.adapter.rooms[data].sockets;
  //   io.sockets.to(data).emit('addingNewUser', clients);
  // });


  socket.on('joinARoom', (data) => {

    // Check to see if user is trying to join the room he/she has already joined

    const uniqueRoomName = `${data.gameId}-${data.roomId}`;
    const joinedRooms = getJoinedRooms(game_data, io, socket.id);
    if (joinedRooms.includes(uniqueRoomName)) {
      return;
    };

    // Leave all the rooms

    for (joinedRoom of joinedRooms) {
      socket.leave(joinedRoom);
      let room_info = io.sockets.adapter.rooms[joinedRoom];
      if (room_info) {
        io.sockets.to(joinedRoom).emit('updateUserList', room_info.sockets);
      }
    }

    // Join the room
    
    socket.join(uniqueRoomName);
    var clients = io.sockets.adapter.rooms[uniqueRoomName].sockets;
    io.sockets.to(uniqueRoomName).emit('updateUserList', clients);
  });

});


//=============== HELPER FUNCTIONS =================================================

// This function obtains all the rooms the user is joined.
// Note that it may return more than 1 room

const getJoinedRooms = function(game_data, io, userID) {
  output = [];
  for (let gameName in game_data) {
    for (let roomName in game_data[gameName].room_data) {
      let room_data = io.sockets.adapter.rooms[`${gameName}-${roomName}`];
      if (room_data) {
        if (room_data.sockets[userID]) {
          output.push(`${gameName}-${roomName}`);
        }
      }
    }
  }
  return output;
};