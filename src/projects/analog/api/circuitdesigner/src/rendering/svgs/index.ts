import "shared/api/circuitdesigner/types/declarations";

import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";


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
]);
