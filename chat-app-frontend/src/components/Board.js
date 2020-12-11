import React, { useState, useEffect } from "react";
import Box from "./Box.js";
import swal from "sweetalert";
import dataOpr from "../util";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";
import "./tictactoe.css";

const Borad = ({ socket }) => {
  let [roomFull, setRoomFull] = useState(false);
  let initialBoard = [
    ["-", "-", "-"],
    ["-", "-", "-"],
    ["-", "-", "-"]
  ];
  let [board, setBoard] = useState(initialBoard);
  let [filledCount, setFilledCount] = useState(0);
  let [turn, setTurn] = useState("x");
  let [joinedusers, setJoinedusers] = useState([]);
  let [userstate, setUserstate] = useState({});
  let [anotherUsersNotifcations, setAnotherUsersNotifications] = useState([]);
  const [redirect, setRedirect] = useState(false);

  //let [lastIndex,setLastIndex] = useState([]);

  useEffect(() => {
    socket.on("playroom-full", () => {
      setRoomFull(true);
    });
    // When user self joined in room
    socket.on("join-play-room-message", (cipherData) => {
      let dataObj = dataOpr.decrypt(cipherData);
      setUserstate({ ...dataObj });
    });
    socket.on("another-user-text-playroom", (cipherData) => {
      let dataObj = dataOpr.decrypt(cipherData);
      setAnotherUsersNotifications([...anotherUsersNotifcations, dataObj.msg]);
    });
    socket.on("users-in-playroom", (cipherData) => {
      let usersarr = dataOpr.decrypt(cipherData);
      console.log(usersarr);
      setJoinedusers([...usersarr]);
    });

    socket.on("set-board-state", (boardstate) => {
      setBoard(boardstate.board);
      setFilledCount(boardstate.filledCount);
      setTurn(boardstate.turn);
    });

    socket.on("notify-win", ({ title, text }) => {
      swal({
        title: title,
        text: text,
        icon: "success",
        button: "Play Again"
      });
    });
  });

  const leavePlayRoom = (e) => {
    e.preventDefault();
    socket.emit("leave-playroom");
    socket.emit("board-state", {
      filledCount: 0,
      board: initialBoard,
      turn: "x"
    });
    setRedirect(true);
  };

  let handleClick = (index, idx) => {
    if (userstate.turn === turn) {
      if (board[index][idx] === "-") {
        board[index][idx] = turn;

        socket.emit("board-state", {
          filledCount: filledCount + 1,
          board: board,
          turn: turn === "x" ? "o" : "x"
        });
      }

      whoWins();
      if (filledCount === 8) {
        socket.emit("win-info", {
          title: "Game Fininsh!",
          text: "No Player wins"
        });
        socket.emit("board-state", {
          filledCount: 0,
          board: initialBoard,
          turn: "x"
        });
      }
    }
  };

  let whoWins = () => {
    if (
      checkEachRow("x") === true ||
      checkEachColumn("x") === true ||
      checkBothDiagonal("x") === true
    ) {
      socket.emit("win-info", {
        title: "Congrats!",
        text: `${userstate.name} win`
      });
      socket.emit("board-state", {
        filledCount: 0,
        board: initialBoard,
        turn: "x"
      });
    } else if (
      checkEachRow("o") === true ||
      checkEachColumn("o") === true ||
      checkBothDiagonal("o") === true
    ) {
      socket.emit("win-info", {
        title: "Congrats!",
        text: `${userstate.name} win`
      });

      socket.emit("board-state", {
        filledCount: 0,
        board: initialBoard,
        turn: "x"
      });
    }
  };

  let checkEachRow = (forWhom) => {
    let result = false;
    board.forEach((element, idx) => {
      let count = 0;
      element.forEach((e) => {
        if (e === forWhom) {
          count++;
        }
      });
      if (count === board.length) result = true;
    });

    return result;
  };

  let checkEachColumn = (forWhom) => {
    let result = false;
    Array(board.length)
      .fill()
      .forEach((_, element) => {
        let count = 0;
        Array(board.length)
          .fill()
          .forEach((__, ele) => {
            if (board[ele][element] === forWhom) {
              count++;
            }
          });
        if (count === board.length) result = true;
      });

    return result;
  };

  let checkBothDiagonal = (forWhom) => {
    let left = 0;
    let right = 0;
    Array(board.length)
      .fill()
      .forEach((_, element) => {
        if (board[element][element] === forWhom) {
          left++;
        }
        if (board[element][board.length - 1 - element] === forWhom) {
          right++;
        }
      });
    return left === board.length || right === board.length;
  };

  return roomFull === true ? (
    <div className="alert alert-primary mt-5 ml-5 mr-5" role="alert">
      <b>Room already occupied by 2 players, please create another room.</b>
      <br />
      <Link to="/">Back to home page</Link>
    </div>
  ) : joinedusers.length < 2 ? (
    <div className="alert alert-primary mt-5 ml-5 mr-5" role="alert">
      Please wait for you opponent or ask your opponent to join{" "}
      <b>{userstate.roomname}</b>
      <br />
      <button className="btn btn-danger" onClick={leavePlayRoom}>
        Exit!
      </button>
      {redirect === true ? (
        <Redirect
          to={{
            pathname: "/"
          }}
        />
      ) : (
        ""
      )}
    </div>
  ) : (
    <div className="container">
      <div className="">
        {joinedusers.map((element, index) => {
          if (element.socketid === userstate.socketId) {
            return (
              <p
                className="float-left you"
                key={index}
              >{`You : ${element.name}`}</p>
            );
          } else {
            return (
              <p
                className="float-right opponent"
                key={index}
              >{`Opponent : ${element.name}`}</p>
            );
          }
        })}
        <br />
      </div>
      <div className="container w-50 p-2 my-5 mt-5">
        <p>
          {userstate.turn === turn
            ? "Your turn!"
            : "Wait for opponent response..."}
        </p>
        <table id="board">
          {board.map((ele, index) => {
            return (
              <tr key={index}>
                {ele.map((e, idx) => {
                  return (
                    <td>
                      <Box
                        key={idx}
                        value={e}
                        handleClick={() => handleClick(index, idx)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </table>
      </div>
      <button
        className="btn btn-danger btn-lg btn-block"
        onClick={leavePlayRoom}
      >
        Exit!
      </button>
      {redirect === true ? (
        <Redirect
          to={{
            pathname: "/"
          }}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default Borad;
