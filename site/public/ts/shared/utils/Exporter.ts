import {XMLWriter} from "../../../../../app/core/ts/utils/io/xml/XMLWriter";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalCircuitView} from "site/digital/views/DigitalCircuitView";
import {V, Vector} from "Vector";
import {THUMBNAIL_ZOOM_PADDING_RATIO, THUMBNAIL_SIZE} from "./Constants";

// Returns a 256x256 canvas on which the given circuit is centered
//! No idea what happens if the designer is empty, divide-by-zero seems plausible
//? how should empty designers be handled -- return empty canvas?
function RenderCircuit(canvas: HTMLCanvasElement, designer: DigitalCircuitDesigner): void {
    // Find bounding box of the circuit
    let min = V(Infinity);
    let max = V(-Infinity);
    for (let c of designer.getObjects()) {
        const cullbox = c.getCullBox();
        max = Vector.max(max, cullbox.getTopRight());
        min = Vector.min(min, cullbox.getBottomLeft());
    }

    //! Warning: several pieces of CircuitView classes rely on there being a screen and a window
    // I think using this vw and vh cancels it out, but I'm not confident in that
    const vw = THUMBNAIL_SIZE/window.innerWidth;
    const vh = THUMBNAIL_SIZE/window.innerHeight;
    const tmp = document.createElement("canvas");
    const view = new DigitalCircuitView(tmp, vw, vh);

    // Center and zoom the camera so everything fits with no distortion
    const center = min.add(max).scale(0.5);
    const camera = view.getCamera();
    camera.setPos(center);
    // Zoom out a bit more than we need so components on edges have some breathing room
    const relative_size = max.sub(min).scale(1/THUMBNAIL_SIZE);
    const zoom = Math.max(relative_size.x, relative_size.y) * THUMBNAIL_ZOOM_PADDING_RATIO;
    camera.zoomBy(zoom);

    // Create background the same color as the site to composite the image on top of
    // NOTE: can't just fill the first canvas before the render since the first thing the renderer does it clear it
    canvas.width = THUMBNAIL_SIZE;
    canvas.height = THUMBNAIL_SIZE;
    const context = canvas.getContext("2d");
    context.fillStyle = window.getComputedStyle(document.body, null).getPropertyValue("background-color");
    context.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    // Do the render, and composite it on top of the background
    view.render(designer, []);
    context.drawImage(tmp, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
    canvas.remove();
}

export function WriteCircuit(designer: DigitalCircuitDesigner, name: string, thumbnail: boolean = false): string {
    const writer = new XMLWriter(designer.getXMLName());
    writer.setVersion("1.1");
    writer.setName(name);
    if (thumbnail) {
        // Render to a small temporary canvas (which gets garbage-collected once done)
        const canvas = document.createElement("canvas");
        RenderCircuit(canvas, designer);
        const thumbnail = canvas.toDataURL("image/png", 0.9);
        canvas.remove();
        writer.setThumbnail(thumbnail);
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
