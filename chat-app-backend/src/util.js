let map = new Map();
let rooms = new Map();

let users = {
  add: (name, socket, room) => {
    // if user not exist
    if (!map.has(socket.id)) {
      map.set(socket.id, { id: socket.id, name, socket, room });
    }
    // if a user with same name alraedy exist
    else {
      //let arr = map.get(socket.id);
      map.set(socket.id, {
        id: socket.id,
        name,
        socket,
        room
      });
    }

    if (rooms.has(room)) {
      let arr = rooms.get(room);
      rooms.set(room, [...arr, socket.id]);
    } else {
      rooms.set(room, [socket.id]);
    }

    //console.log(map);
    //console.log(rooms);
  },
  remove: (socketId) => {
    //get room name and remove element from user map
    if (map.get(socketId)) {
      let roomName = map.get(socketId).room;
      let userName = map.get(socketId).name;
      map.delete(socketId);

      let roomArr = rooms.get(roomName);
      let idx = roomArr.findIndex((ele) => ele === socketId);
      if (idx !== -1) {
        roomArr.splice(idx, 1);
      }
      rooms.set(roomName, roomArr);

      //console.log(rooms);
      //console.log(map);

      return { room: roomName, name: userName };
    }
  },
  usersInRoom: (room) => {
    let socketArr = rooms.get(room);
    let arr = [];
    if (socketArr) {
      [...socketArr].forEach((element) => {
        arr.push(map.get(element).name);
      });
    }
    return arr;
  },
  getName: (socketId) => {
    if (map.get(socketId)) {
      return map.get(socketId).name;
    }
  },
  getRoom: (socketId) => {
    if (map.has(socketId)) {
      return map.get(socketId).room;
    }
  },
  totalUserInRoom: (roomName) => {
    return rooms.get(roomName).length;
  },
  createRoom: (roomName) => {
    rooms.set(roomName, []);
  },
  removeRoom: (roomName) => {
    rooms.delete(roomName);
  }
};

module.exports = users;
