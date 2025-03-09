import {RootCircuit} from "shared/api/circuit/public";
import {Schema} from "shared/api/circuit/schema";


export function LoadCircuit(mainCircuit: RootCircuit, data: string) {
    // TODO: Validate data
    const schema = JSON.parse(data) as Schema.RootCircuit;

    mainCircuit.name = schema.metadata.name;
    mainCircuit.desc = schema.metadata.desc;
    mainCircuit.loadSchema(schema);
}
