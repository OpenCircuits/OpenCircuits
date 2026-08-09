import { SVGDrawing } from "svg2canvas";

import "shared/api/circuitdesigner/types/declarations";
import { ToSVGDrawing } from "shared/api/circuitdesigner/utils/ToSVGDrawing";

import andSVG from "./and.svg";
import bufSVG from "./buf.svg";
import buttonDownSVG from "./buttonDown.svg";
import buttonUpSVG from "./buttonUp.svg";
import clockSVG from "./clock.svg";
import clockOnSVG from "./clockOn.svg";
import constHighSVG from "./constHigh.svg";
import constLowSVG from "./constLow.svg";
import ledSVG from "./led.svg";
import orSVG from "./or.svg";
import switchDownSVG from "./switchDown.svg";
import switchUpSVG from "./switchUp.svg";

export const SVGs: Map<string, SVGDrawing> = new Map([
    ["buf.svg", ToSVGDrawing("buf", bufSVG)],
    ["and.svg", ToSVGDrawing("and", andSVG)],
    ["or.svg", ToSVGDrawing("or", orSVG)],
    ["led.svg", ToSVGDrawing("led", ledSVG)],
    ["switchDown.svg", ToSVGDrawing("switchDown", switchDownSVG)],
    ["switchUp.svg", ToSVGDrawing("switchUp", switchUpSVG)],
    ["buttonDown.svg", ToSVGDrawing("buttonDown", buttonDownSVG)],
    ["buttonUp.svg", ToSVGDrawing("buttonUp", buttonUpSVG)],
    ["clock.svg", ToSVGDrawing("clock", clockSVG)],
    ["clockOn.svg", ToSVGDrawing("clockOn", clockOnSVG)],
    ["constHigh.svg", ToSVGDrawing("constHigh", constHighSVG)],
    ["constLow.svg", ToSVGDrawing("constLow", constLowSVG)],
]);
