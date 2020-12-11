var cryptojs = require("crypto-js");

let map = new Map();
let rooms = new Map();
let tictactoerooms = new Map();
const seckey = process.env.seckey;

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
      if (roomArr !== undefined) {
        let idx = roomArr.findIndex((ele) => ele === socketId);
        if (idx !== -1) {
          roomArr.splice(idx, 1);
        }
        rooms.set(roomName, roomArr);
      }

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
  },
  createTicTacToeRoom: (roomName) => {
    tictactoerooms.set(roomName, []);
  },
  removeTicTacToeRoom: (roomName) => {
    tictactoerooms.delete(roomName);
  },
  addUsersTicTacToeRoom: (name, socket, room) => {
    // if rooms already exists, it means someone already joined
    if (tictactoerooms.has(room)) {
      // fetch array associated with room name
      let arr = tictactoerooms.get(room);

      // if 2 persons are already there, we can not allow more.
      if (arr.length >= 2) {
        return false;
      }
      // else we add socketid of person in room
      else {
        tictactoerooms.set(room, [...arr, socket.id]);
      }
    }
    // if room not exist already,then we create room as well as add socket id in that room.
    else {
      tictactoerooms.set(room, [socket.id]);
    }

    //if users no exist already than we add that into map else not
    if (!map.has(socket.id)) {
      map.set(socket.id, { id: socket.id, name, socket, room });
    }

    return true;
  },
  removeUsersTicTacToeRoom: (socketId) => {
    //get room name and remove element from user map
    if (map.get(socketId)) {
      let roomName = map.get(socketId).room;
      let userName = map.get(socketId).name;
      map.delete(socketId);

      let roomArr = tictactoerooms.get(roomName);
      let idx = roomArr.findIndex((ele) => ele === socketId);
      if (idx !== -1) {
        roomArr.splice(idx, 1);
      }
      tictactoerooms.set(roomName, roomArr);

      //console.log(rooms);
      //console.log(map);

      return { room: roomName, name: userName };
    }
  },
  usersInPlayRoom: (room) => {
    let socketArr = tictactoerooms.get(room);
    let arr = [];
    if (socketArr) {
      [...socketArr].forEach((element) => {
        if (map.get(element)) {
          arr.push({
            name: map.get(element).name,
            socketid: map.get(element).id
          });
        }
      });
    }
    return arr;
  }
};

let dataOpr = {
  encrypt: (data) => {
    return cryptojs.AES.encrypt(JSON.stringify(data), seckey).toString();
  },
  decrypt: (cipherData) => {
    let bytes = cryptojs.AES.decrypt(cipherData, seckey);
    let data = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
    return data;
  }
};

module.exports = { users, dataOpr };
