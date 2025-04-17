import {VersionConflictResolver} from "digital/site/utils/DigitalVersionConflictResolver";
import {useMainDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";
import {Header} from "shared/site/containers/Header";
import {DigitalProtoSchema} from "digital/site/proto";
import {ProtoSchema} from "shared/site/proto";
import {Schema} from "digital/api/circuit/schema";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {v4, parse} from "uuid";



export const DigitalHeader = () => {
    const mainDesigner = useMainDigitalDesigner();

    return (
        <Header img="img/icons/logo.svg" 
                extraUtilities={[
                    {
                        popupName: "expr_to_circuit",
                        img:       "img/icons/bool_expr_input_icon.svg",
                        text:      "Boolean Expression to Circuit",
                    },
                ]}
                versionConflictResolver={VersionConflictResolver}
                serialize={() => {
                    const schema = mainDesigner.circuit.toSchema();

                    function GetProps(obj: Schema.Core.Obj): Record<string, ProtoSchema.Prop> {
                        return MapObj(obj.props, ([_key, prop]) =>
                                    (typeof prop === "boolean"
                                        ? { boolVal: prop }
                                        : (typeof prop === "number")
                                        ? (Number.isInteger(prop)
                                            ? { intVal: prop }
                                            : { floatVal: prop })
                                        : (typeof prop === "string")
                                        ? { strVal: prop } : {}));
                    }

                    function LoadObjs(objs: Schema.Core.Obj[]): { components: ProtoSchema.Component[], wires: ProtoSchema.Wire[], ports: ProtoSchema.Port[] } {
                        return {
                            components: objs
                                .filter((o) => (o.baseKind === "Component"))
                                .map((c) => ({
                                    id:    parse(c.id) as Uint8Array,
                                    kind:  c.kind,
                                    props: GetProps(c),
                                })),
                            wires: objs
                                .filter((o) => (o.baseKind === "Wire"))
                                .map((w) => ({
                                    id:    parse(w.id) as Uint8Array,
                                    kind:  w.kind,
                                    props: GetProps(w),
                                    p1:    parse(w.p1) as Uint8Array,
                                    p2:    parse(w.p2) as Uint8Array,
                                })),
                            ports: objs
                                .filter((o) => (o.baseKind === "Port"))
                                .map((p) => ({
                                    id:     parse(p.id) as Uint8Array,
                                    kind:   p.kind,
                                    props:  GetProps(p),
                                    parent: parse(p.parent) as Uint8Array,
                                    group:  p.group,
                                    index:  p.index,
                                })),
                        };
                    }

                    function LoadSignal(signal: Signal): DigitalProtoSchema.DigitalSimState_Signal {
                        return (signal === Signal.On
                            ? DigitalProtoSchema.DigitalSimState_Signal.On
                            : (signal === Signal.Off)
                            ? DigitalProtoSchema.DigitalSimState_Signal.Off
                            : (signal === Signal.Metastable)
                            ? DigitalProtoSchema.DigitalSimState_Signal.Metastable
                            : DigitalProtoSchema.DigitalSimState_Signal.UNRECOGNIZED);
                    }

                    function LoadSimState(state: Schema.DigitalSimState): DigitalProtoSchema.DigitalSimState {
                        return {
                            signals:  MapObj(state.signals,  ([_id, signal]) => LoadSignal(signal)),
                            states:   MapObj(state.states,   ([_id, state])  => ({ state: state.map(LoadSignal) })),
                            icStates: MapObj(state.icStates, ([_id, state])  => LoadSimState(state)),
                        };
                    }

                    const proto = DigitalProtoSchema.DigitalCircuit.create({
                        circuit: {
                            metadata: {
                                ...schema.metadata,
                                id: parse(schema.metadata.id) as Uint8Array,
                            },
                            camera: schema.camera,
                            ics:    schema.ics.map((ic) => ({
                                metadata: {
                                    metadata: {
                                        id:   parse(ic.metadata.id) as Uint8Array,
                                        name: ic.metadata.name,
                                    },
                                    displayWidth:  ic.metadata.displayWidth,
                                    displayHeight: ic.metadata.displayHeight,
                                    pins:          ic.metadata.pins.map((p) => ({
                                        ...p,
                                        id: parse(p.id) as Uint8Array,
                                    })),
                                },
                                ...LoadObjs(ic.objects),
                            })),
                            ...LoadObjs(schema.objects),
                        },

                        propagationTime: schema.propagationTime,

                        icInitialSimStates: schema.ics.map((ic) => LoadSimState(ic.initialSimState)),

                        simState: LoadSimState(schema.simState),
                    });

                    return new Blob([DigitalProtoSchema.DigitalCircuit.encode(proto).finish()]);
                    // return new Blob([JSON.stringify(schema)], { type: "text/json" });
                }} />
    )
};
