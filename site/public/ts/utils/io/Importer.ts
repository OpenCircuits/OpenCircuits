import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Circuit} from "../../models/Circuit";

export const Importer = (() => {

    const readString = function(circuit: Circuit, file: string): void {
        const root = <XMLDocument>new DOMParser().parseFromString(file, "text/xml");
        if (root.documentElement.nodeName == "parsererror")
            return;
        readDocument(circuit, root);
    };

    const readDocument = function(circuit: Circuit, doc: XMLDocument): void {
        const reader = new XMLReader(doc);

        // TODO: resolve this...
        // Check for old version of save
        // if (reader.getVersion() == -1)
        //     ResolveVersionConflict(reader);

        circuit.load(reader.getRoot());
    };

    return {
        loadRemote: function(circuit: Circuit, id: string): void {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            let open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'api/circuits/' + escape(id));
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        alert('Success');
                        const uc = xhr.responseXML;
                        console.log(uc);
                        readDocument(circuit, xhr.responseXML);
                    }
                    else {
                        alert('Request failed.  Returned status of ' + xhr.status);
                    }
                };
                xhr.send();
            }
        },
        loadFile: function(circuit: Circuit, file: File): void {
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
