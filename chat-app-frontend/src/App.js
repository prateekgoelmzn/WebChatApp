import "./App.css";
import React from "react";
import socketIOClient from "socket.io-client";
import Router from "./Router";

const ENDPOINT2 = "server url";
let socket = socketIOClient(ENDPOINT2);

function App() {
  console.clear();
  return (
    <div>
      <Router socket={socket} />
    </div>
  );
}

export default App;
