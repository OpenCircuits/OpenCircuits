import {DEFAULT_THUMBNAIL_SIZE,
        THUMBNAIL_ZOOM_PADDING_RATIO} from "./Constants";

import {GetCameraFit} from "core/utils/ComponentUtils";
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

        const finalCamera = GetCameraFit(this.view.getCamera(), all, THUMBNAIL_ZOOM_PADDING_RATIO);
        this.view.getCamera().setPos(finalCamera[0]);
        this.view.getCamera().setZoom(finalCamera[1]);

        // Render the circuit
        this.view.render(designer, []);

        // Export canvas as png
        return this.view.getCanvas().toDataURL("image/png", 0.9);
    }
}
