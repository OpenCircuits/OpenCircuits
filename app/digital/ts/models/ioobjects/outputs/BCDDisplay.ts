import {serializable} from "serialeazy";

import Segments from "./Segments.json";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Name} from "core/utils/Name";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {SegmentDisplayPositioner} from "digital/models/ports/positioners/SegmentDisplayPositioner";

export type SegmentType = "vertical" | "horizontal" | "diagonaltr" | "diagonaltl" | "diagonalbr" | "diagonalbl" | "horizontal0.5";

@serializable("BCDDisplay")
export class BCDDisplay extends DigitalComponent {

}