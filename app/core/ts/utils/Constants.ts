import {V} from "Vector";

export const SAVE_VERSION = "2.1";

export const DEBUG_CULLBOXES = false;
export const DEBUG_PRESSABLE_BOUNDS = false;
export const DEBUG_SELECTION_BOUNDS = false;
export const DEBUG_NO_FILL = false;

export const WIRE_DIST_THRESHOLD  = 5;
export const WIRE_DIST_THRESHOLD2 = Math.pow(WIRE_DIST_THRESHOLD, 2);
export const WIRE_DIST_ITERATIONS = 10;
export const WIRE_NEWTON_ITERATIONS = 5;

export const DEFAULT_SIZE = 50;
export const GRID_SIZE    = 50;
export const DEFAULT_FILL_COLOR    = (DEBUG_NO_FILL ? undefined : "#ffffff");
export const DEFAULT_BORDER_COLOR  = "#000000";
export const DEFAULT_ON_COLOR      = "#3cacf2";
export const SELECTED_FILL_COLOR   = (DEBUG_NO_FILL ? undefined : "#1cff3e");
export const SELECTED_BORDER_COLOR = "#0d7f1f";

export const DEFAULT_BORDER_WIDTH = 2;
export const SEGMENT_DISPLAY_WIDTH = 35;

export const MULTIPLEXER_HEIGHT_OFFSET = 18;

export const DRAG_TIME = 50;

export const IO_PORT_LENGTH = 35;
export const IO_PORT_RADIUS = 7;
export const IO_PORT_SELECT_RADIUS = IO_PORT_RADIUS + 10;
export const IO_PORT_BORDER_WIDTH = 1;
export const IO_PORT_LINE_WIDTH   = 2;

export const WIRE_THICKNESS = 7.0;
export const WIRE_SNAP_THRESHOLD    = 10;

export const GATE_NOT_CIRCLE_RADIUS = 5;
export const GATE_OR_CULLBOX_OFFSET = 50;

export const LED_LIGHT_RADIUS = 75;
export const LED_WIDTH = 50;

export const ROTATION_CIRCLE_RADIUS = 75;
export const ROTATION_CIRCLE_THICKNESS = 5;
export const ROTATION_CIRCLE_THRESHOLD = 8;
export const ROTATION_CIRCLE_R1 = Math.pow(ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD, 2);
export const ROTATION_CIRCLE_R2 = Math.pow(ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD, 2);

export const LED_GLOW_SIZE = 150;

export const SIDENAV_WIDTH = 300;
export const ITEMNAV_WIDTH = 200;

export const LEFT_MOUSE_BUTTON  = 0;
export const MIDDLE_MOUSE_BUTTON = 1;
export const RIGHT_MOUSE_BUTTON = 2;

export const BACKSPACE_KEY = 8;
export const ENTER_KEY  = 13;
export const SHIFT_KEY  = 16;
export const CONTROL_KEY = 17;
export const OPTION_KEY = 18;
export const ESC_KEY    = 27;
export const SPACEBAR_KEY = 32;
export const DELETE_KEY = 46;
export const A_KEY = 65;
export const C_KEY = 67;
export const D_KEY = 68;
export const F_KEY = 70;
export const V_KEY = 86;
export const X_KEY = 88;
export const Y_KEY = 89;
export const Z_KEY = 90;
export const COMMAND_KEY = 91;
export const META_KEY = 224;

export const IC_VIEWER_ZOOM_PADDING_RATIO = 1.5;

export const FIT_PADDING_RATIO = 1.2;
export const EMPTY_CIRCUIT_MAX = V(GRID_SIZE*5);
export const EMPTY_CIRCUIT_MIN = EMPTY_CIRCUIT_MAX.scale(-1);
