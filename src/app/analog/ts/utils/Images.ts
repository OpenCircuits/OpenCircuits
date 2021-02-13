import $ from "jquery";

import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";

export const Images = (() => {
    const IMAGE_FILE_NAMES = ["voltagesource.svg", "currentsource.svg",
                              "resistor.svg"];

    const images: Map<string, SVGDrawing> = new Map();

    const loadImage = function(imageName: string, resolve: (num?: number) => void): void {
        $.get(`img/analog/items/${imageName}`, function(svgXML) {
            const drawing = CreateDrawingFromSVG(svgXML);

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
