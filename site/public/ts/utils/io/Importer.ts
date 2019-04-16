import {XMLReader} from "./xml/XMLReader";
import {XMLNode} from "./xml/XMLNode";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export const Importer = (function() {
    let saved = false;

    const readDocument = function(designer: CircuitDesigner, doc:XMLDocument) {
        let reader = new XMLReader(doc);

        // Check for old version of save
        if (reader.getVersion() == -1)
            ResolveVersionConflict(reader);

        designer.load(reader.getRoot());
    };
    const read = function(designer: CircuitDesigner, file: string): string {
        let root = <XMLDocument>new DOMParser().parseFromString(file, "text/xml");
        if (root.documentElement.nodeName == "parsererror")
            return;
        readDocument(designer, root);
    };

    return {
        loadRemote: function(designer: CircuitDesigner, id: string) {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            let open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                designer.reset();

                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'circuit/' + escape(id));
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        alert('Success');
                        let uc = xhr.responseXML;
                        console.log(uc);
                        readDocument(designer, xhr.responseXML);
                    }
                    else {
                        alert('Request failed.  Returned status of ' + xhr.status);
                    }
                };
                xhr.send();
            }
        },
        loadFile: function(designer: CircuitDesigner, file: File) {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            let open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                designer.reset();

                let reader = new FileReader();
                reader.onload = function(e) {
                    read(designer, reader.result.toString());
                }

                reader.readAsText(file);
            }
        }
    }

})();
