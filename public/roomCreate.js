var socket = io.connect('http://localhost:8080');

console.log('hello world')

// const createBtn = document.getElementById('createBtn');
// const assignRoomName = document.getElementById('assignRoomName');
// const roomList = document.getElementById('roomList')
const roomList = document.getElementsByClassName('roomList')

// createBtn.addEventListener('click', () => {
//   socket.emit('creatingRoom', {
//     roomName: assignRoomName.value
//   });
// });

//====================================================

const gameList = document.getElementsByClassName('game');
for (let game of gameList) {
  // console.log(game)
  const gameShower = document.getElementById(game.value)
  game.addEventListener('click', (event) => {
    for (let gameBar of roomList) {
      gameBar.style.display = "none";
    }
    gameShower.style.display = "block";
  })
}

$(document).ready(() => {
  
  $('.room').on('click', function () {
    const roomId = $(this).attr('data-roomid');
    const gameId = $(this).attr('data-gameid')
    socket.emit('joinARoom', {roomId: roomId, gameId: gameId})
  });
});

socket.on('updateUserList', (data) => {
  logs.innerHTML = "";
  for (let key in data) {
    logs.innerHTML += `<p>${key}</p>`
  };
});

//====================================================

// let createdRooms = document.getElementsByClassName('createdRooms');

// for (let room of createdRooms) {
//   room.addEventListener("click", () => {
//     socket.emit('joiningRoom', room.value)
//   })
// }

// socket.on('creatingRoom', (data) => {
//   console.log('2')

//   const btn = document.createElement('button');
//   btn.addEventListener('click', () => {
//     console.log('Hello hi')
//     socket.emit('joiningRoom', data.roomName)
//   })
//   btn.innerHTML = data.roomName;
//   roomList.appendChild(btn);
// });

// const logs = document.getElementById('logs');

// socket.on('addingNewUser', (data) => {
//   logs.innerHTML ="";
//   for (let key in data) {
//     logs.innerHTML += `<p>${key}</p>`
//   }
// });