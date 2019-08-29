import {SAVED} from "../Config"

import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {CircuitDesigner} from "../../models/CircuitDesigner";

export const Importer = (() => {
    return {
        LoadCircuit: function(designer: CircuitDesigner, fileContents: string | XMLDocument): string {
            const root = (fileContents instanceof XMLDocument) ? (fileContents) : (<XMLDocument>new DOMParser().parseFromString(fileContents, "text/xml"));
            if (root.getElementsByTagName("parsererror").length > 0)
                return;

            const reader = new XMLReader(root);

            // Check for old version of save
            if (reader.getVersion() == -1)
                ResolveVersionConflict(reader);

            designer.load(reader.getContentsNode());

            return reader.getName();
        },
        PromptLoadCircuit: function(designer: CircuitDesigner, contents: string | XMLDocument, setName: (n: string) => void): void {
            const open = SAVED || confirm("Are you sure you want overwrite your current scene?");

            if (open) {
                designer.reset();

                setName(this.LoadCircuit(designer, contents));
            }
        },
        PromptLoadCircuitFromFile: function(designer: CircuitDesigner, file: File, setName: (n: string) => void): void {
            const open = SAVED || confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                designer.reset();

                const reader = new FileReader();
                reader.onload = () => {
                    setName(this.LoadCircuit(designer, reader.result.toString()));
                }

                reader.readAsText(file);
            }
        }
    }

})();
