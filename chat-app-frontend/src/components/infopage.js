import React, { useState, useRef, useEffect } from "react";
import { Redirect } from "react-router-dom";
import dataOpr from "../util";
//import ReactDOM from 'react-dom';
import "../App.css";

const Infopage = ({ socket }) => {
  const bottomRef = useRef();

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const [userText, setUserText] = useState("");
  const [userTexts, setUserTexts] = useState([]);
  const [message, setMessage] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [roomname, setRoomname] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [toggle, setToggle] = useState(false);

  const handleChange = (e) => {
    setUserText(e.target.value);
  };

  const handleClick = (e) => {
    e.preventDefault();
    //console.log(userText);
    if (userText !== "") {
      socket.emit("user-text", dataOpr.encrypt(userText));
      setUserText("");
    }
    //scrollToBottom();
  };

  const leaveRoom = (e) => {
    e.preventDefault();
    socket.emit("leave-room");
    setRedirect(true);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("join-room-message", (cipherData) => {
      let infoObj = dataOpr.decrypt(cipherData);
      setMessage([...message, infoObj.name]);
      setSocketId(infoObj.socketId);
      setRoomname(infoObj.roomname);
    });
    socket.on("users-in-room", (cipherData) => {
      let users = dataOpr.decrypt(cipherData);
      setUsersInRoom([...users]);
    });
    socket.on("another-user-text", (cipherData) => {
      let textObj = dataOpr.decrypt(cipherData);
      setUserTexts([...userTexts, textObj]);
    });
    return () => {
      socket.off();
    };
  });

  /*  
  const openNav = () => {
    document.getElementById("mySidebar").style.width = "250px";
  };
*/
  const closeNav = () => {
    document.getElementById("mySidebar").style.width = "0";
  };

  const toggleNav = () => {
    if (toggle === false) {
      document.getElementById("mySidebar").style.width = "250px";
      setToggle(true);
    } else if (toggle === true) {
      document.getElementById("mySidebar").style.width = "0";
      setToggle(false);
    }
  };

  //whenever userTexts updated
  useEffect(() => {
    scrollToBottom();
  }, [userTexts]);

  //initial mount
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div>
      <div id="mySidebar" className="sidebar mt-ud">
        {
          // eslint-disable-next-line
          <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>
            ×
          </a>
        }
        <span className="badge badge-primary">
          <svg
            width="5em"
            height="5em"
            viewBox="0 0 16 16"
            className="bi bi-people"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1h7.956a.274.274 0 0 0 .014-.002l.008-.002c-.002-.264-.167-1.03-.76-1.72C13.688 10.629 12.718 10 11 10c-1.717 0-2.687.63-3.24 1.276-.593.69-.759 1.457-.76 1.72a1.05 1.05 0 0 0 .022.004zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10c-1.668.02-2.615.64-3.16 1.276C1.163 11.97 1 12.739 1 13h3c0-1.045.323-2.086.92-3zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
            />
          </svg>
        </span>
        {usersInRoom.length === 0 ? (
          <p>No Participant!</p>
        ) : (
          usersInRoom.map((ele, idx) => {
            return (
              <div key={idx} className="p-2 bd-highlight">
                <span className="badge badge-success">{ele}</span>
              </div>
            );
          })
        )}
      </div>

      <nav className="navbar fixed-top  d-flex justify-content-between navbar-light bg-light">
        {message.map((ele, idx) => {
          return (
            <b key={idx}>
              {`Welcome ${ele}! `}
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                className="bi bi-emoji-smile"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                />
                <path
                  fillRule="evenodd"
                  d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683z"
                />
                <path d="M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
              </svg>
            </b>
          );
        })}

        <h4>{`Room : ${roomname}`}</h4>

        <button onClick={toggleNav} className="btn btn-primary" type="button">
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            className="bi bi-people-fill"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
            />
          </svg>
          &nbsp;
          <span>{usersInRoom.length}</span>
        </button>

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={leaveRoom}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            className="bi bi-box-arrow-in-right"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
            />
            <path
              fillRule="evenodd"
              d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
            />
          </svg>
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
      </nav>

      <hr />
      <div className="d-flex mt-ud  flex-row-reverse bd-highlight">
        {usersInRoom.map((ele, idx) => {
          return (
            <div key={idx} className="p-2 bd-highlight">
              <span className="badge badge-success">{ele}</span>
            </div>
          );
        })}
        {usersInRoom.length === 0 ? (
          <div className="p-2 bd-highlight">No Participant!</div>
        ) : (
          <div className="p-2 bd-highlight">Participants :</div>
        )}
      </div>
      <hr />
      <div>
        {userTexts.map((ele, idx) => {
          let color = "text-dark";
          let position = "containerw3-left";
          let time_position = "time-left";
          let msg = `${ele.username} : ${ele.msg}`;
          if (ele.type === "left") {
            color = "text-danger";
            msg = ele.msg;
          } else if (ele.type === "join") {
            color = "text-success";
            msg = ele.msg;
          }
          if (socketId === ele.socketId) {
            position = "containerw3-right";
            time_position = "time-right";
            msg = ele.msg;
          }
          return (
            <div className={`${position} ${color}`} key={idx}>
              <p>{msg}</p>
              <span className={`${time_position}`}>{ele.time}</span>
            </div>
          );
        })}
      </div>
      <div className="mb-ud" ref={bottomRef}></div>
      <div className="input-group mb-3 mx-5 fixed-bottom  w-75">
        <input
          type="text"
          onChange={handleChange}
          value={userText}
          className="form-control"
          placeholder="text..."
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleClick}
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              className="bi bi-reply"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M9.502 5.013a.144.144 0 0 0-.202.134V6.3a.5.5 0 0 1-.5.5c-.667 0-2.013.005-3.3.822-.984.624-1.99 1.76-2.595 3.876C3.925 10.515 5.09 9.982 6.11 9.7a8.741 8.741 0 0 1 1.921-.306 7.403 7.403 0 0 1 .798.008h.013l.005.001h.001L8.8 9.9l.05-.498a.5.5 0 0 1 .45.498v1.153c0 .108.11.176.202.134l3.984-2.933a.494.494 0 0 1 .042-.028.147.147 0 0 0 0-.252.494.494 0 0 1-.042-.028L9.502 5.013zM8.3 10.386a7.745 7.745 0 0 0-1.923.277c-1.326.368-2.896 1.201-3.94 3.08a.5.5 0 0 1-.933-.305c.464-3.71 1.886-5.662 3.46-6.66 1.245-.79 2.527-.942 3.336-.971v-.66a1.144 1.144 0 0 1 1.767-.96l3.994 2.94a1.147 1.147 0 0 1 0 1.946l-3.994 2.94a1.144 1.144 0 0 1-1.767-.96v-.667z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Infopage;
