import {SVGDrawing} from "svg2canvas";

import {Circuit}      from "shared/api/circuit/public";
import {CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";

import {Tool}        from "shared/api/circuitdesigner/tools/Tool";

import {CircuitDesigner, CircuitDesignerEv, CircuitDesignerOptions} from "../CircuitDesigner";
import {Viewport}                                from "../Viewport";
import {ViewportImpl}                            from "./Viewport";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {ToolManager} from "./ToolManager";


export class CircuitDesignerImpl<CircuitT extends Circuit, T extends CircuitTypes> extends ObservableImpl<CircuitDesignerEv> implements CircuitDesigner {
    public readonly circuit: CircuitT;
    protected readonly ctx: CircuitContext<T>;

    public readonly viewport: Viewport;

    protected readonly toolManager: ToolManager<T>;
    protected readonly state: { isLocked: boolean, curPressedObj?: T["Obj"] };

    public constructor(
        circuit: CircuitT,
        ctx: CircuitContext<T>,
        svgMap: Map<string, SVGDrawing>,
        options: CircuitDesignerOptions<T>,
    ) {
        super();

        this.circuit = circuit;
        this.ctx = ctx;

        this.toolManager = new ToolManager(options.toolConfig.defaultTool, options.toolConfig.tools);
        this.state = {
            isLocked:      false,
            curPressedObj: undefined,
        };

        this.viewport = new ViewportImpl(ctx, this, this.toolManager, svgMap, options);

        this.toolManager.defaultTool.subscribe((ev) => this.publish(ev));
        this.toolManager.subscribe((ev) => this.publish(ev));
    }

    public set isLocked(locked: boolean) {
        this.state.isLocked = locked;
    }
    public get isLocked(): boolean {
        return this.state.isLocked;
    }

    public get curTool(): Tool | undefined {
        return this.toolManager.curTool;
    }

    public set curPressedObj(obj: T["Obj"] | undefined) {
        this.state.curPressedObj = obj;
    }
    public get curPressedObj(): T["Obj"] | undefined {
        return this.state.curPressedObj;
    }
}
