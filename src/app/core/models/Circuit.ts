import {Serialize, serializable} from "serialeazy";

import {Camera} from "math/Camera";

import {CircuitDesigner}    from "./CircuitDesigner";
import {CircuitMetadataDef} from "./CircuitMetadata";

// THIS IS ALL A HACK
// TODO: improve serialeazy to allow specifying set ids for reference
//  so that it's easier to interface with and we can just Deserialize<Circuit>

@serializable("ContentsData")
export class ContentsData {
    public designer: CircuitDesigner;
    public camera: Camera;

    public constructor(designer?: CircuitDesigner, camera?: Camera) {
        this.designer = designer!;
        this.camera = camera!;
    }
}

export class Circuit {
    public metadata: CircuitMetadataDef;
    public contents: string;

    public constructor(metadata?: CircuitMetadataDef, designer?: CircuitDesigner, camera?: Camera) {
        this.metadata = metadata!;
        this.contents = Serialize(new ContentsData(designer, camera));
    }
}
