import {XMLWriter} from "../../../../../app/core/ts/utils/io/xml/XMLWriter";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalCircuitView} from "site/digital/views/DigitalCircuitView";
import {THUMBNAIL_ZOOM_PADDING_RATIO, DEFAULT_THUMBNAIL_SIZE, EMPTY_CIRCUIT_MIN, EMPTY_CIRCUIT_MAX} from "./Constants";
import {CircuitBoundingBox} from "core/utils/ComponentUtils";
import {CullableObject} from "core/models/CullableObject";

// Renders a view of the given circuit on the given canvas element
// Canvas is resized to a square with side length of size
// If the circuit is empty, only draws a grid centered on the world origin
function RenderCircuit(canvas: HTMLCanvasElement, designer: DigitalCircuitDesigner, size: number = DEFAULT_THUMBNAIL_SIZE): void {
    const all = (<CullableObject[]>designer.getObjects()).concat(designer.getWires());
    // Define a 10x10 world bounding box for empty circuits, so they have a defined grid resolution
    let min = EMPTY_CIRCUIT_MIN;
    let max = EMPTY_CIRCUIT_MAX;
    if (all.length > 0) {
        const bbox = CircuitBoundingBox(all);
        min = bbox.getMin();
        max = bbox.getMax();
    }

    //! Warning: several pieces of CircuitView classes rely on there being a screen and a window
    // Using this vw and vh cancels it out, but that will change if
    const vw = size/window.innerWidth;
    const vh = size/window.innerHeight;
    const view = new DigitalCircuitView(canvas, vw, vh);

    // Center and zoom the camera so everything fits with no distortion
    const center = min.add(max).scale(0.5);
    const camera = view.getCamera();
    camera.setPos(center);
    // Zoom out a bit more than we need so components on edges have some breathing room
    const relative_size = max.sub(min).scale(1/size);
    const zoom = Math.max(relative_size.x, relative_size.y) * THUMBNAIL_ZOOM_PADDING_RATIO;
    camera.zoomBy(zoom);

    // Do the render
    view.render(designer, []);
}

export function WriteCircuit(designer: DigitalCircuitDesigner, name: string, thumbnail: boolean = false): string {
    const writer = new XMLWriter(designer.getXMLName());
    writer.setVersion("1.2");
    writer.setName(name);
    if (thumbnail) {
        // Render to a small temporary canvas
        const canvas = document.createElement("canvas");
        RenderCircuit(canvas, designer);
        const thumbnail = canvas.toDataURL("image/png", 0.9);
        writer.setThumbnail(thumbnail);
        canvas.remove();
    } else {
        writer.setThumbnail("data:,");
    }

    designer.save(writer.getContentsNode());

    return writer.serialize();
}
export function SaveFile(designer: DigitalCircuitDesigner, projectName: string, thumbnail: boolean = false): void {
    // Get name
    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";

    const data = WriteCircuit(designer, projectName, thumbnail);

    const filename = projectName + ".circuit";

    const file = new Blob([data], {type: "text/xml"});
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
        const a = document.createElement("a");
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
