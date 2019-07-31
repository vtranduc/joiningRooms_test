var socket = io.connect('http://localhost:8080');

console.log('hello world')

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
  newBtn.setAttribute('class', 'room');
  document.getElementById('availableRoomsFor' + data.gameId).appendChild(newBtn);
});

// Loading jquery

$(document).ready(() => {
  roomJoiner();
  dynamicRoom();
  showRoomsForGame();
});

// To be loaded on jquery when DOM is ready

const roomJoiner = function() {
  $('.room').on('click', function () {
    socket.emit('joinARoom', {
      roomId: $(this).attr('data-roomid'),
      gameId: $(this).attr('data-gameid')
    });
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
    });
  });
};

const showRoomsForGame = function() {
  $('.game').on('click', function(event) {
    $('.roomList').hide();
    $(`#${$(this).attr('data-gamename')}`).toggle(500);
  })
};