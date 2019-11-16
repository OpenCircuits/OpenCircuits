import {SAVED} from "../Config";

import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import { MainDesignerController } from "site/shared/controllers/MainDesignerController";
import { DigitalCircuitController } from "site/digital/controllers/DigitalCircuitController";
import { Vector } from "Vector";

export const Importer = (() => {
    return {
        LoadCircuit: function(main: DigitalCircuitController, fileContents: string | XMLDocument): string {
            const designer = main.getDesigner();
            const root = (fileContents instanceof XMLDocument) ? (fileContents) : (<XMLDocument>new DOMParser().parseFromString(fileContents, "text/xml"));
            if (root.getElementsByTagName("parsererror").length > 0)
                return;

            const reader = new XMLReader(root);

            // Check for old version of save
            if (reader.getVersion() == -1)
                ResolveVersionConflict(reader);

            designer.load(reader.getContentsNode());
            const camPos = new Vector(reader.getCameraNode().getFloatAttribute("x"),reader.getCameraNode().getFloatAttribute("y"));
            main.getCamera().setPos(camPos);
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
