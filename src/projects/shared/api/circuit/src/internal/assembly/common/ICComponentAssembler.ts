import {V, Vector} from "Vector";
import {Assembler, AssemblerParams, AssemblyReason} from "../Assembler";
import {Schema} from "../../../schema";
import {MapObj} from "../../../utils/Functions";
import {Rect} from "math/Rect";
import {Transform} from "math/Transform";
import {PortAssembler} from "../PortAssembler";


export class ICComponentAssembler extends Assembler<Schema.Component> {
    public constructor(params: AssemblerParams) {
        super(params, {
            "x":     AssemblyReason.TransformChanged,
            "y":     AssemblyReason.TransformChanged,
            "angle": AssemblyReason.TransformChanged,
        });
    }

    protected getICInfo(comp: Schema.Component) {
        return this.circuit.getICInfo(comp.icId!).unwrap();
    }

    protected getPos(comp: Schema.Component): Vector {
        return V(comp.props.x ?? 0, comp.props.y ?? 0);
    }

    protected getAngle(comp: Schema.Component): number {
        return comp.props.angle ?? 0;
    }

    protected getSize(comp: Schema.Component): Vector {
        const icInfo = this.getICInfo(comp);
        return V(icInfo.metadata.displayWidth, icInfo.metadata.displayHeight);
    }

    private assembleText(comp: Schema.Component) {
        const icInfo = this.getICInfo(comp);
        const name = icInfo.metadata.name;
        const bounds = this.options.textMeasurer?.getBounds(this.options.fontStyle(), name) ?? new Rect(V(), V());
        return {
            kind:     "Text",
            pos:      this.getPos(comp),
            contents: name,
            angle:    this.getAngle(comp),
            offset:   bounds.center,
        } as const
    }

    public override assemble(comp: Schema.Component, reasons: Set<AssemblyReason>) {
        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);
        const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);
        const portsChanged     = reasons.has(AssemblyReason.PortsChanged);

        if (added || transformChanged) {
            this.cache.componentTransforms.set(comp.id, new Transform(
                this.getPos(comp),
                this.getAngle(comp),
                this.getSize(comp),
            ));
        }

        if (added || transformChanged || selectionChanged || portsChanged) {
            // Get IC and ports by group for making PortFactory
            const icInfo = this.getICInfo(comp);
            const ports = icInfo.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
                ...prev,
                [pin.group]: [...(prev[pin.group] ?? []), pin],
            }), {});

            const portAssembler = new PortAssembler(
                { cache: this.cache, circuit: this.circuit, options: this.options },
                 MapObj(ports, ([_, pins]) =>
                    (ic: Schema.Component, index: number, _total: number) => {
                        // TODO: This feels bad
                        const pin = icInfo.metadata.pins.find((p) => (p.id === pins[index].id))!;

                        return {
                            origin: Vector.Clamp(V(pin.x, pin.y), V(-1, -1), V(1, 1)).scale(0.5),
                            dir:    V(pin.dx, pin.dy),
                            // dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                            //     ? V(1, 0).scale(Math.sign(pos.x))
                            //     : V(0, 1).scale(Math.sign(pos.y)),
                        }}),
                (comp) => this.getSize(comp),
            );

            portAssembler.assemble(comp, reasons);
        }

        if (added || transformChanged) {
            this.cache.componentPrims.set(comp.id, [
                {
                    kind:      "Rectangle",
                    transform: this.cache.componentTransforms.get(comp.id)!,
                    style:     this.options.fillStyle(this.isSelected(comp.id)),
                },
                {
                    ...this.assembleText(comp),
                    fontStyle: this.options.fontStyle(),
                },
            ]);
        } else if (selectionChanged) {
            const [rect, _] = this.cache.componentPrims.get(comp.id)!;

            if (rect.kind !== "Rectangle") {
                console.error(`Invalid prim type in ICComponentAssembler! ${rect.kind}`);
                return;
            }
            rect.style = this.options.fillStyle(this.isSelected(comp.id));
        }
    }
}
