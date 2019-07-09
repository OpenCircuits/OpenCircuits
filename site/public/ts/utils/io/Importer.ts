import {XMLReader} from "./xml/XMLReader";
import {Circuit} from "../../models/Circuit";

export const Importer = (() => {

    const readString = function (circuit: Circuit, file: string): void {
        const root = <XMLDocument>new DOMParser().parseFromString(file, "text/xml");
        if (root.documentElement.nodeName == "parsererror")
            return;
        readDocument(circuit, root);
    };

    const readDocument = function (circuit: Circuit, doc: XMLDocument): void {
        const reader = new XMLReader(doc);
        circuit.load(reader.getRoot());
    };

    return {
        LoadCircuitFromString: readString,
        LoadCircuitXMLDocument: readDocument,
        LoadCircuitFromFile: function (circuit: Circuit, file: File): void {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            const open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                const reader = new FileReader();
                reader.onload = () => {
                    readString(circuit, reader.result.toString());
                };

                reader.readAsText(file);
            }
        }
    }

})();
