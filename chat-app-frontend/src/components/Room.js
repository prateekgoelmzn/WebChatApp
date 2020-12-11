import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import dataOpr from "../util";
import "../App.css";

const Room = ({ socket }) => {
  const [userData, setUserData] = useState({});
  const [redirect, setRedirect] = useState(false);
  const [serverUp, setServerUp] = useState(false);
  const [playredirect, setPlayredirect] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setUserData({ ...userData, name });
  };

  const handleRoomChange = (e) => {
    const room = e.target.value;
    setUserData({ ...userData, room });
  };

  const handleClick = (e) => {
    //console.log(userData);
    e.preventDefault();
    //console.log(userData);
    if (userData.name && userData.room) {
      setRedirect(true);
      let ciphertext = dataOpr.encrypt(userData);
      socket.emit("join-room", ciphertext);
    } else {
      alert("Please fill required details!");
    }
  };

  const handlePlay = (e) => {
    e.preventDefault();
    if (userData.name && userData.room) {
      setPlayredirect(true);
      let ciphertext = dataOpr.encrypt(userData);
      socket.emit("join-play-room", ciphertext);
    } else {
      alert("Please fill required details!");
    }
  };

  const fetch = () => {
    axios
      .get("server url")
      .then((result) => {
        //console.log(result.status);
        setServerUp(true);
      })
      .catch((err) => {
        alert("Error: Backend is not ready!!");
        setServerUp(true);
      });
  };

  useEffect(() => fetch(), []);

  return (
    <div>
      <div className="container w-50 p-2 my-5 bg-color border border-warning rounded">
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              aria-describedby="nameHelp"
              placeholder="Enter Name"
              onChange={handleNameChange}
            />
            <small id="nameHelp" className="form-text text-white">
              {userData.name ? `Hello, ${userData.name}!` : ""}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="room">Room</label>
            <input
              type="text"
              className="form-control"
              id="room"
              placeholder="Room Name"
              onChange={handleRoomChange}
            />
          </div>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleClick}
          >
            Enter Chat Room
          </button>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handlePlay}
          >
            Play tic tac toe
          </button>
        </form>
        {serverUp === true && redirect === true ? (
          <Redirect
            to={{
              pathname: "/info",
              data: userData
            }}
          />
        ) : (
          ""
        )}
        {serverUp === true && playredirect === true ? (
          <Redirect
            to={{
              pathname: "/tic-tac-toe",
              data: userData
            }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Room;
