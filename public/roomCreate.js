var socket = io.connect('http://localhost:8080');

console.log('hello world')

// Handle socket response

// --------------------------

// socket.on('resolvePasscode', (data) => {
  
// });

// --------------------------

socket.on('updateUserList', (data) => {
  logs.innerHTML = "";
  console.log(data[1])
  for (let key of data[0]) {
    logs.innerHTML += `<p>${key}</p>`
  };
  if (data[1]) {
    // <form method="POST" action="/testRedirect">
    logs.innerHTML += `
      
        <button class="userDirector">JOIN ME!</button>
      
      `;
    
  };
});

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

$(document).ready(() => {
  roomJoiner();
  dynamicRoom();
  showRoomsForGame();
  userRedirection();
});

// To be loaded on jquery when DOM is ready

const userRedirection = function() {
  $('.userDirector').on('click', function() {
    console.log('kotoko')
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