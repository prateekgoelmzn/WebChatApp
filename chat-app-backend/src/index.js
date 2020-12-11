const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const { users, dataOpr } = require("./util");
const app = express();
const server = http.createServer(app);

let turnmap = new Map();
let turn = "x";

const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  bodyParser.urlencoded({
    // Middleware
    extended: true
  })
);
app.use(bodyParser.json());

app.post("/getup", (req, res) => {
  //console.log(req.body);
  res.send({ live: true }).status(200);
});

app.get("/golive", (req, res) => {
  res.send({ live: true }).status(200);
});

io.on("connection", (socket) => {
  socket.on("join-room", (cipherData) => {
    let data = dataOpr.decrypt(cipherData);
    //console.log(data);
    users.add(data.name, socket, data.room);
    socket.join(data.room);
    socket.emit(
      "join-room-message",
      dataOpr.encrypt({
        socketId: socket.id,
        name: data.name,
        roomname: data.room
      })
    );
    socket.to(data.room).emit(
      "another-user-text",

      dataOpr.encrypt({
        type: "join",
        msg: `${data.name} Joined!`,
        socketId: socket.id,
        time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
      })
    );

    io.in(users.getRoom(socket.id)).emit(
      "users-in-room",
      dataOpr.encrypt(users.usersInRoom(users.getRoom(socket.id)))
    );
  });

  socket.on("join-play-room", (cipherData) => {
    let data = dataOpr.decrypt(cipherData);
    if (users.addUsersTicTacToeRoom(data.name, socket, data.room) === true) {
      socket.join(data.room);
      //console.log(turn);
      socket.emit(
        "join-play-room-message",
        dataOpr.encrypt({
          socketId: socket.id,
          name: data.name,
          roomname: data.room,
          turn: turn
        })
      );
      turnmap.set(socket.id, turn);
      turn = turn === "x" ? "o" : "x";
      socket.to(data.room).emit(
        "another-user-text-playroom",
        dataOpr.encrypt({
          type: "join",
          msg: `${data.name} Joined!`,
          socketId: socket.id,
          time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        })
      );

      io.in(data.room).emit(
        "users-in-playroom",
        dataOpr.encrypt(users.usersInPlayRoom(data.room))
      );
    } else {
      socket.emit("playroom-full");
    }
  });

  socket.on("leave-room", () => {
    let data = users.remove(socket.id);
    if (data && data.room && data.name) {
      socket.to(data.room).emit(
        "another-user-text",
        dataOpr.encrypt({
          type: "left",
          msg: `${data.name} Left!`,
          socketId: socket.id,
          time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        })
      );
      io.in(data.room).emit(
        "users-in-room",
        dataOpr.encrypt(users.usersInRoom(data.room))
      );
    }
    socket.leave(users.getRoom(socket.id));
  });

  socket.on("leave-playroom", () => {
    let data = users.removeUsersTicTacToeRoom(socket.id);
    if (data && data.room && data.name) {
      socket.to(data.room).emit(
        "another-user-text-playroom",
        dataOpr.encrypt({
          type: "left",
          msg: `${data.name} Left!`,
          socketId: socket.id,
          time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        })
      );
      io.in(data.room).emit(
        "users-in-playroom",
        dataOpr.encrypt(users.usersInPlayRoom(data.room))
      );
    }
    socket.leave(users.getRoom(socket.id));

    turn = turnmap.get(socket.id);
    turnmap.delete(socket.id);
  });

  socket.on("user-text", (cipherData) => {
    let data = dataOpr.decrypt(cipherData);
    const text = data;
    let room = users.getRoom(socket.id);
    //console.log(room);
    io.in(room).emit(
      "another-user-text",

      dataOpr.encrypt({
        type: "message",
        username: users.getName(socket.id),
        msg: text,
        socketId: socket.id,
        time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
      })
    );
  });

  socket.on("board-state", (boardstate) => {
    io.in(users.getRoom(socket.id)).emit("set-board-state", boardstate);
  });

  socket.on("win-info", (wininfo) => {
    io.in(users.getRoom(socket.id)).emit("notify-win", wininfo);
  });

  socket.on("disconnect", () => {
    let data = users.remove(socket.id);
    if (data && data.room && data.name) {
      socket.to(data.room).emit(
        "another-user-text",
        dataOpr.encrypt({
          type: "left",
          msg: `${data.name} Left!`,
          socketId: socket.id,
          time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        })
      );
      io.in(data.room).emit(
        "users-in-room",
        dataOpr.encrypt(users.usersInRoom(data.room))
      );
    }
  });
});

server.listen(process.env.PORT || 4001, () =>
  console.log(`Server has started.`)
);
