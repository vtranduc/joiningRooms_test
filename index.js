const express = require('express');
var socket = require('socket.io');
const bodyParser = require("body-parser");

// Example data

let game_data = {
  whosbigger:{
    max_players: 3,
    min_players: 2,
    room_data: {
      woodpecker: {
        passcode: null,
        joinedPlayers: []
      },
      dragon: {
        passcode: null,
        joinedPlayers: []
      },
      hippo: {
        passcode: 'aaa',
        joinedPlayers: []
      }
    }
  },
  kingsCup: {
    max_players: 8,
    min_players: 2,
    room_data: {
      woofpecker: {
        passcode: null,
        joinedPlayers: []
      }
    }
  },
  goofy: {
    max_players: 8,
    min_players: 2,
    room_data: {
    }
  },
  blackjack: {
    max_players: 8,
    min_players: 2,
    room_data: {
    }
  }
}

module.exports = {game_data};

// App initialization

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
  });
});

app.post('/createRoom', function(req, res) {
  const refinedName = nameRefine(req.body.selectedName);
  if (validateNewRoom(refinedName, req.body.gameName, game_data)) {
    res.send(refinedName);
  } else {
    console.log('This name is invalid');
  };
});

// app.post('/enterGame/:roomId', (req, res) => {
//   res.render('testRedirect', {roomId: req.params.roomId})
// });

app.get('/enterGame/:uniqueRoomName', (req, res) => {
  console.log('GAME HERE BOYS');
  res.render('testRedirect')
});

// Socket setup

var io = socket(server);

io.on('connection', (socket) => {

  console.log(socket.id);

  // The room the user is currently joined in

  let currentRoom;

  // Handle the event when the user is disconnected

  socket.on('disconnect', () => {

    if (!currentRoom) {
      return
    }
    let room_info = io.sockets.adapter.rooms[currentRoom];
    let roomGameId = getRoomGameId(currentRoom);
    if (room_info) {
      if (Object.keys(room_info.sockets).length < game_data[roomGameId.gameId].min_players) {
        game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers = [];
      };
      io.sockets.to(currentRoom).emit('updateRoomStatus', [
        Object.keys(room_info.sockets),
        currentRoom,
        game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers,
        socket.id,
        game_data[roomGameId.gameId].min_players
      ]);
    } else {
      game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers = [];
    }
  })

  // Create new room

  socket.on('createNewRoom', (data) => {
    inserNewRoom(data.roomId, data.gameId, data.passcode, game_data);
    io.sockets.emit('createNewRoom', data);
  });

  // Join a room

  socket.on('joinARoom', (data) => {

    // Check number of users

    const numberOfExistingUsers = getNumberOfUsers(data.gameId, data.roomId, io);
    if (numberOfExistingUsers >= game_data[data.gameId].max_players) {
      console.log('Room is full')
      return;
    }

    // Check to see if user is trying to join the room he/she has already joined

    const uniqueRoomName = `${data.gameId}-${data.roomId}`;
    const joinedRooms = getJoinedRooms(game_data, io, socket.id);
    if (joinedRooms.includes(uniqueRoomName)) {
      return;
    };

    // Leave all the rooms

    for (let joinedRoom of joinedRooms) {
      socket.leave(joinedRoom);
      let room_info = io.sockets.adapter.rooms[joinedRoom];
      let roomGameId = getRoomGameId(joinedRoom);
      if (room_info) {
        if (Object.keys(room_info.sockets).length < game_data[roomGameId.gameId].min_players) {
          // console.log('delete all')
          game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers = [];
        };
        io.sockets.to(joinedRoom).emit('updateRoomStatus', [
          Object.keys(room_info.sockets),
          joinedRoom,
          game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers,
          socket.id,
          game_data[roomGameId.gameId].min_players
        ]);
      } else {
        game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers = [];
      }
    }

    // Join the room
    
    currentRoom = uniqueRoomName;
    socket.join(uniqueRoomName);
    const clients = io.sockets.adapter.rooms[uniqueRoomName].sockets;
    // io.sockets.to(uniqueRoomName).emit('updateUserList', [
    //   Object.keys(clients),
    //   Object.keys(clients).length >= game_data[data.gameId].min_players,
    //   currentRoom,
    //   null
    // ]);
    io.sockets.to(uniqueRoomName).emit('updateRoomStatus', [
      Object.keys(clients),
      currentRoom,
      game_data[data.gameId].room_data[data.roomId].joinedPlayers,
      socket.id,
      game_data[data.gameId].min_players
    ]);
  });


  // Trigger user joining event

  socket.on('handleJoinGameEvent', (data) => {
    // console.log('let user join')

    const clients = io.sockets.adapter.rooms[currentRoom].sockets;
    const roomGameId = getRoomGameId(currentRoom);
    game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers.push(socket.id);
    if (Object.keys(clients).length > game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers.length) {
      io.sockets.to(currentRoom).emit('updateRoomStatus', [
        Object.keys(clients),
        currentRoom,
        game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers,
        socket.id,
        game_data[roomGameId.gameId].min_players
      ]);
      // console.log('hello?')
    } else if (Object.keys(clients).length === game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers.length) {
      // console.log("GO NOW")

      io.sockets.to(currentRoom).emit('directToGame', {uniqueRoomName: currentRoom});

    }

    // console.log(Object.keys(clients).length);
    // console.log(game_data[roomGameId.gameId].room_data[roomGameId.roomId].joinedPlayers.length)
    // console.log('sup')
    // io.sockets.to(currentRoom).emit('directToGame', currentRoom)
  });

});

//==================================================================================
//==================================================================================
//==================================================================================
//=============== HELPER FUNCTIONS =================================================
//==================================================================================
//==================================================================================
//==================================================================================

//

// This helps to determine whether the player should 

// Break down room name to obtain gameId and roomId

const getRoomGameId = function(room) {
  for (let i = 0; i < room.length; i++) {
    if (room[i] === '-') {
      return {gameId: room.slice(0, i), roomId: room.slice(i+1)};
    };
  };
};


// Get current number of users in the room

const getNumberOfUsers = function(gameId, roomId, io) {
  const room_data = io.sockets.adapter.rooms[`${gameId}-${roomId}`];
  if (room_data) {
    return Object.keys(room_data.sockets).length;
  } else {
    return 0;
  }
};

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

// This goes to check if the name for room already exists for specific game
// and whether the name is acceptable

const validateNewRoom = function(roomName, gameName, game_data) {
  if (roomName === "") {
    return false;
  }
  if (game_data[gameName].room_data[roomName]) {
    return false;
  }
  return true;
};

// This adds new room to the data

const inserNewRoom = function(roomId, gameId, passcode, game_data) {
  game_data[gameId].room_data[roomId] = {
    passcode: passcode,
    joinedPlayers: []
  };
};

// This removes the spaces at the end for the new room's name

const nameRefine = function(name) {
  let output = name;
  if (output === '') {
    return output;
  };
  for (let i = 0; i < output.length; i++) {
    if (output[i] !== ' ') {
      output = output.slice(i);
      break;
    }
  }
  for (let i = output.length - 1; i >= 0; i--) {
    if (output[i] !== ' ') {
      return output.slice(0, i + 1);
    }
  }
  return '';
};