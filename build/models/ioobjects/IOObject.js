"use strict";

var CircuitDesigner = require("../CircuitDesigner");

class IOObject {

  constructor() {}

  activate(signal, i = 0) {}

  setDesigner(designer) {
    this.designer = designer;
  }

  getDesigner() {
    return this.designer;
  }

}

module.exports = IOObject;