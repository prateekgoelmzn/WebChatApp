import React from "react";
import { Switch, Route } from "react-router-dom";
import Board from "./components/Board";
import Room from "./components/Room";
import Infopage from "./components/infopage";


const Routes = ({ socket }) => (
  <Switch>
    <Route
      exact
      path="/"
      render={(props) => <Room {...props} socket={socket} />}
    />
    <Route
      path="/info"
      render={(props) => <Infopage {...props} socket={socket} />}
    />
    <Route
      path="/tic-tac-toe"
      render={(props) => <Board {...props} socket={socket} />}
    />
  </Switch>
);

export default Routes;
