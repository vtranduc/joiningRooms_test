var socket = io.connect('http://localhost:8080/');

console.log('hello world')

// Handle socket response

// --------------------------

socket.on('directToGame', (data) => {
  // console.log(data)
  // window.location.href = `/enterGame/${data.uniqueRoomName}`;
  $('#lobby').slideUp(100);
  $('#showGame').toggle(1000);
})

// --------------------------
// --------------------------
// --------------------------


socket.on('updateRoomStatus', (data) => {
  logs.innerHTML = "<h1>Welcome to room " + data[1] + "<h1>";
  for (let key of data[0]) {
    if (data[2].includes(key)) {
      logs.innerHTML += `<p style="color: blue">${key} I'm ready!</p>`
    } else {
      logs.innerHTML += `<p>${key}</p>`
    }
  }
  if (data[2].includes(socket.id)) {
    $('#joinGameBtn').css("display", "none");
    $('#waitingMsg').css("display", "block");
  } else {
    if (data[0].length >= data[4]) {
      $('#joinGameBtn').css("display", "block");
    } else {
      $('#joinGameBtn').css("display", "none");
    }
    $('#waitingMsg').css("display", "none");
  }
});


// --------------------------
// --------------------------
// --------------------------

socket.on('moveUsers', (data) => {
  alert('MOVE!')
})

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

$(document).ready(function() {
  roomJoiner();
  dynamicRoom();
  showRoomsForGame();
  // userRedirection();
  loadJoinGameBtn();
});


// To be loaded on jquery when DOM is ready


const loadJoinGameBtn = function() {
  $('#joinGameBtn').on('click', function() {
    socket.emit('handleJoinGameEvent');
  });
};

const roomJoiner = function() {
  $('.room').on('click', function () {

    // IMPORTANT //
    // const enteredPasscode = prompt('This room is locked. Enter passcode here')
    // console.log(enteredPasscode)
    // console.log('ENDING MAS')
    // return;
    //////////////////////

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
      socket.emit('createNewRoom', {
        roomId: data,
        gameId: gameId,
        passcode: $(`#chosenPasscodeFor${gameId}`).val()
      });
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