import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import cryptojs from "crypto-js";
import "../App.css";

const Room = ({ socket }) => {
  const [userData, setUserData] = useState({});
  const [redirect, setRedirect] = useState(false);
  const [serverUp, setServerUp] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setUserData({ ...userData, name });
  };

  const handleRoomChange = (e) => {
    const room = e.target.value;
    setUserData({ ...userData, room });
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (userData.name && userData.room) {
      setRedirect(true);
      let ciphertext = cryptojs.AES.encrypt(
        JSON.stringify(userData),
        "<Enter Your Secret Key>"
      ).toString();
      socket.emit("join-room", ciphertext);
    } else {
      alert("Please fill required details!");
    }
  };

  const fetch = () => {
    axios
      .get("<Backend url>")
      .then((result) => {
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
          <button className="btn btn-primary" onClick={handleClick}>
            Enter
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
      </div>
    </div>
  );
};

export default Room;
