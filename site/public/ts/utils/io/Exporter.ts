declare var jsPDF: any; // jsPDF is external library

import {XMLWriter} from "./xml/XMLWriter";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export const Exporter = (function() {

    let saved = false;

    const write = function(designer: CircuitDesigner): string {
        let writer = new XMLWriter(designer.getXMLName());

        writer.setVersion(1);

        designer.save(writer.getRoot());

        return writer.serialize();
    }

    const saveData = function(data: string, projectName: string, extension: string): void {
        // Get name
        if (projectName.replace(/\s+/g, '') === "")
            projectName = "Untitled Circuit";
        let filename = projectName + extension;

        let file = new Blob([data], {type: "text/plain"});
        if (window.navigator.msSaveOrOpenBlob) { // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else { // Others
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    // Prompt for exit
    window.onbeforeunload = function(e) {
        if (!saved) {
            const dialogText = "You have unsaved changes.";
            e.returnValue = dialogText;
            return dialogText;
        }
    };

    return {
        saveFile: function(designer: CircuitDesigner, projectName: string) {
            let data = write(designer);
            saveData(data, projectName, ".circuit");
        },
        savePNG: function(canvas: HTMLCanvasElement, projectName: string) {
            const data = canvas.toDataURL("image/png", 1.0);
            saveData(data, projectName, ".png");
        },
        savePDF: function(canvas: HTMLCanvasElement, projectName: string) {
            const width  = canvas.width;
            const height = canvas.height;

            const data = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("l", "px", [width, height]);

            // Get name
            if (projectName.replace(/\s+/g, '') === "")
                projectName = "Untitled Circuit";

            // Fill background
            pdf.setFillColor("#CCC");
            pdf.rect(0, 0, width, height, "F");

            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(projectName + ".pdf");
        }
    }

})();
