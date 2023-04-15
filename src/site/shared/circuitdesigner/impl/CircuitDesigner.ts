import {Circuit, Obj}    from "core/public";
import {DefaultTool}     from "shared/tools/DefaultTool";
import {ToolRenderer}    from "shared/tools/renderers/ToolRenderer";
import {Tool}            from "shared/tools/Tool";
import {Cursor}          from "shared/utils/input/Cursor";
import {InputAdapter}    from "shared/utils/input/InputAdapter";
import {CircuitDesigner} from "../CircuitDesigner";
import {ToolManager}     from "./ToolManager";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: Array<ToolRenderer<Tool | undefined>>;
}

export class CircuitDesignerImpl<CircuitT extends Circuit> implements CircuitDesigner<CircuitT> {
    public readonly circuit: CircuitT;

    public inputAdapter: InputAdapter;

    private readonly toolManager: ToolManager;

    private readonly state: {
        curPressedObj?: Obj;
        cursor?: Cursor;
    }

    public constructor(
        circuit: CircuitT,
        { defaultTool, tools, renderers }: ToolConfig,
    ) {
        this.circuit = circuit;

        this.inputAdapter = new InputAdapter();

        this.toolManager = new ToolManager(defaultTool, tools);

        this.state = {
            curPressedObj: undefined,
            cursor:        undefined,
        };

        // Setup tool manager
        this.inputAdapter.subscribe((ev) => this.toolManager.onEvent(ev, this));

        // Attach tool renderers
        if (renderers) {
            this.circuit.addRenderCallback(({ renderer, options, circuit }) => {
                renderers.forEach((toolRenderer) => {
                    const curTool = this.toolManager.curTool;
                    if (toolRenderer.isActive(curTool))
                        toolRenderer.render({ renderer, options, circuit, curTool, input: this.inputAdapter.state });
                });
            });
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

    public get worldMousePos() {
        return this.circuit.camera.toWorldPos(this.inputAdapter.state.mousePos);
    }

    public attachCanvas(canvas: HTMLCanvasElement): () => void {
        this.inputAdapter.setupOn(canvas);
        this.circuit.attachCanvas(canvas);
        return () => this.detachCanvas();
    }
    public detachCanvas(): void {
        this.inputAdapter.tearDown();
        this.circuit.detachCanvas();
    }
}
