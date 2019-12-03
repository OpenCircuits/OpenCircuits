import {V} from "Vector";
import {GRID_SIZE} from "core/utils/Constants";

export const DEFAULT_THUMBNAIL_SIZE = 256;
export const THUMBNAIL_ZOOM_PADDING_RATIO = 1.025;
export const EMPTY_CIRCUIT_MAX = V(GRID_SIZE*5);
export const EMPTY_CIRCUIT_MIN = EMPTY_CIRCUIT_MAX.scale(-1);

export const OVERWRITE_CIRCUIT_MESSAGE = "Are you sure you want to overwrite your current scene?";