import {DigitalProtoSchema} from "digital/site/proto";

import {IsV3_0, V3_0Migrator} from "./v3_0";


interface VersionMigratorResult {
    schema: DigitalProtoSchema.DigitalCircuit;
    warnings: string[];
}
export function VersionMigrator(fileContents: string): VersionMigratorResult {
    const json = JSON.parse(fileContents);

    if (IsV3_0(json))
        return V3_0Migrator(json);

    return {
        schema:   json as DigitalProtoSchema.DigitalCircuit,
        warnings: [],
    };
}
