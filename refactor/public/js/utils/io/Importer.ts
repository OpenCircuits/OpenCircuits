import {XMLReader} from "./xml/XMLReader";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export let Importer = (function() {

    let saved = false;

    let read = function(designer: CircuitDesigner, file: string): string {
        let root = <XMLDocument>new DOMParser().parseFromString(file, "text/xml");
        if (root.documentElement.nodeName == "parsererror")
            return;

        let reader = new XMLReader(root);
        
        designer.load(reader.getRoot());
    }

    return {
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
