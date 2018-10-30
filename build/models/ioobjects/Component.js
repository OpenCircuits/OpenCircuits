"use strict";

var Vector = require("../../utils/math/Vector");
var Transform = require("../../utils/math/Transform");
var V = Vector.V;

var IOObject = require("./IOObject");
var Wire = require("./Wire");
var InputPort = require("./InputPort");
var OutputPort = require("./OutputPort");

class Component extends IOObject {

	// constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
	constructor(numInputs, numOutputs, isPressable, size = V(1, 1)) {
		super();

		this.inputs = [];
		this.outputs = [];

		this.transform = new Transform(V(0, 0), size, 0);

		// Create and initialize each port
		for (var i = 0; i < numInputs; i++) this.inputs.push(new InputPort(this));
		for (var i = 0; i < numOutputs; i++) this.outputs.push(new OutputPort(this));
	}

	// @Override
	activate(signal, i = 0) {
		// Don't try to activate an Output component since it has no outputs
		if (this.outputs.length == 0) return;

		this.outputs[i].activate(signal);
	}

	connect(i, w) {
		this.outputs[i].connect(w);
	}

	setInput(i, w) {
		this.inputs[i].setInput(w);
	}

	setPos(v) {
		this.transform.setPos(v);
	}

	getInput(i) {
		return this.inputs[i];
	}

	getOutput(i) {
		return this.outputs[i];
	}

	getTransform() {
		return this.transform;
	}

	getImageName() {
		return "base.svg";
	}
}

module.exports = Component;