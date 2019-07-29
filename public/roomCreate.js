var socket = io.connect('http://localhost:8080');

console.log('hello world')

const createBtn = document.getElementById('createBtn');
const assignRoomName = document.getElementById('assignRoomName');
const roomList = document.getElementById('roomList')

createBtn.addEventListener('click', () => {
  socket.emit('creatingRoom', {
    roomName: assignRoomName.value
  });
});



const createdRooms = document.getElementsByClassName('createdRooms');

for (let room of createdRooms) {
  console.log(room.value);

  // console.log(createRooms[room].value)

  room.addEventListener("click", () => {
    socket.emit('joiningRoom', room.value)
  })
}

socket.on('creatingRoom', (data) => {
  console.log('2')
  roomList.innerHTML += `<button>${data.roomName}</button>`;
});

//========================================================

const logs = document.getElementById('logs');

socket.on('addingNewUser', (data) => {
  // logs.innerHTML += `<p>${data} has joined the room</p>`

  logs.innerHTML ="";

  for (let key in data) {
    logs.innerHTML += `<p>${key}</p>`
  }

});


//========================================================