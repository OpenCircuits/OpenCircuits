import {V, Vector} from "Vector";
import {AssemblerParams, AssemblyReason} from "./Assembler";
import {ComponentAssembler} from "./ComponentAssembler";
import {Schema} from "../../schema";
import {GUID} from "../../public";
import {MapObj} from "../../utils/Functions";


export class ICComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams, icId: GUID) {
        // Get IC and ports by group for making PortFactory
        const ic = params.circuit.getICInfo(icId).unwrap();
        const ports = ic.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {});

        super(
            params,
            MapObj(ports, ([_, pins]) =>
                (ic: Schema.Component, index: number, _total: number) => {
                    const data = this.circuit.getICInfo(ic.kind).unwrap().metadata;

                    // TODO: This feels bad
                    const pin = data.pins.find((p) => (p.id === pins[index].id))!;

                    const size = V(data.displayWidth, data.displayHeight);
                    return {
                        origin: Vector.Clamp(V(pin.x, pin.y), V(-1, -1), V(1, 1)).scale(size.scale(0.5)),
                        dir:    V(pin.dx, pin.dy),
                        // dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                        //     ? V(1, 0).scale(Math.sign(pos.x))
                        //     : V(0, 1).scale(Math.sign(pos.y)),
                    }}),
            [{
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            }]
        );
    }

    protected override getSize(comp: Schema.Component): Vector {
        const icInfo = this.circuit.getICInfo(comp.kind).unwrap();
        return V(icInfo.metadata.displayWidth, icInfo.metadata.displayHeight);
    }
}
