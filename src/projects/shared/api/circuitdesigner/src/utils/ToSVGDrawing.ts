import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";


export function ToSVGDrawing(name: string, svgStr: string): SVGDrawing {
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
