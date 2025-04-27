/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable @typescript-eslint/no-unused-vars */
// This file has "bridge" functions from the internal rep (Circuit.Schema)
// to the wire rep (Circuit.proto) and vice versa.

import * as uuid from "uuid";

import {MapObj}       from "shared/api/circuit/utils/Functions";
import {GUID, Schema} from "shared/api/circuit/schema";

import * as ProtoSchema from "./Circuit";


export function SchemaToProto(schema: Schema.Circuit): ProtoSchema.Circuit {
    function ConvertId(id: GUID): Uint8Array {
        return uuid.parse(id) as Uint8Array;
    }

    function ConvertProps(props: Schema.Obj["props"]): Record<string, ProtoSchema.Prop> {
        return MapObj(props, ([_key, prop]) =>
                    (typeof prop === "boolean"
                        ? { boolVal: prop }
                        : (typeof prop === "number")
                        ? (Number.isInteger(prop)
                            ? { intVal: prop }
                            : { floatVal: prop })
                        : (typeof prop === "string")
                        ? { strVal: prop } : {}));
    }

    function ConvertComponent(c: Schema.Component): ProtoSchema.Component {
        return {
            id:    ConvertId(c.id),
            kind:  c.kind,
            props: ConvertProps(c.props),
        };
    }

    function ConvertWire(w: Schema.Wire): ProtoSchema.Wire {
        return {
            id:    ConvertId(w.id),
            kind:  w.kind,
            props: ConvertProps(w.props),
            p1:    ConvertId(w.p1),
            p2:    ConvertId(w.p2),
        };
    }

    function ConvertPort(p: Schema.Port): ProtoSchema.Port {
        return {
            id:     ConvertId(p.id),
            kind:   p.kind,
            props:  ConvertProps(p.props),
            parent: ConvertId(p.parent),
            group:  p.group,
            index:  p.index,
        };
    }

    function ConvertObjs(objs: Schema.Obj[]) {
        return {
            components: objs
                .filter((o) => (o.baseKind === "Component"))
                .map(ConvertComponent),
            wires: objs
                .filter((o) => (o.baseKind === "Wire"))
                .map(ConvertWire),
            ports: objs
                .filter((o) => (o.baseKind === "Port"))
                .map(ConvertPort),
        };
    }

    function ConvertMetadata(metadata: Schema.CircuitMetadata): ProtoSchema.CircuitMetadata {
        return {
            ...metadata,
            id: ConvertId(metadata.id),
        };
    }

    function ConvertICMetadata(metadata: Schema.IntegratedCircuitMetadata): ProtoSchema.IntegratedCircuitMetadata {
        return {
            metadata:      ConvertMetadata(metadata),
            displayWidth:  metadata.displayWidth,
            displayHeight: metadata.displayHeight,
            pins:          metadata.pins.map((p) => ({
                ...p,
                id: ConvertId(p.id),
            })),
        };
    }

    function ConvertIC(ic: Schema.IntegratedCircuit): ProtoSchema.IntegratedCircuit {
        return {
            metadata: ConvertICMetadata(ic.metadata),
            ...ConvertObjs(ic.objects),
        };
    }

    return ProtoSchema.Circuit.create({
        metadata: ConvertMetadata(schema.metadata),
        camera:   schema.camera,
        ics:      schema.ics.map(ConvertIC),
        ...ConvertObjs(schema.objects),
    });
}

export function ProtoToSchema(proto: ProtoSchema.Circuit): Schema.Circuit {
    function ConvertId(id: Uint8Array): GUID {
        return uuid.stringify(id);
    }

    function ConvertProps(props: Record<string, ProtoSchema.Prop>): Schema.Obj["props"] {
        return MapObj(props, ([_key, prop]) =>
                        prop.boolVal ?? prop.floatVal ?? prop.intVal ?? prop.strVal ?? "");
    }

    function ConvertComponent(c: ProtoSchema.Component): Schema.Component {
        return {
            baseKind: "Component",
            ...c,
            id:       ConvertId(c.id),
            props:    ConvertProps(c.props),
        };
    }

    function ConvertWire(w: ProtoSchema.Wire): Schema.Wire {
        return {
            baseKind: "Wire",
            ...w,
            id:       ConvertId(w.id),
            props:    ConvertProps(w.props),
            p1:       ConvertId(w.p1),
            p2:       ConvertId(w.p2),
        };
    }

    function ConvertPort(p: ProtoSchema.Port): Schema.Port {
        return {
            baseKind: "Port",
            ...p,
            id:       ConvertId(p.id),
            props:    ConvertProps(p.props),
            parent:   ConvertId(p.parent),
        };
    }

    function ConvertObjs(components: ProtoSchema.Component[], wires: ProtoSchema.Wire[], ports: ProtoSchema.Port[]): Schema.Obj[] {
        return [
            ...components.map(ConvertComponent),
            ...wires.map(ConvertWire),
            ...ports.map(ConvertPort),
        ];
    }

    function ConvertMetadata(metadata: ProtoSchema.CircuitMetadata): Schema.CircuitMetadata {
        return {
            ...metadata,
            id:      ConvertId(metadata.id),
            version: metadata.version as `${string}/${string}`,  // TODO[]
        };
    }

    function ConvertICMetadata(metadata: ProtoSchema.IntegratedCircuitMetadata): Schema.IntegratedCircuitMetadata {
        if (!metadata.metadata || !metadata.metadata.id)
            throw new Error(`ProtoToSchema.ConvertICMetadata: Failed to find metadata! ${metadata}`);
        return {
            ...ConvertMetadata(metadata.metadata),
            id:            ConvertId(metadata.metadata.id),
            displayWidth:  metadata.displayWidth,
            displayHeight: metadata.displayHeight,
            pins:          metadata.pins.map((p) => ({
                ...p,
                id: ConvertId(p.id),
            })),
        };
    }

    function ConvertIC(ic: ProtoSchema.IntegratedCircuit): Schema.IntegratedCircuit {
        if (!ic.metadata)
            throw new Error(`ProtoToSchema.ConvertIC: Failed to find metadata! ${ic}`);
        return {
            metadata: ConvertICMetadata(ic.metadata),
            objects:  ConvertObjs(ic.components, ic.wires, ic.ports),
        };
    }

    if (!proto.metadata)
        throw new Error(`ProtoToSchema: Failed to find metadata! ${proto}`);

    return {
        metadata: ConvertMetadata(proto.metadata),
        camera:   proto.camera ?? { x: 0, y: 0, zoom: 0.02 },
        ics:      proto.ics.map(ConvertIC),
        objects:  ConvertObjs(proto.components, proto.wires, proto.ports),
    };
}
