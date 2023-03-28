import {Circuit, Obj}    from "core/public";
import {DefaultTool}     from "shared/tools/DefaultTool";
import {ToolRenderer}    from "shared/tools/renderers/ToolRenderer";
import {Tool}            from "shared/tools/Tool";
import {Cursor}          from "shared/utils/input/Cursor";
import {InputManager}    from "shared/utils/input/InputManager";
import {CircuitDesigner} from "../CircuitDesigner";
import {ToolManager}     from "./ToolManager";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: Array<ToolRenderer<Tool>>;
}

export class CircuitDesignerImpl<Circ extends Circuit> implements CircuitDesigner<Circ> {
    public readonly circuit: Circ;

    public inputManager: InputManager;

    private readonly toolManager: ToolManager;

    private readonly state: {
        curPressedObj?: Obj;
        cursor?: Cursor;
    }

    public constructor(
        circuit: Circ,
        { defaultTool, tools, renderers }: ToolConfig,
    ) {
        this.circuit = circuit;

        this.inputManager = new InputManager();

        this.toolManager = new ToolManager(defaultTool, tools);

        this.state = {
            curPressedObj: undefined,
            cursor:        undefined,
        };

        // Setup input manager to attach to the Circuit's canvas
        if (circuit.canvas)
            this.inputManager.setupOn(circuit.canvas);

        circuit.subscribe((ev) => {
            if (ev.type === "attachCanvas")
                this.inputManager.setupOn(ev.canvas);
            if (ev.type === "detachCanvas")
                this.inputManager.tearDown();
        });

        // Setup tool manager
        this.inputManager.subscribe((ev) => this.toolManager.onEvent(ev, this));

        // Attach tool renderers
        if (renderers) {
            this.circuit.addRenderCallback(({ renderer, options, circuit }) => {
                renderers.forEach((toolRenderer) => {
                    const curTool = this.toolManager.curTool;
                    if (toolRenderer.isActive(curTool))
                        toolRenderer.render({ renderer, options, circuit, curTool, input: this.inputManager.state });
                });
            })
        }
    }

    public get curPressedObj() {
        return this.state.curPressedObj;
    }
    public set curPressedObj(obj: Obj | undefined) {
        this.state.curPressedObj = obj;
    }

    public get cursor() {
        return this.state.cursor;
    }
    public set cursor(cursor: Cursor | undefined) {
        this.state.cursor = cursor;
    }
}
