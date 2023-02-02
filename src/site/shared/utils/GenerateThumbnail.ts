import {Circuit} from "core/public";

import {DEFAULT_THUMBNAIL_SIZE,
        THUMBNAIL_ZOOM_PADDING_RATIO} from "./Constants";

import {Camera} from "math/Camera";


export const GenerateThumbnail = (() => {
    const canvas = document.createElement("canvas");
    const camera = new Camera(DEFAULT_THUMBNAIL_SIZE, DEFAULT_THUMBNAIL_SIZE);

    return (circuit: Circuit, size?: { w: number, h: number }): string => {
        canvas.width  = size?.w ?? DEFAULT_THUMBNAIL_SIZE;
        canvas.height = size?.h ?? DEFAULT_THUMBNAIL_SIZE;

        camera.resize(canvas.width, canvas.height);

        // Get final camera position and zoom
        const objs = circuit.getObjs();
        // const [pos, zoom] = GetCameraFit(circuit, objs, THUMBNAIL_ZOOM_PADDING_RATIO);
        // camera.setPos(pos);
        // camera.setZoom(zoom);

        // const render = GetRenderFunc({
        //     canvas,
        //     info: {
        //         ...info,
        //         camera,
        //         toolManager: new ToolManager(new DefaultTool()),
        //     },
        // });

        // render();

        return canvas.toDataURL("image/png", 0.9);
    }
})();
