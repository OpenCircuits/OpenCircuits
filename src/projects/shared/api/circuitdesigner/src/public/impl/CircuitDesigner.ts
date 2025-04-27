import {SVGDrawing} from "svg2canvas";

import {Circuit}      from "shared/api/circuit/public";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {Tool}        from "shared/api/circuitdesigner/tools/Tool";

import {CircuitDesigner, CircuitDesignerOptions} from "../CircuitDesigner";
import {Viewport}                                from "../Viewport";
import {CircuitDesignerState}                    from "./CircuitDesignerState";
import {ViewportImpl}                            from "./Viewport";


export interface ToolConfig<T extends CircuitTypes = CircuitTypes> {
    defaultTool: DefaultTool<T>;
    tools: Tool[];
}

export class CircuitDesignerImpl<CircuitT extends Circuit, T extends CircuitTypes> implements CircuitDesigner {
    public readonly circuit: CircuitT;

    public readonly viewport: Viewport;

    protected readonly state: CircuitDesignerState<T>;

    public constructor(
        circuit: CircuitT,
        state: CircuitDesignerState<T>,
        svgMap: Map<string, SVGDrawing>,
        options: CircuitDesignerOptions,
    ) {
        this.circuit = circuit;
        this.state = state;

        this.viewport = new ViewportImpl(state, this, svgMap, options);
    }

    public set isLocked(locked: boolean) {
        this.state.isLocked = locked;
    }
    public get isLocked(): boolean {
        return this.state.isLocked;
    }

    public get curTool(): Tool | undefined {
        return this.state.toolManager.curTool;
    }

    public set curPressedObj(obj: T["Obj"] | undefined) {
        this.state.curPressedObj = obj;
    }
    public get curPressedObj(): T["Obj"] | undefined {
        return this.state.curPressedObj;
    }
}
