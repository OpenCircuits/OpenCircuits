import $ from "jquery";
import {DEBUG_NO_FILL} from "core/utils/Constants";

export const Images = (() => {
    const IMAGE_FILE_NAMES = ["constLow.svg", "constHigh.svg",
                              "buttonUp.svg", "buttonDown.svg",
                              "switchUp.svg", "switchDown.svg",
                              "led.svg", "ledLight.svg",
                              "buf.svg", "and.svg", "or.svg",
                              "segment_horizontal.svg",
                              "segment_vertical.svg",
                              "segment_horizontal0.5.svg",
                              "segment_diagonaltr.svg",
                              "segment_diagonaltl.svg",
                              "segment_diagonalbr.svg",
                              "segment_diagonalbl.svg",
                              "clock.svg", "clockOn.svg",
                              "keyboard.svg", "base.svg"];

    const images: Map<string, HTMLImageElement> = new Map();

    const loadImage = function(imageName: string, resolve: (num?: number) => void): void {
        $.get(`img/items/${imageName}`, function(svgXML) {
            let svgStr = new XMLSerializer().serializeToString(svgXML);
            if (DEBUG_NO_FILL)
                svgStr = svgStr.replace(/fill="#[(a-zA-Z0-9)]+"/, "fill=\"none\"");

            const data = btoa(svgStr);

            const img = new Image();
            img.onabort = img.onerror = (e) => { throw new Error(e.toString()); };
            img.src = "data:image/svg+xml;base64,"+data;

            images.set(imageName, img);

            resolve(1);
        });
    };

    return {
        GetImage: function(img: string): HTMLImageElement {
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
