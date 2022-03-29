import {CreateDrawingFromSVG, SVGDrawing} from "svg2canvas";

import {DEBUG_NO_FILL} from "core/utils/Constants";


export const Images = (() => {
    const images: Map<string, SVGDrawing> = new Map();

    const loadImage = async function(imageName: string): Promise<void> {
        try {
            const svg = await fetch(`img/items/${imageName}`);
            if (!svg.ok) // Make sure fetch worked
                throw new Error(`Failed to fetch img/items/${imageName}: ${svg.statusText}`);

            const svgXML = new DOMParser().parseFromString(await svg.text(), "text/xml");
            if (svgXML.querySelector("parsererror")) { // Make sure there's no XML parsing error
                throw new Error(`Failed to parse XML for img/items/${imageName}` +
                                `: ${svgXML.querySelector("parsererror")?.innerHTML}`);
            }

            const drawing = CreateDrawingFromSVG(svgXML, (DEBUG_NO_FILL ? { fillStyle: "none" } : {}));
            if (!drawing)
                throw new Error(`Failed to create drawing for svg: img/items/${imageName}`);
            images.set(imageName, drawing);
        } catch (e) {
            throw new Error(e);
        }
    };

    return {
        GetImage: function(img: string): SVGDrawing | undefined {
            return images.get(img);
        },
        Load: async function(imageFileNames: string[], onprogress: (percentDone: number) => void): Promise<void> {
            let numLoaded = 0;
            const promises =
            imageFileNames.map(async (name) => {
                    await loadImage(name);
                    onprogress((++numLoaded)/imageFileNames.length);
                });

            await Promise.all(promises);
        },
    };
})();
