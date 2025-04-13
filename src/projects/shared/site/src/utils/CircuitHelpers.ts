import {Circuit} from "shared/api/circuit/public";
import {Schema} from "shared/api/circuit/schema";


export function LoadCircuit(mainCircuit: Circuit, schema: Schema.Circuit) {
    mainCircuit.name = schema.metadata.name;
    mainCircuit.desc = schema.metadata.desc;
    mainCircuit.loadSchema(schema);
}
