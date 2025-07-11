import "shared/api/circuitdesigner/types/declarations";

import {SVGDrawing} from "svg2canvas";

import {ToSVGDrawing} from "shared/api/circuitdesigner/utils/ToSVGDrawing";

import bufSVG from "./buf.svg";
import andSVG from "./and.svg";
import orSVG from "./or.svg";
import ledSVG from "./led.svg";
import switchDownSVG from "./switchDown.svg";
import switchUpSVG from "./switchUp.svg";
import buttonDownSVG from "./buttonDown.svg";
import buttonUpSVG from "./buttonUp.svg";
import clockSVG from "./clock.svg";
import clockOnSVG from "./clockOn.svg";
import constHighSVG from "./constHigh.svg";
import constLowSVG from "./constLow.svg";


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
