import $ from "jquery";

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

    const loadImage = function(imageName: string, resolve: (num?: number) => void): void {
        $.get(`img/items/${imageName}`, function(svgXML) {
            const drawing = CreateDrawingFromSVG(svgXML, DEBUG_NO_FILL ? {
                fillStyle: "none"
            } : {});

            images.set(imageName, drawing);

            resolve(1);
        });
    };

    return {
        GetImage: function(img: string): SVGDrawing {
            return images.get(img);
        },
        Load: async function(): Promise<void> {
            const promises =
                IMAGE_FILE_NAMES.map((name) =>
                    new Promise((resolve, _) => loadImage(name, resolve))
                );

            await Promise.all(promises);
        }
    };
})();
