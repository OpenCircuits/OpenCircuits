"use strict";

var DEFAULT_FILL_COLOR = require("../../Constants").DEFAULT_FILL_COLOR;
var DEFAULT_BORDER_COLOR = require("../../Constants").DEFAULT_BORDER_COLOR;
var DEFAULT_ON_COLOR = require("../../Constants").DEFAULT_ON_COLOR;
var SELECTED_FILL_COLOR = require("../../Constants").SELECTED_FILL_COLOR;
var SELECTED_BORDER_COLOR = require("../../Constants").SELECTED_BORDER_COLOR;
var IO_PORT_LINE_WIDTH = require("../../Constants").IO_PORT_LINE_WIDTH;
var IO_PORT_RADIUS = require("../../Constants").IO_PORT_RADIUS;
var IO_PORT_BORDER_WIDTH = require("../../Constants").IO_PORT_BORDER_WIDTH;

var V = require("../../math/Vector").V;
var Renderer = require("../Renderer");
var Camera = require("../../Camera");
var InputPort = require("../../../models/ioobjects/InputPort");
var OutputPort = require("../../../models/ioobjects/OutputPort");

var IOPortRenderer = function () {
    return {
        renderIPort(renderer, camera, iport, selected) {
            var o = iport.getOrigin();
            var v = iport.getTarget();

            var borderCol = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            var circleFillCol = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        },
        renderOPort(renderer, camera, oport, selected) {
            var o = oport.getOrigin();
            var v = oport.getTarget();

            var borderCol = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            var circleFillCol = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        }
    };
}();

module.exports = IOPortRenderer;