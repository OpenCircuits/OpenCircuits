"use strict";

var CircuitDesigner = require("./models/CircuitDesigner");
var ANDGate = require("./models/ioobjects/gates/ANDGate");
var Switch = require("./models/ioobjects/inputs/Switch");
var LED = require("./models/ioobjects/outputs/LED");

function Start() {
    var d = new CircuitDesigner();

    var s1 = new Switch();
    var s2 = new Switch();
    var g1 = new ANDGate();
    var l1 = new LED();

    d.addObjects([s1, s2, g1, l1]);

    d.connect(s1, 0, g1, 0);
    d.connect(s2, 0, g1, 1);

    d.connect(g1, 0, l1, 0);

    s1.activate(true);

    console.log("LED active: " + l1.isOn().toString());

    s1.activate(false);
    s2.activate(true);

    console.log("LED active: " + l1.isOn().toString());

    s1.activate(true);

    console.log("LED active: " + l1.isOn().toString());
}

Start();