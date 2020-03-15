import {DEFAULT_THUMBNAIL_SIZE,
        THUMBNAIL_ZOOM_PADDING_RATIO} from "./Constants";

import {FitCamera} from "core/utils/ComponentUtils";
import {BoundingBox} from "core/utils/math/BoundingBox"

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {CullableObject} from "core/models/CullableObject";

import {CircuitView} from "site/shared/views/CircuitView";

export class ThumbnailGenerator {
    private view: CircuitView;
    private size: number;

    public constructor(view: new (c: HTMLCanvasElement, vw: number, vh: number) => CircuitView, size: number = DEFAULT_THUMBNAIL_SIZE) {
        // TODO: abstract out Renderer and make this not so nasty
        this.view = new view(document.createElement("canvas"),
                             size/window.innerWidth,
                             size/window.innerHeight);

        this.size = size;
    }

    public generate(designer: CircuitDesigner): string {
        const all = (<CullableObject[]>designer.getObjects()).concat(designer.getWires());

        // // Center and zoom the camera so everything fits
        // //  with extra padding on sides
        // const relativeSize = bbox.getMax().sub(bbox.getMin()).scale(1/this.size);
        // const zoom = Math.max(relativeSize.x, relativeSize.y) * THUMBNAIL_ZOOM_PADDING_RATIO;

        // // Move camera
        // const camera = this.view.getCamera();
        // camera.setPos(bbox.getCenter());
        // camera.setZoom(zoom);
        FitCamera(this.view.getCamera(), all, THUMBNAIL_ZOOM_PADDING_RATIO);
        // Render the circuit
        this.view.render(designer, []);

        // Export canvas as png
        return this.view.getCanvas().toDataURL("image/png", 0.9);
    }
}
