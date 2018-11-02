"use strict";

var Constants = {};

Constants.DEFAULT_SIZE = 50;
Constants.GRID_SIZE = 50;
Constants.DEFAULT_FILL_COLOR = "#ffffff";
Constants.DEFAULT_BORDER_COLOR = "#000000";
Constants.DEFAULT_ON_COLOR = "#3cacf2";
Constants.SELECTED_FILL_COLOR = "#1cff3e";
Constants.SELECTED_BORDER_COLOR = "#0d7f1f";

Constants.IO_PORT_LENGTH = 60;
Constants.IO_PORT_RADIUS = 7;
Constants.IO_PORT_BORDER_WIDTH = 1;
Constants.IO_PORT_LINE_WIDTH = 2;

Constants.WIRE_DIST_THRESHOLD = 5;
Constants.WIRE_DIST_THRESHOLD2 = Math.pow(Constants.WIRE_DIST_THRESHOLD, 2);
Constants.WIRE_DIST_ITERATIONS = 10;
Constants.WIRE_NEWTON_ITERATIONS = 5;
Constants.WIRE_SNAP_THRESHOLD = 10;

Constants.ROTATION_CIRCLE_RADIUS = 75;
Constants.ROTATION_CIRCLE_THICKNESS = 5;
Constants.ROTATION_CIRCLE_THRESHOLD = 5;
Constants.ROTATION_CIRCLE_R1 = Math.pow(Constants.ROTATION_CIRCLE_RADIUS - Constants.ROTATION_CIRCLE_THRESHOLD, 2);
Constants.ROTATION_CIRCLE_R2 = Math.pow(Constants.ROTATION_CIRCLE_RADIUS + Constants.ROTATION_CIRCLE_THRESHOLD, 2);

Constants.SIDENAV_WIDTH = 200;
Constants.ITEMNAV_WIDTH = 200;

Constants.LEFT_MOUSE_BUTTON = 0;
Constants.RIGHT_MOUSE_BUTTON = 1;

Constants.OPTION_KEY = 18;
Constants.SHIFT_KEY = 16;
Constants.BACKSPACE_KEY = 8;
Constants.DELETE_KEY = 46;
Constants.ENTER_KEY = 13;
Constants.ESC_KEY = 27;
Constants.A_KEY = 65;
Constants.C_KEY = 67;
Constants.V_KEY = 86;
Constants.X_KEY = 88;
Constants.Y_KEY = 89;
Constants.Z_KEY = 90;
Constants.CONTROL_KEY = 17;
Constants.COMMAND_KEY = 91;

module.exports = Constants;