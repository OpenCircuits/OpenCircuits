import {Schema}             from "core/schema";
import {DirtyVar}           from "core/utils/DirtyVar";
import {BezierCurve}        from "math/BezierCurve";
import {Rect}               from "math/Rect";
import {Vector}             from "Vector";
import {GUID, GetDebugInfo} from "..";
import {BaseView}           from "./BaseView";
import {ComponentView}      from "./ComponentView";
import {RenderState}        from "./rendering/RenderState";
import {Curve}              from "./rendering/shapes/Curve";


export class WireView extends BaseView {
    protected components: Map<GUID, ComponentView>;

    protected curve: DirtyVar<BezierCurve>;

    public constructor(wireID: GUID, state: RenderState, comps: Map<GUID, ComponentView>) {
        super(wireID, state);

        this.components = comps;

        this.curve = new DirtyVar(() => {
            const [port1, port2] = this.circuit.getPortsForWire(this.objID).map((p) => this.circuit.getPortByID(p)!);
            const [p1, c1] = this.getCurvePoints(port1);
            const [p2, c2] = this.getCurvePoints(port2);
            return new BezierCurve(p1, p2, c1, c2);
        });
    }

    protected get wire() {
        const wire = this.circuit.getWireByID(this.objID);
        if (!wire)
            throw new Error(`WireView: Failed to find wire with ID: ${this.objID}`);
        return wire;
    }

    protected get color(): string {
        return (this.wire.props["color"] ?? "#ffffff");
    }

    protected getCurvePoints(port: Readonly<Schema.Port>): [Vector, Vector] {
        const parent = this.components.get(port.parent);
        if (!parent)
            throw new Error(`WireView: Failed to find ComponentView for parent of ${GetDebugInfo(port)}`);
        const { target, dir } = parent.getWorldPortPos(port);
        return [target, target.add(dir.scale(1))];
    }

    protected override renderInternal(): void {
        const { renderer, options } = this.state;

        renderer.draw(new Curve(this.curve.get()), options.wireStyle(this.isSelected, this.color));
    }

    // Temporary hack
    public setDirty(): void {
        this.curve.setDirty();
    }

    protected override getBounds(): Rect {
        throw new Error("Method not implemented.");
    }
}
