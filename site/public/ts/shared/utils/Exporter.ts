import {XMLWriter} from "../../../../../app/core/ts/utils/io/xml/XMLWriter";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalCircuitView} from "site/digital/views/DigitalCircuitView";
import {Vector} from "Vector";
import {THUMBNAIL_ZOOM_PADDING_RATIO, THUMBNAIL_SIZE} from "./Constants";
import {CullableObject} from "core/models/CullableObject";

// Returns a 256x256 canvas on which the given circuit is centered
//! No idea what happens if the designer is empty, divide-by-zero seems plausible
//? how should empty designers be handled -- return empty canvas?
function RenderCircuit(canvas: HTMLCanvasElement, designer: DigitalCircuitDesigner): void {
    // Find bounding box of the circuit
    const all = (<CullableObject[]>designer.getObjects()).concat(designer.getWires());
    const min = Vector.min(...all.map(o => o.getMinPos()));
    const max = Vector.max(...all.map(o => o.getMaxPos()));

    //! Warning: several pieces of CircuitView classes rely on there being a screen and a window
    // I think using this vw and vh cancels it out, but I'm not confident in that
    const vw = THUMBNAIL_SIZE/window.innerWidth;
    const vh = THUMBNAIL_SIZE/window.innerHeight;
    const view = new DigitalCircuitView(canvas, vw, vh);

    // Center and zoom the camera so everything fits with no distortion
    const center = min.add(max).scale(0.5);
    const camera = view.getCamera();
    camera.setPos(center);
    // Zoom out a bit more than we need so components on edges have some breathing room
    const relativeSize = max.sub(min).scale(1/THUMBNAIL_SIZE);
    const zoom = Math.max(relativeSize.x, relativeSize.y) * THUMBNAIL_ZOOM_PADDING_RATIO;
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
