var socket = io.connect('http://localhost:8080');

console.log('hello world')

//====================================================

const roomList = document.getElementsByClassName('roomList')
const gameList = document.getElementsByClassName('game');
for (let game of gameList) {
  const gameShower = document.getElementById(game.value)
  game.addEventListener('click', (event) => {
    for (let gameBar of roomList) {
      gameBar.style.display = "none";
    }
    gameShower.style.display = "block";
  })
}

//////////////////////////////// FIXXXXXXXXXXXXXXXXX

const showRoomsForGame = function() {

};


// Handle socket response

socket.on('updateUserList', (data) => {
  logs.innerHTML = "";
  for (let key in data) {
    logs.innerHTML += `<p>${key}</p>`
  };
});

socket.on('createNewRoom', (data) => {
  const newBtn = document.createElement('button');
  newBtn.addEventListener('click', () => {
    socket.emit('joinARoom', data);
  })
  newBtn.innerHTML = data.roomId;
  document.getElementById('availableRoomsFor' + data.gameId).appendChild(newBtn);
});

// Loading jquery

$(document).ready(() => {
  roomJoiner();
  dynamicRoom();
});

// To be loaded on jquery when DOM is ready

const roomJoiner = function() {
  $('.room').on('click', function () {
    const roomId = $(this).attr('data-roomid');
    const gameId = $(this).attr('data-gameid')
    socket.emit('joinARoom', {roomId: roomId, gameId: gameId})
  });
};

const dynamicRoom = function() {
  $('.roomCreator').on('submit', function(event) {
    event.preventDefault();
    const gameId = $(this).attr('data-gamename');
    $.ajax('/createRoom', {
      type: 'POST',
      data: $(this).serialize(),
      dataType: 'text'
    }).done(function(data) {
      socket.emit('createNewRoom', {roomId: data, gameId: gameId})
    }).fail(function(error) {
      console.log('Ajax failed: ', error)
    })
  });
};