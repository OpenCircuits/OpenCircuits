import {CircuitMetadataDef} from "./CircuitMetadata";

// THIS IS A HACK
// TODO: improve serialeazy to allow specifying set ids for reference
//  so that it's easier to interface with and we can just Deserialize<Circuit>
export class Circuit {
    public metadata: CircuitMetadataDef;
    public contents: string;

    public constructor(metadata?: CircuitMetadataDef, contents?: string) {
        this.metadata = metadata;
        this.contents = contents;
    }
}