"use strict";

var V = require("../../math/Vector").V;
var Renderer = require("../Renderer");
var Camera = require("../../Camera");
var Wire = require("../../../models/ioobjects/Wire");

var WireRenderer = function () {
    return {
        render(renderer, camera, wire) {}
    };
}();

module.exports = WireRenderer;