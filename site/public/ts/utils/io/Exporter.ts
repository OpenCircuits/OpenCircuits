import {XMLWriter} from "./xml/XMLWriter";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export let Exporter = (function() {

    let saved = false;

    let write = function(designer: CircuitDesigner): string {
        let writer = new XMLWriter(designer.getXMLName());

        designer.save(writer.getRoot());

        return writer.serialize();
    }

    return {
        saveFile: function(designer: CircuitDesigner, projectName: string) {
            let data = write(designer);

            // Get name
            if (projectName.replace(/\s+/g, '') === "")
                projectName = "Untitled Circuit";
            let filename = projectName + ".circuit";

            let file = new Blob([data], {type: "text/plain"});
            if (window.navigator.msSaveOrOpenBlob) { // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
                saved = true;
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
                    saved = true;
                }, 0);
            }
        }
    }

})();
