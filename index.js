const express = require('express');
var socket = require('socket.io');
const bodyParser = require("body-parser");


// Exaple data

let game_data ={
  whosbigger:{
    max_players: 8,
    min_players: 2,
    room_data: {
      woodpecker: {passcode: null},
      dragon: {passcode: null},
      hippo: {passcode: 'aaa'}
    }
  },
  kingsCup: {
    max_players: 8,
    min_players: 2,
    room_data: {
      woofpecker: {passcode: null}
    }
  },
  goofy: {
    max_players: 8,
    min_players: 2,
    room_data: {

    }
  }
}

// App setup

var app = express();


// Set-up and start server

app.use('/public', express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
var server = app.listen(8080, () => {
  console.log('Port ready on 8080');
});

// Apps

app.get("/", (req, res) => {
  res.render("lobby", {game_data
  })
})

app.post('/createRoom', function(req, res) {
  if (validateNewRoom(req.body.selectedName, req.body.gameName, game_data)) {
    res.send(req.body.selectedName)
  } else {
    console.log('This game is invalid');
  }
})

// // Socket setup

var io = socket(server);

io.on('connection', (socket) => {

  console.log(socket.id)

  // Create new room

  socket.on('createNewRoom', (data) => {
    inserNewRoom(data.roomId, data.gameId, game_data);
    io.sockets.emit('createNewRoom', data);
  });

  // Join a room

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
    const clients = io.sockets.adapter.rooms[uniqueRoomName].sockets;
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

const validateNewRoom = function(roomName, gameName, game_data) {
  if (roomName === "") {
    return false;
  }
  if (game_data[gameName].room_data[roomName]) {
    return false;
  }
  return true;
};

const inserNewRoom = function(roomId, gameId, game_data) {
  game_data[gameId].room_data[roomId] = {};
};