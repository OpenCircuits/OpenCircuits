import {DEFAULT_THUMBNAIL_SIZE, EMPTY_CIRCUIT_MIN,
        EMPTY_CIRCUIT_MAX, THUMBNAIL_ZOOM_PADDING_RATIO} from "./Constants";

import {CircuitBoundingBox} from "core/utils/ComponentUtils";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {CullableObject} from "core/models/CullableObject";

import {CircuitView} from "site/shared/views/CircuitView";

export class ThumnailGenerator {
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

        // Define world bounding box for empty circuits so that it shows a little bit of grid
        const bbox = CircuitBoundingBox(all);
        const min = (all.length == 0) ? (EMPTY_CIRCUIT_MIN) : (bbox.getMin());
        const max = (all.length == 0) ? (EMPTY_CIRCUIT_MAX) : (bbox.getMax());

        // Center and zoom the camera so everything fits
        //  with extra padding on sides
        const center = min.add(max).scale(0.5);
        const relativeSize = max.sub(min).scale(1/this.size);
        const zoom = Math.max(relativeSize.x, relativeSize.y) * THUMBNAIL_ZOOM_PADDING_RATIO;

        // Move camera
        const camera = this.view.getCamera();
        camera.setPos(center);
        camera.setZoom(zoom);

        // Render the circuit
        this.view.render(designer, []);

        // Export canvas as png
        return this.view.getCanvas().toDataURL("image/png", 0.9);
    }
}