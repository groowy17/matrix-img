import React, { Component } from "react";
import "./Loader.scss";

class Loader extends Component {
  render() {
    return (
      <div className="loader">
        <div className="loader__item">Loading...</div>
      </div>
    );
  }
}

export default Loader;
