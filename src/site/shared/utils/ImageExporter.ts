import jsPDF from "jspdf";

import {SaveFile} from "./Exporter";


export type ImageExportOptions = {
    type: "png" | "jpeg" | "pdf";
    width: number;
    height: number;
    bgColor: string;
    useBg: boolean;
    useGrid: boolean;
}
export function SaveImage(canvas: HTMLCanvasElement, name: string, options: ImageExportOptions) {
    switch (options.type) {
    case "png":
    case "jpeg":
        SaveImg(canvas, name, options);
        break;
    case "pdf":
        SavePDF(canvas, name, options);
        break;
    }
}


function SaveImg(canvas: HTMLCanvasElement, projectName: string, options: ImageExportOptions) {
    if (options.useBg) {
        // From https://stackoverflow.com/a/50126796
        const ctx = canvas.getContext("2d")!; // get the context to overwrite the background of the canvas
        ctx.save(); // save the current state of the context
        ctx.globalCompositeOperation = "destination-over"; // set the composite operation to overwrite the background
        ctx.fillStyle = options.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore() // restore the context to its previous state (back to default bg and operation)
    }

    const data = canvas.toDataURL(`image/${options.type}, 1.0`);
    SaveFile(data, projectName, options.type);
}


function SavePDF(canvas: HTMLCanvasElement, projectName: string, options: ImageExportOptions): void {
    const width  = canvas.width;
    const height = canvas.height;

    const data = canvas.toDataURL("image/png", 1);
    const pdf = new jsPDF("l", "px", [width, height]);

    // Get name
    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";

    // Fill background
    if (options.useBg) {
        pdf.setFillColor(options.bgColor);
        pdf.rect(0, 0, width, height, "F");
    }

    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(projectName + ".pdf");
}
