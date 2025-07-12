import "shared/api/circuitdesigner/types/declarations";

import {SVGDrawing} from "svg2canvas";

import {ToSVGDrawing} from "shared/api/circuitdesigner/utils/ToSVGDrawing";

import capacitorSVG from "./capacitor.svg";
import currentSourceSVG from "./currentsource.svg";
import groundSVG from "./ground.svg";
import inductorSVG from "./inductor.svg";
import resistorSVG from "./resistor.svg";
import voltageSourceSVG from "./voltagesource.svg";


export const SVGs: Map<string, SVGDrawing> = new Map([
    ["capacitor.svg", ToSVGDrawing("capacitor", capacitorSVG)],
    ["currentsource.svg", ToSVGDrawing("currentsource", currentSourceSVG)],
    ["ground.svg", ToSVGDrawing("ground", groundSVG)],
    ["inductor.svg", ToSVGDrawing("inductor", inductorSVG)],
    ["resistor.svg", ToSVGDrawing("resistor", resistorSVG)],
    ["voltagesource.svg", ToSVGDrawing("voltagesource", voltageSourceSVG)],
]);
