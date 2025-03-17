import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";

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
import segmentDiagonalBLSVG from "./segment_diagonalbl.svg";
import segmentDiagonalBRSVG from "./segment_diagonalbR.svg";
import segmentDiagonalTLSVG from "./segment_diagonaltl.svg";
import segmentDiagonalTRSVG from "./segment_diagonaltR.svg";
import segmentHorizontalSVG from "./segment_horizontal.svg";
import segmentHorizontalHalfSVG from "./segment_horizontal0.5.svg";
import segmentVerticalSVG from "./segment_vertical.svg";


function ToSVGDrawing(name: string, svgStr: string): SVGDrawing {
    try {
        const svgS = window.atob(svgStr.replace("data:image/svg+xml;base64,", ""));
        const svg = new DOMParser().parseFromString(svgS, "text/xml");
        const drawing = CreateDrawingFromSVG(svg);
        if (!drawing)
            throw new Error("Failed to create drawing from SVG!");
        return drawing;
    } catch (e) {
        throw new Error(`Failed to turn svg ${name}.svg (${JSON.stringify(svgStr)}) into SVG! ${e}`);
    }
}

export const SVGs: Map<string, SVGDrawing> = new Map([
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
    ["./segment_diagonalbl.svg", ToSVGDrawing("segmentDiagonalBL", segmentDiagonalBLSVG)],
    ["./segment_diagonalbR.svg", ToSVGDrawing("segmentDiagonalBR", segmentDiagonalBRSVG)],
    ["./segment_diagonaltl.svg", ToSVGDrawing("segmentDiagonalTL", segmentDiagonalTLSVG)],
    ["./segment_diagonaltR.svg", ToSVGDrawing("segmentDiagonalTR", segmentDiagonalTRSVG)],
    ["./segment_horizontal.svg", ToSVGDrawing("segmentHorizontal", segmentHorizontalSVG)],
    ["./segment_horizontal0.5.svg", ToSVGDrawing("segmentHorizontalHalf", segmentHorizontalHalfSVG)],
    ["./segment_vertical.svg", ToSVGDrawing("segmentVertical", segmentVerticalSVG)],
]);
