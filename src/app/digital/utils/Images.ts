import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";

import {DEBUG_NO_FILL} from "core/utils/Constants";

export const Images = (() => {
    const IMAGE_FILE_NAMES = ["constLow.svg", "constHigh.svg",
                              "buttonUp.svg", "buttonDown.svg",
                              "switchUp.svg", "switchDown.svg",
                              "led.svg", "buf.svg", "and.svg", "or.svg",
                              "segment_horizontal.svg",
                              "segment_vertical.svg",
                              "segment_horizontal0.5.svg",
                              "segment_diagonaltr.svg",
                              "segment_diagonaltl.svg",
                              "segment_diagonalbr.svg",
                              "segment_diagonalbl.svg",
                              "clock.svg", "clockOn.svg",
                              "keyboard.svg", "base.svg"];

    const images: Map<string, SVGDrawing> = new Map();

    const loadImage = async function(imageName: string): Promise<number> {
        const svg = await fetch(`img/items/${imageName}`);
        const svgXML = new DOMParser().parseFromString(await svg.text(), "text/xml");

        const drawing = CreateDrawingFromSVG(svgXML, DEBUG_NO_FILL ? {
            fillStyle: "none"
        } : {})!;

        images.set(imageName, drawing);
        return 1;
    };

    return {
        GetImage: function(img: string): SVGDrawing | undefined {
            return images.get(img);
        },
        Load: async function(onprogress: (percentDone: number) => void): Promise<void> {
            let numLoaded = 0;
            const promises =
                IMAGE_FILE_NAMES.map(async (name) => {
                    await loadImage(name);
                    onprogress((++numLoaded)/IMAGE_FILE_NAMES.length);
                });

            await Promise.all(promises);
        }
    };
})();
