import {Schema}      from "core/schema";
import {DirtyVar}    from "core/utils/DirtyVar";
import {AddErrE}     from "core/utils/MultiError";
import {Transform}   from "math/Transform";
import {SVGDrawing}  from "svg2canvas";
import {V, Vector}   from "Vector";
import {GUID}        from "..";
import {BaseView}    from "./BaseView";
import {RenderState} from "./rendering/RenderState";
import {Circle}      from "./rendering/shapes/Circle";
import {Line}        from "./rendering/shapes/Line";


export interface PortPos {
    origin: Vector;
    target: Vector;
    dir: Vector;
}
export type PartialPortPos = {
    origin: Vector;
    target: Vector;
    dir?: undefined;
} | {
    origin: Vector;
    target?: undefined;
    dir: Vector;
} | PortPos;

export abstract class ComponentView extends BaseView {
    protected transform: DirtyVar<Transform>;
    protected img?: SVGDrawing;

    public constructor(compID: GUID, state: RenderState, imgSrc?: string) {
        super(compID, state);

        this.transform = new DirtyVar(() => new Transform(
            V(this.component.props.x ?? 0, this.component.props.y ?? 0),
            this.size,
            (this.component.props.angle ?? 0),
        ));

        // Get image if passed an image
        if (imgSrc) {
            this.img = state.options.getImage(imgSrc);
            if (!this.img)
                throw new Error(`ComponentView: failed to get image ${imgSrc} for Component ${compID}`);
        }
    }

    protected get component() {
        return this.circuit.getCompByID(this.objID)
            .mapErr(AddErrE(`ComponentView: Failed to find component with ID ${this.objID}!`))
            .unwrap();
    }

    protected getPorts(group: string) {
        return this.circuit.getPortsForComponent(this.objID)
            .map((ports) => [...ports]
                .map((id) => this.circuit.getPortByID(id).unwrap())
                .filter((p) => (p.group === group)));
    }

    protected numPorts(group: string) {
        return this.getPorts(group).map((ports) => ports.length);
    }

    protected override renderInternal(): void {
        const { renderer } = this.state;

        // Transform into local space
        renderer.transform(this.transform.get().getMatrix());

        this.renderPorts();
        this.renderComponent();
        this.drawImg();
    }

    protected renderPorts(): void {
        const { renderer, selections, options } = this.state;

        const ports = this.circuit.getPortsForComponent(this.objID).unwrap();

        ports.forEach((id) => {
            const port = this.circuit.getPortByID(id);
            if (!port.ok)
                throw new Error(`ComponentView: Failed to find port with ID ${id}!`);

            const { origin, target } = this.getPortPos(port.unwrap());
            const { lineStyle, circleStyle } = options.portStyle(selections.has(id), this.isSelected);

            // Render port
            renderer.draw(new Line(origin, target), lineStyle);
            renderer.draw(new Circle(target, options.defaultPortRadius), circleStyle);
        });
    }

    protected renderComponent(): void {}

    protected drawImg(): void {
        // Check if we should draw image
        if (!this.img)
            return;
        const { renderer, selections, options } = this.state;

        const selected = selections.has(this.objID);
        const tint = (selected ? options.selectedFillColor : undefined);

        renderer.image(this.img, V(), this.size, tint);
    }

    // Temporary hack
    public setDirty(): void {
        this.transform.setDirty();
    }

    public getPortPos(port: Readonly<Schema.Port>): PortPos {
        const pPos = this.calcPortPosition(port.group, port.index);

        const origin = pPos.origin;
        const target = (pPos.target ?? origin.add(pPos.dir.scale(this.state.options.defaultPortLength)));
        const dir    = (pPos.dir    ?? target.sub(origin).normalize());

        return { origin, target, dir };
    }

    public getWorldPortPos(port: Readonly<Schema.Port>): PortPos {
        const { origin, target, dir } = this.getPortPos(port);
        return {
            origin: this.transform.get().toWorldSpace(origin),
            target: this.transform.get().toWorldSpace(target),
            dir:    dir.rotate(this.transform.get().getAngle()),
        };
    }

    protected abstract calcPortPosition(group: string, index: number): PartialPortPos;

    protected abstract get size(): Vector;
}
