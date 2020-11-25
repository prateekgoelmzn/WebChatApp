import "./App.css";
import React from "react";
import socketIOClient from "socket.io-client";
import Router from "./Router";

const ENDPOINT = "<Enter Your Backend EndPoint>";
let socket = socketIOClient(ENDPOINT);

function App() {
  return (
    <div>
      <Router socket={socket} />
    </div>
  );
}

export default App;
