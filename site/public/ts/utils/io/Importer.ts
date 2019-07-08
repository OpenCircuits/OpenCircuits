import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export const Importer = (() => {
    return {
        read: function(designer: CircuitDesigner, fileContents: string): string {
            const root = <XMLDocument>new DOMParser().parseFromString(fileContents, "text/xml");
            if (root.documentElement.nodeName == "parsererror")
                return;

            const reader = new XMLReader(root);

            // Check for old version of save
            if (reader.getVersion() == -1)
                ResolveVersionConflict(reader);

            designer.load(reader.getRoot());

            return reader.getName();
        },
        loadFile: function(designer: CircuitDesigner, file: File, setName: (n: string) => void): void {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            const open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                designer.reset();

                const reader = new FileReader();
                reader.onload = () => {
                    setName(this.read(designer, reader.result.toString()));
                }

                reader.readAsText(file);
            }
        }
    }

})();
