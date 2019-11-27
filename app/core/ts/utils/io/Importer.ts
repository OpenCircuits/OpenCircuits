import {SAVED} from "../Config";
import {Vector} from "Vector";
import {XMLReader} from "./xml/XMLReader";
import {ResolveVersionConflict} from "./VersionConflictResolver";
import {Camera} from "math/Camera";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export const Importer = (() => {
    return {
        LoadCircuit: function(designer: DigitalCircuitDesigner, fileContents: string | XMLDocument, camera?: Camera): string {

            const root = (fileContents instanceof XMLDocument) ? (fileContents) : (<XMLDocument>new DOMParser().parseFromString(fileContents, "text/xml"));
            if (root.getElementsByTagName("parsererror").length > 0)
                return;

            const reader = new XMLReader(root);

            // Check for old version of save
            if (reader.getVersion() == -1)
                ResolveVersionConflict(reader);

            designer.load(reader.getContentsNode());
            
            if (camera) {
                const camNode = reader.getCameraNode();
                if (camNode) {
                    const camPos = new Vector(camNode.getFloatAttribute("x"),camNode.getFloatAttribute("y"));
                    const zoom = camNode.getFloatAttribute("zoom");
                    camera.setZoom(zoom);
                    camera.setPos(camPos);
                }
            }

            return reader.getName();
        },
        PromptLoadCircuit: function(designer: DigitalCircuitDesigner, contents: string | XMLDocument, camera: Camera): string {
            const open = SAVED || confirm("Are you sure you want overwrite your current scene?");

            if (open) {
                designer.reset();

                return this.LoadCircuit(designer, contents, Camera);
            }

            return undefined;
        },
        PromptLoadCircuitFromFile: function(designer: DigitalCircuitDesigner, file: File, camera: Camera): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                const open = SAVED || confirm("Are you sure you want to overwrite your current scene?");

                if (open) {
                    designer.reset();

                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(this.LoadCircuit(designer, reader.result.toString(), camera));
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
