import jsPDF from "jspdf";


export function SavePNG(canvas: HTMLCanvasElement, projectName: string): void {
    const data = canvas.toDataURL("image/png", 1.0);

    // Get name
    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";
    const filename = projectName + ".png";

    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        const file = new Blob([data], {type: "image/png"});
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
        const a = document.createElement("a");
        const url = data;
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

export function SavePDF(canvas: HTMLCanvasElement, projectName: string): void {
    const width  = canvas.width;
    const height = canvas.height;

    const data = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("l", "px", [width, height]);

    // Get name
    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";

    // Fill background
    pdf.setFillColor("#CCC");
    pdf.rect(0, 0, width, height, "F");

    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(projectName + ".pdf");
}


export function SaveJPG(canvas: HTMLCanvasElement, projectName: string): void { 
    const context = canvas.getContext('2d'); // get the context to overwrite the background of the canvas 
    const background_color = "#ccc"; // set the background color

    context.save();// save the current state of the canvas
    context.globalCompositeOperation = 'destination-over'; // set the composite operation to overwrite the background
    context.fillStyle = background_color ;
    
    context.fillRect(0, 0, canvas.width, canvas.height);    
    const data = canvas.toDataURL("image/jpeg", 1.0); // get the data from the canvas
    context.restore() // restore the canvas to its previous state

    if (projectName.replace(/\s+/g, "") === "")
        projectName = "Untitled Circuit";
    const filename = projectName + ".jpg";

    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        const file = new Blob([data], {type: "image/jpeg"});
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else { // Others
        const a = document.createElement("a");
        const url = data;
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
