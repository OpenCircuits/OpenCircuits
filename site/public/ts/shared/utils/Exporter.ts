import {XMLWriter} from "../../../../../app/core/ts/utils/io/xml/XMLWriter";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalCircuitView} from "site/digital/views/DigitalCircuitView";
import {V} from "Vector";

// Returns a 256x256 canvas on which the given circuit is centered
//! No idea what happens if the designer is empty, divide-by-zero seems plausible
//? how empty designers should be handled -- return empty canvas?
function RenderCircuit(designer: DigitalCircuitDesigner): HTMLCanvasElement {
    // 256 is arbitrary, could increase or decrease for more detail or less memory respectively
    const THUMBNAIL_SIZE = 256;

    // Find bounding box of the circuit
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    for (let c of designer.getObjects()) {
        const cullbox = c.getCullBox();
        const min = cullbox.getTopLeft();
        const max = cullbox.getBottomRight();
        xmin = Math.min(min.x, xmin);
        ymin = Math.min(min.y, ymin);
        xmax = Math.max(max.x, xmax);
        ymax = Math.max(max.y, ymax);
    }

    //! Warning: several pieces of CircuitView classes rely on there being a screen and a window
    const canvas = document.createElement("canvas");
    const vw = THUMBNAIL_SIZE/window.innerWidth;
    const vh = THUMBNAIL_SIZE/window.innerHeight;
    const view = new DigitalCircuitView(canvas, vw, vh);

    // Center and zoom the camera so everything fits with no distortion
    const center = V((xmin + xmax)/2, (ymin + ymax)/2);
    const camera = view.getCamera();
    camera.setPos(center);
    const zoom = Math.max((xmax - xmin)/THUMBNAIL_SIZE, (ymax - ymin)/THUMBNAIL_SIZE) * 1.1; // zoom out 10% more than required
    camera.zoomBy(zoom); // zoomTo would be ideal but does calculations in screen space, whereas zoomBy is entirely world space

    // Do the actual render
    view.render(designer, [], undefined);
    return canvas;
}

export function WriteCircuit(designer: DigitalCircuitDesigner, name: string): string {
    // Render to a small temporary canvas (which gets garbage-collected once done)
    const canvas = RenderCircuit(designer);
    const thumbnail = canvas.toDataURL("image/png", 0.9);

    const writer = new XMLWriter(designer.getXMLName());
    writer.setVersion("1.1");
    writer.setName(name);
    writer.setThumbnail(thumbnail);

    designer.save(writer.getContentsNode());

    return writer.serialize();
}
export function SaveFile(designer: DigitalCircuitDesigner, projectName: string): void {
    // Get name
    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";

    const data = WriteCircuit(designer, projectName);

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
