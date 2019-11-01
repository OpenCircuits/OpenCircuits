import {XMLWriter} from "./xml/XMLWriter";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export const Exporter = (() => {
    return {
        WriteCircuit: function(designer: DigitalCircuitDesigner, name: string): string {
            const writer = new XMLWriter(designer.getXMLName());

            writer.setVersion("1.1");
            writer.setName(name);
            writer.setThumbnail("data:,"); // TODO: Generate a thumbnail

            designer.save(writer.getContentsNode());

            return writer.serialize();
        },
        SaveFile: function(designer: DigitalCircuitDesigner, projectName: string): void {
            // Get name
            if (projectName.replace(/\s+/g, "") === "")
                projectName = "Untitled Circuit";

            const data = this.WriteCircuit(designer, projectName);

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
    }

})();
