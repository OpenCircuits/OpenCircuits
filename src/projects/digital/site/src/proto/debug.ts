/* eslint-disable no-console */
import {ProtoSchema} from "shared/site/proto";

import {DigitalProtoSchema} from ".";


export function PrintDebugStats(proto: DigitalProtoSchema.DigitalCircuit) {
    const CalcStats = (b: Uint8Array[]) => {
        const lens = b.map((x) => x.byteLength);
        const sum = lens.reduce((a, b) => (a + b), 0);
        return {
            sum,
            avg:     sum / lens.length,
            min:     Math.min(...lens),
            max:     Math.max(...lens),
            distrib: lens.reduce((counts, cur) => ({ ...counts, [cur]: (counts[cur] ?? 0) + 1 }), {} as Record<number, number>),
        };
    }

    console.debug("Debug stats for serialized circuit:")

    const serialized = DigitalProtoSchema.DigitalCircuit.encode(proto).finish();
    console.debug(`  Total size: ${serialized.byteLength} bytes`);

    console.debug(`  Circuit: ${ProtoSchema.Circuit.encode(proto.circuit!).finish().byteLength} bytes`);
    console.debug(`    Metadata: ${ProtoSchema.CircuitMetadata.encode(proto.circuit!.metadata!).finish().byteLength} bytes`);
    console.debug(`    Camera: ${ProtoSchema.Camera.encode(proto.circuit!.camera!).finish().byteLength} bytes`);

    const ics = proto.circuit!.ics ?? [];
    const encodedICs = ics.map((ic) => ProtoSchema.IntegratedCircuit.encode(ic).finish());
    const icStats = CalcStats(encodedICs);
    console.debug(`    ICs: ${icStats.sum} bytes`);
    encodedICs.zip(ics).forEach(([b, ic], i) => {
        console.debug(`      ${i}: ${b.byteLength} bytes`);

        console.debug(`        Metadata: ${ProtoSchema.IntegratedCircuitMetadata.encode(ic.metadata!).finish().byteLength} bytes`);

        const comps = ic.components ?? [];
        const encodedComps = comps.map((c) => ProtoSchema.Component.encode(c).finish());
        const compStats = CalcStats(encodedComps);
        console.debug(`        Components: ${compStats.sum} bytes`);
        console.debug(`          Count: ${comps.length} total`);
        console.debug(`          Avg: ${compStats.avg} bytes / comp, Min: ${compStats.min} bytes, Max: ${compStats.max} bytes`);
        console.debug(`          Distribution: ${Object.keys(compStats.distrib).map((s) => parseInt(s)).sort((a,b) => (a-b)).map((key) => (key + ":" + compStats.distrib[key])).join(", ")}`);
        const wires = ic.wires ?? [];
        const encodedWires = wires.map((w) => ProtoSchema.Wire.encode(w).finish());
        const wireStats = CalcStats(encodedWires);
        console.debug(`        Wires: ${wireStats.sum} bytes`);
        console.debug(`          Count: ${wires.length} total`);
        console.debug(`          Avg: ${wireStats.avg} bytes / wire, Min: ${wireStats.min} bytes, Max: ${wireStats.max} bytes`);
        console.debug(`          Distribution: ${Object.keys(wireStats.distrib).map((s) => parseInt(s)).sort((a,b) => (a-b)).map((key) => (key + ":" + wireStats.distrib[key])).join(", ")}`);
    });

    const comps = proto.circuit?.components ?? [];
    const encodedComps = comps.map((c) => ProtoSchema.Component.encode(c).finish());
    const compStats = CalcStats(encodedComps);
    console.debug(`    Components: ${compStats.sum} bytes`);
    console.debug(`      Count: ${comps.length} total`);
    console.debug(`      Avg: ${compStats.avg} bytes / comp, Min: ${compStats.min} bytes, Max: ${compStats.max} bytes`);
    console.debug(`      Distribution: ${Object.keys(compStats.distrib).map((s) => parseInt(s)).sort((a,b) => (a-b)).map((key) => (key + ":" + compStats.distrib[key])).join(", ")}`);
    const wires = proto.circuit?.wires ?? [];
    const encodedWires = wires.map((w) => ProtoSchema.Wire.encode(w).finish());
    const wireStats = CalcStats(encodedWires);
    console.debug(`    Wires: ${wireStats.sum} bytes`);
    console.debug(`      Count: ${wires.length} total`);
    console.debug(`      Avg: ${wireStats.avg} bytes / wire, Min: ${wireStats.min} bytes, Max: ${wireStats.max} bytes`);
    console.debug(`      Distribution: ${Object.keys(wireStats.distrib).map((s) => parseInt(s)).sort((a,b) => (a-b)).map((key) => (key + ":" + wireStats.distrib[key])).join(", ")}`);

    const encodedIcSimStates = proto.icInitialSimStates!.map((ic) => DigitalProtoSchema.DigitalSimState.encode(ic).finish());
    const icSimStateStats = CalcStats(encodedIcSimStates);
    console.debug(`  ICInitialSimStates: ${icSimStateStats.sum} bytes`);
    encodedIcSimStates.forEach((c, i) =>
        console.debug(`    ${i}: ${c.byteLength} bytes`));
    console.debug(`  SimState: ${DigitalProtoSchema.DigitalSimState.encode(proto.simState!).finish().byteLength} bytes`);
}
