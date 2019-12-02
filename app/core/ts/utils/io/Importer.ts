import {SAVED} from "../Config";

import {Deserialize, serializable} from "serialeazy";
import {CircuitMetadata} from "core/models/CircuitMetadata";
import {CircuitDesigner} from "core/models/CircuitDesigner";

@serializable("Circuit")
export class Circuit {
    private metadata: CircuitMetadata;
    private contents: CircuitDesigner;

    public constructor(metadata?: CircuitMetadata, contents?: CircuitDesigner) {
        this.metadata = metadata;
        this.contents = contents;
    }

    public getMetadata(): CircuitMetadata {
        return this.metadata;
    }

    public getContents(): CircuitDesigner {
        return this.contents;
    }
}

export const Importer = (() => {
    return {
        LoadCircuit: function(fileContents: string): Circuit {
            return Deserialize<Circuit>(fileContents);
        },
        PromptLoadCircuit: function(contents: string): Circuit {
            const open = SAVED || confirm("Are you sure you want overwrite your current scene?");
            if (open)
                return this.LoadCircuit(contents);
            return undefined;
        },
        PromptLoadCircuitFromFile: function(file: File): Promise<Circuit> {
            return new Promise<Circuit>((resolve, reject) => {
                const open = SAVED || confirm("Are you sure you want to overwrite your current scene?");

                if (open) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(this.LoadCircuit(reader.result.toString()))
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
