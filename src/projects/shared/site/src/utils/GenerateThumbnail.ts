import {Circuit} from "shared/api/circuit/public";

import {DEFAULT_THUMBNAIL_SIZE,
        THUMBNAIL_ZOOM_PADDING_RATIO} from "./Constants";
import {CircuitHelpers} from "./CircuitHelpers";


export const GenerateThumbnail = (() => {
    const canvas = document.createElement("canvas");

    return (circuit: Circuit, size?: { w: number, h: number }): string => {
        canvas.width  = size?.w ?? DEFAULT_THUMBNAIL_SIZE;
        canvas.height = size?.h ?? DEFAULT_THUMBNAIL_SIZE;

        const designer = CircuitHelpers.CreateAndInitializeDesigner();
        designer.circuit.import(circuit);
        designer.viewport.attachCanvas(canvas);
        designer.viewport.resize(DEFAULT_THUMBNAIL_SIZE, DEFAULT_THUMBNAIL_SIZE);
        designer.viewport.zoomToFit(designer.circuit.getObjs().all, THUMBNAIL_ZOOM_PADDING_RATIO);

        // force render to finish before getting image
        (designer.viewport as any)["scheduler"]["actualRender"]();

        return canvas.toDataURL("image/png", 0.9);
    }
})();
