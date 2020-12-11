const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
var cryptojs = require("crypto-js");
const users = require("./util");

const app = express();
const server = http.createServer(app);

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
    extended: true
  })
);

app.use(bodyParser.json());

app.get("/golive", (req, res) => {
  res.send({ live: true }).status(200);
});

io.on("connection", (socket) => {
  socket.on("join-room", (cipherData) => {
    let bytes = cryptojs.AES.decrypt(cipherData, "<Enter Your Secret Key>");
    let data = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
    users.add(data.name, socket, data.room);
    socket.join(data.room);
    socket.emit(
      "join-room-message",
      cryptojs.AES.encrypt(
        JSON.stringify({
          socketId: socket.id,
          name: data.name
        }),
        "<Enter Your Secret Key>"
      ).toString()
    );

    socket.to(data.room).emit(
      "another-user-text",
      cryptojs.AES.encrypt(
        JSON.stringify({
          type: "join",
          msg: `${data.name} Joined!`,
          socketId: socket.id
        }),
        "<Enter Your Secret Key>"
      ).toString()
    );

    io.in(users.getRoom(socket.id)).emit(
      "users-in-room",
      cryptojs.AES.encrypt(
        JSON.stringify(users.usersInRoom(users.getRoom(socket.id))),
        "<Enter Your Secret Key>"
      ).toString()
    );
  });

  socket.on("leave-room", () => {
    let data = users.remove(socket.id);
    if (data && data.room && data.name) {
      socket.to(data.room).emit(
        "another-user-text",
        cryptojs.AES.encrypt(
          JSON.stringify({
            type: "left",
            msg: `${data.name} Left!`,
            socketId: socket.id
          }),
          "<Enter Your Secret Key>"
        ).toString()
      );
      io.in(data.room).emit(
        "users-in-room",
        cryptojs.AES.encrypt(
          JSON.stringify(users.usersInRoom(data.room)),
          "<Enter Your Secret Key>"
        ).toString()
      );
    }
    socket.leave(users.getRoom(socket.id));
  });

  socket.on("user-text", (cipherData) => {
    let bytes = cryptojs.AES.decrypt(cipherData, "<Enter Your Secret Key>");
    let data = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
    const text = `${users.getName(socket.id)} : ${data}`;
    let room = users.getRoom(socket.id);
    io.in(room).emit(
      "another-user-text",
      cryptojs.AES.encrypt(
        JSON.stringify({
          type: "message",
          msg: text,
          socketId: socket.id
        }),
        "<Enter Your Secret Key>"
      ).toString()
    );
  });

  socket.on("disconnect", () => {
    let data = users.remove(socket.id);
    if (data && data.room && data.name) {
      socket.to(data.room).emit(
        "another-user-text",
        cryptojs.AES.encrypt(
          JSON.stringify({
            type: "left",
            msg: `${data.name} Left!`,
            socketId: socket.id
          }),
          "<Enter Your Secret Key>"
        ).toString()
      );
      io.in(data.room).emit(
        "users-in-room",
        cryptojs.AES.encrypt(
          JSON.stringify(users.usersInRoom(data.room)),
          "<Enter Your Secret Key>"
        ).toString()
      );
    }
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server has started.`)
);
