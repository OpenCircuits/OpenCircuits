import {SAVED} from "../Config";

import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {DigitalCircuitController} from "site/digital/controllers/DigitalCircuitController";
import {Vector} from "Vector";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export const Importer = (() => {
    return {
        LoadCircuit: function(main: DigitalCircuitController, fileContents: string | XMLDocument): string {
            const designer = main.getDesigner();
            const name = this.PasteCircuit(designer,fileContents);
            const root = (fileContents instanceof XMLDocument) ? (fileContents) : (<XMLDocument>new DOMParser().parseFromString(fileContents, "text/xml"));
            if (root.getElementsByTagName("parsererror").length > 0)
                return;

            const reader = new XMLReader(root);

            const camNode = reader.getCameraNode();
            const camPos = new Vector(camNode.getFloatAttribute("x"),camNode.getFloatAttribute("y"));
            const zoom = camNode.getFloatAttribute("zoom");
            main.getCamera().zoomBy(zoom);
            main.getCamera().setPos(camPos);
            return name;
        },
        PasteCircuit: function(designer: DigitalCircuitDesigner, fileContents: string | XMLDocument): string {
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
        PromptLoadCircuit: function(main: DigitalCircuitController, contents: string | XMLDocument): string {
            const designer = main.getDesigner();
            const open = SAVED || confirm("Are you sure you want overwrite your current scene?");

            if (open) {
                designer.reset();

                return this.LoadCircuit(main, contents);
            }

            return undefined;
        },
        PromptLoadCircuitFromFile: function(main: DigitalCircuitController, file: File): Promise<string> {
            const designer = main.getDesigner();
            return new Promise<string>((resolve, reject) => {
                const open = SAVED || confirm("Are you sure you want to overwrite your current scene?");

                if (open) {
                    designer.reset();

                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(this.LoadCircuit(main, reader.result.toString()));
                    }
                    reader.onabort = reader.onerror = () => { reject("Failed to load file!"); };

                    reader.readAsText(file);
                } else {
                    reject("User cancelled save");
                }
            });
        }
    }

})();
