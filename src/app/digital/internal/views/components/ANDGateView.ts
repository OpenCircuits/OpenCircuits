import {GUID} from "core/internal";
import {ComponentView, PartialPortPos} from "core/internal/view/ComponentView";
import {RenderState} from "core/internal/view/rendering/RenderState";
import {Line} from "core/internal/view/rendering/shapes/Line";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {Rect} from "math/Rect";
import {V, Vector} from "Vector";


export class ANDGateView extends ComponentView {
    public constructor(compID: GUID, state: RenderState) {
        super(compID, state, "and.svg");
    }

    protected override renderComponent(): void {
        const { circuit, renderer, options } = this.state;

        { // Render the ANDGate lines to visually match the input ports
            const { defaultBorderWidth } = options;
            const style = options.lineStyle(this.isSelected);

            const { inputPortGroups } = circuit.getObjectInfo("ANDGate") as DigitalComponentInfo;
    
            // Get current number of inputs
            const numInputs = [...circuit.getPortsForComponent(this.objID)]
                .map((id) => circuit.getPortByID(id))
                .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;
    
            const dy = (numInputs-1)/2*(0.5 - defaultBorderWidth/2);
            const y1 = -dy - defaultBorderWidth/2;
            const y2 =  dy + defaultBorderWidth/2;
    
            const x = -(this.size.x - defaultBorderWidth)/2;
    
            renderer.draw(new Line(V(x, y1), V(x, y2)), style);
        }
    }

    protected calcPortPosition(group: string, index: number): PartialPortPos {
        // Outputs
        if (group === "outputs")
            return { origin: V(0.5, 0), dir: V(1, 0) };
        if (group !== "inputs")
            throw new Error(`ANDGateView: Unknown group ${group}!`);
        // Inputs
        const amt = this.numPorts(group);
        const spacing = (0.5 - this.state.options.defaultBorderWidth/2);
        return { origin: V(-0.5, spacing*((amt-1)/2 - index)), dir: V(-1, 0) };
    }

    protected override getBounds(): Rect {
        throw new Error("Method not implemented.");
    }

    protected override get size(): Vector {
        return V(1, 1);
    }
}
