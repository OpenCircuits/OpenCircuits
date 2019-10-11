import {SAVED} from "../Config";

import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export const Importer = (() => {
    return {
        LoadCircuit: function(designer: DigitalCircuitDesigner, fileContents: string | XMLDocument): string {
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
        PromptLoadCircuit: function(designer: DigitalCircuitDesigner, contents: string | XMLDocument): string {
            const open = SAVED || confirm("Are you sure you want overwrite your current scene?");

            if (open) {
                designer.reset();

                return this.LoadCircuit(designer, contents);
            }

            return undefined;
        },
        PromptLoadCircuitFromFile: function(designer: DigitalCircuitDesigner, file: File): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                const open = SAVED || confirm("Are you sure you want to overwrite your current scene?");

                if (open) {
                    designer.reset();
    
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(this.LoadCircuit(designer, reader.result.toString()));
                    }
                    reader.onabort = reader.onerror = reject;
    
                    reader.readAsText(file);
                }
                reject();
            });
        }
    }

})();
